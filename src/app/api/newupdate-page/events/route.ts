// app/api/newupdate-page/events/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch("https://api-gpsf.datacolabx.com/api/v1/posts/category/8");
        const data = await res.json();
        return NextResponse.json({ data: data.data || [] });
    } catch (err) {
        return NextResponse.json({ data: [], message: "Failed to fetch events" }, { status: 500 });
    }
}