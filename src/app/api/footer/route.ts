import { NextResponse } from "next/server";

const FOOTER_API_URL =
    "https://api-gpsf.datacolabx.com/api/v1/menus/slug/key-update/tree";

export async function GET() {
    try {
        const response = await fetch(FOOTER_API_URL, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("Footer API fetch error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch footer data",
                data: null,
            },
            { status: 500 }
        );
    }
}