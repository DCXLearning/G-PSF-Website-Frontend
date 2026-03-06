/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api-gpsf.datacolabx.com/api/v1/sections/page/home",
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Upstream API failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}