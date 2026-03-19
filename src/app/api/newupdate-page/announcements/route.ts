/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const API_URL = "https://api-gpsf.datacolabx.com/api/v1/posts/category/18";

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `External API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const list = data?.data || data;

    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}