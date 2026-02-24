import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const base = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001").replace(/\/$/, "");
    const url = `${base}/api/v1/contact`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json().catch(() => ({}))
      : await res.text().catch(() => "");

    return NextResponse.json(
      typeof data === "string" ? { message: data } : data,
      { status: res.status }
    );
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message || "Invalid request" },
      { status: 400 }
    );
  }
}