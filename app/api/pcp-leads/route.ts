import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://common-backend-maddison-clarke-production.up.railway.app/api/v1/admin/pcp/all-leads",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch leads");
    }

    const data = await response.json();

    return NextResponse.json(data);

    /*     const mockData = {
      success: true,
      data: {
        pcpLeads: [
          {
            id: "cmlqvcfiu0002wq8d30pbk073",
            token_id: "o4vEG",
            lead_status: "check_signature",
            createdAt: "2026-02-17T17:20:07.830Z",
            lead_sold_timestamp: null,
            completed_steps: 3,
            campaignUser: {
              email: "test@gmail.com",
              phoneNumber: "750000000",
              name: "Steven Tester",
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      },
    }; */

    // return NextResponse.json(mockData);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to fetch leads" },
      { status: 500 },
    );
  }
}
