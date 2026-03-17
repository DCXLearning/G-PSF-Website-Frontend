import { NextResponse } from "next/server";

const API_URL = "https://api-gpsf.datacolabx.com/api/v1/posts/category/4";

export async function GET() {
    try {
        const res = await fetch(API_URL, {
            cache: "no-store",
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: "Failed to fetch upstream API" },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Proxy API error:", error);

        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}