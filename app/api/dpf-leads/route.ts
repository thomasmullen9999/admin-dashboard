import { NextResponse } from "next/server";

export async function GET() {
  try {
    /*     const response = await fetch("example/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch leads");
    }

    const data = await response.json();

    return NextResponse.json(data); */

    const mockData = {
      success: true,
      data: {
        dpfLeads: [
          {
            id: "cmlqvcfiu0089s98s98snhhs",
            token_id: "126gd",
            lead_status: "nurture",
            createdAt: "2026-02-17T17:20:07.830Z",
            lead_sold_timestamp: null,
            completed_steps: 3,
            campaignUser: {
              email: "test@gmail.com",
              phoneNumber: "750000000",
              name: "DPF Tester",
            },
            vehicleRegistration: "XY34ZAB",
            vehicleMake: "BMW",
            vehicleModel: "X5",
            leasePurchaseDate: "2023-09-01",
            acceptedDBA: "N",
            timestamp: "2024-01-15 08:30",
          },
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 1,
          totalPages: 1,
        },
      },
    };

    return NextResponse.json(mockData);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to fetch leads" },
      { status: 500 },
    );
  }
}
