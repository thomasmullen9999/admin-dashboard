import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function POST(
  request: NextRequest,
  { params }: { params: { leadId: string } },
) {
  const { leadId } = params;
  const token = request.headers.get("authorization");

  try {
    const body = await request.json();

    const res = await fetch(
      `${BACKEND_URL}/api/v1/admin/pcp/lead/send-email/${leadId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("send-email error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
