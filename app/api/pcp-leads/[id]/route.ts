import { NextRequest, NextResponse } from "next/server";

const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL!;

interface ExternalLeadResponse {
  success: boolean;
  data: {
    pcpLead: {
      id: string;
      lead_status: string;
      claim_status: string;
      completed_steps: number;
      kycDecision: {
        decision: string;
        decisionText: string;
        decisionReasons: string[];
      };
      formData: {
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
      };
    };
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, message: "Lead ID is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://common-backend-maddison-clarke-production.up.railway.app/api/v1/admin/pcp/lead/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    console.log;

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch lead" },
        { status: response.status },
      );
    }

    const data: ExternalLeadResponse = await response.json();

    console.log(data, "pcp data");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Lead fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
