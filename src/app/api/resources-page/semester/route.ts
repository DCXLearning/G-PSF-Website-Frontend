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

    const res = await fetch(`${apiBase}/posts/category/17`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch external API" },
        { status: 500 }
      );
    }

    const json = await res.json();

    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}