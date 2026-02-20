// app/api/pcp-leads/update-status/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, status } = body;

    if (!leadId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing leadId or status" },
        { status: 400 },
      );
    }

    // Forward the update to the external backend
    // Assuming the external backend has a corresponding endpoint or handles updates via POST
    const response = await fetch(
      `https://common-backend-maddison-clarke-production.up.railway.app/api/v1/admin/pcp/lead/update-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId, status }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          message:
            errorData.message || "Failed to update status on external backend",
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
