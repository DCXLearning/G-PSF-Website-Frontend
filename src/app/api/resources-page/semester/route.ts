import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api-gpsf.datacolabx.com/api/v1/posts/category/17",
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch external API" },
        { status: 500 }
      );
    }

    const json = await res.json();

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}