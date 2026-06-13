/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  try {
    const apiBase = (API_URL ?? "").replace(/\/$/, "");

    if (!apiBase) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_API_URL is not configured" },
        { status: 500 }
      );
    }

    const res = await fetch(`${apiBase}/posts/category/18`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
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