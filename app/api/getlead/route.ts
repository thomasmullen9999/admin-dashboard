import { NextResponse } from "next/server";

/**
 * GET /api/getpcpdata
 *
 * Proxies to the external backend API to retrieve all PCP leads.
 * Returns lightweight core rows used to populate the admin table.
 *
 * The full detail for a single lead is fetched separately on demand
 * via GET /api/getpcpdata/[id].
 *
 * Response shape (forwarded from backend):
 * {
 *   leads: PCPLeadCore[]
 * }
 */
export async function GET() {
  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}/getlead`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // If your backend requires an API key, add it here:
        // "Authorization": `Bearer ${process.env.BACKEND_API_KEY}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(
        `[GET /api/getpcpdata] Backend responded with ${res.status}`,
      );
      return NextResponse.json(
        { error: `Backend error: ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();

    // Forward the backend response directly to the frontend.
    // If the backend shape differs from PCPLeadCore, transform it here
    // before returning rather than in the frontend.
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/getpcpdata]", error);
    return NextResponse.json(
      { error: "Failed to fetch PCP leads from backend." },
      { status: 500 },
    );
  }
}
