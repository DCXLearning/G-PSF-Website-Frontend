// app/api/news-updates/route.ts

import { NextResponse } from "next/server";

const EXTERNAL_API_URL =
    "https://api-gpsf.datacolabx.com/api/v1/pages/news-and-updates/section";

export async function GET() {
    try {
        const response = await fetch(EXTERNAL_API_URL, {
            cache: "no-store", // prevent Next cache issues
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    message: `External API failed (${response.status})`,
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Safe validation (no crashes)
        if (!data?.data?.blocks?.[0]?.posts) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid API structure",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (err: unknown) {
        console.error("News Updates API Error:", err);

        return NextResponse.json(
            {
                success: false,
                message: "Server error while fetching news updates",
            },
            { status: 500 }
        );
    }
}
