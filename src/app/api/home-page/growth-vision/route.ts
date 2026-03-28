/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const UPSTREAM = `${API_URL}/sections/page/home`;

export async function GET() {
  try {
    if (!API_URL) {
      return NextResponse.json(
        { success: false, message: "Missing API_URL in environment" },
        { status: 500 }
      );
    }

    const res = await fetch(UPSTREAM, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await res.text();

    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || `Upstream API failed: ${res.status}`,
          upstreamStatus: res.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}