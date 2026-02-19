import { NextResponse } from "next/server";

/**
 * GET /api/getpcpdata/[id]
 *
 * Proxies to the external backend API to retrieve the full detail record
 * for a single PCP lead, including credit check, claims, marketing/meta
 * and signature data.
 *
 * Called on demand when the user clicks "View Details" for a PCP row —
 * the frontend never calls the backend directly.
 *
 * Response shape (forwarded from backend):
 * {
 *   lead: PCPLeadDetail
 * }
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing lead id." }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.BACKEND_API_URL}/getlead/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // If your backend requires an API key, add it here:
        // "Authorization": `Bearer ${process.env.BACKEND_API_KEY}`,
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    if (!res.ok) {
      console.error(
        `[GET /api/getpcpdata/${id}] Backend responded with ${res.status}`,
      );
      return NextResponse.json(
        { error: `Backend error: ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();

    // Forward the backend response directly to the frontend.
    // If the backend shape differs from PCPLeadDetail, transform it here
    // before returning rather than in the frontend.
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[GET /api/getpcpdata/${id}]`, error);
    return NextResponse.json(
      { error: "Failed to fetch PCP lead detail from backend." },
      { status: 500 },
    );
  }
}
