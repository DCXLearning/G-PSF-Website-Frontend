/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = API_URL || "";
const UPSTREAM = `${API_BASE}/pages/news-and-updates/section`;

export async function GET() {
  try {
    if (!API_BASE) {
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

    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: json?.message || `Upstream error ${res.status}`,
          upstreamStatus: res.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(json, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Fetch failed" },
      { status: 500 }
    );
  }
}