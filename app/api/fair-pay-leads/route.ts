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
        fairPayLeads: [
          {
            id: "1",
            lead_id: "LEAD-001",
            email: "john@morrisons.com",
            phone: "07123456789",
            campaign: "morrisons",
            status: "sold",
            name: "John Doe",
            createdAt: "2024-01-10 13:22",
            soldAt: "2024-01-10 14:22",
            step: "Step 3",
            dob: "1985-05-12",
            address: "123 Main St, London",
            marketing: "Opt-in",
            privacyPolicy: "Accepted",
            stillWorksInStore: "Y",
            dateLeft: "",
            storeLocation: "Morrisons London",
            niNumber: "AB123456C",
            employeeNumber: "EMP001",
            acceptedDBA: "Y",
            timestamp: "2024-01-10 13:22",
          },
          {
            id: "2",
            lead_id: "LEAD-002",
            email: "jane@asda.com",
            phone: "07987654321",
            campaign: "asda",
            status: "nurture",
            name: "Jane Smith",
            createdAt: "2024-01-12 09:10",
            step: "Step 1",
            dob: "1990-03-20",
            address: "456 High St, Birmingham",
            marketing: "Opt-in",
            privacyPolicy: "Accepted",
            stillWorksInStore: "N",
            dateLeft: "2023-12-01",
            storeLocation: "Asda Birmingham",
            niNumber: "CD234567D",
            employeeNumber: "EMP002",
            acceptedDBA: "N",
            timestamp: "2024-01-12 09:10",
          },
          {
            id: "5",
            lead_id: "LEAD-005",
            email: "next@test.com",
            phone: "07011111111",
            campaign: "next",
            status: "sold",
            name: "Next Lead",
            createdAt: "2024-02-01 10:00",
            soldAt: "2024-02-01 12:00",
            step: "Step 4",
            dob: "1988-08-08",
            address: "789 Market St, Leeds",
            marketing: "Opt-out",
            privacyPolicy: "Accepted",
            stillWorksInStore: "Y",
            dateLeft: "",
            storeLocation: "Next Leeds",
            niNumber: "EF345678E",
            employeeNumber: "EMP005",
            acceptedDBA: "Y",
            timestamp: "2024-02-01 10:00",
          },
          {
            id: "6",
            lead_id: "LEAD-006",
            email: "sainsbury@test.com",
            phone: "07022222222",
            campaign: "sainsburys",
            status: "nurture",
            name: "Sainsbury Lead",
            createdAt: "2024-02-02 14:00",
            step: "Step 2",
            dob: "1992-12-12",
            address: "321 High Rd, Manchester",
            marketing: "Opt-in",
            privacyPolicy: "Accepted",
            stillWorksInStore: "N",
            dateLeft: "2024-01-15",
            storeLocation: "Sainsburys Manchester",
            niNumber: "GH456789F",
            employeeNumber: "EMP006",
            acceptedDBA: "N",
            timestamp: "2024-02-02 14:00",
          },
          {
            id: "7",
            lead_id: "LEAD-007",
            email: "test1@morrisons.com",
            phone: "07123456780",
            campaign: "morrisons",
            status: "sold",
            name: "Alice Johnson",
            createdAt: "2024-02-03 10:00",
            soldAt: "2024-02-03 11:30",
            step: "Step 3",
          },
          {
            id: "8",
            lead_id: "LEAD-008",
            email: "test2@asda.com",
            phone: "07123456781",
            campaign: "asda",
            status: "nurture",
            name: "Bob Wilson",
            createdAt: "2024-02-03 11:00",
            step: "Step 1",
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
