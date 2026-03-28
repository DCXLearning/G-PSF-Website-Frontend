/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

const API_BASE = API_URL || "";
const BASE_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");
const UPSTREAM = `${API_BASE}/logo`;

function toAbsoluteUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BASE_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

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
          message: data?.message || `Upstream API error: ${res.status}`,
          upstreamStatus: res.status,
        },
        { status: 502 }
      );
    }

    if (data?.data?.logos && Array.isArray(data.data.logos)) {
      data.data.logos = data.data.logos.map((logo: any) => ({
        ...logo,
        url: toAbsoluteUrl(logo?.url),
      }));
    }

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to fetch logos" },
      { status: 500 }
    );
  }
}