import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
    try {
        const res = await fetch(
            "https://api-gpsf.datacolabx.com/api/v1/pages/about-us/section",
            {
                cache: "no-store",
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${res.status}` },
                { status: 502 }
            );
        }

        const data = await res.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error?.message || "Fetch failed" },
            { status: 500 }
        );
    }
}