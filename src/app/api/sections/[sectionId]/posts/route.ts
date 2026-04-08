import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

type RouteContext = {
  params: Promise<{
    sectionId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { sectionId } = await context.params;
    const apiBase =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      FALLBACK_API_BASE;

    const response = await fetch(
      `${apiBase}/sections/${encodeURIComponent(sectionId)}/posts`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: `Upstream error ${response.status}` },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch failed";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
