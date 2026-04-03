import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

function getSafeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function getFileNameFromUrl(fileUrl: string): string {
  try {
    const url = new URL(fileUrl);
    const pathname = url.pathname;
    const rawName = pathname.split("/").pop() ?? "document";

    return getSafeFileName(rawName) || "document";
  } catch {
    return "document";
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url")?.trim() ?? "";
    const fileNameParam = searchParams.get("filename")?.trim() ?? "";

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, message: "Missing file url" },
        { status: 400 }
      );
    }

    let targetUrl: URL;

    try {
      targetUrl = new URL(fileUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid file url" },
        { status: 400 }
      );
    }

    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return NextResponse.json(
        { success: false, message: "Unsupported file protocol" },
        { status: 400 }
      );
    }

    const upstreamResponse = await fetch(targetUrl.toString(), {
      cache: "no-store",
      headers: {
        Accept: "*/*",
      },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json(
        { success: false, message: `Upstream error ${upstreamResponse.status}` },
        { status: 502 }
      );
    }

    const contentType =
      upstreamResponse.headers.get("content-type") || "application/octet-stream";
    const contentLength = upstreamResponse.headers.get("content-length");
    const fileName =
      getSafeFileName(fileNameParam) || getFileNameFromUrl(targetUrl.toString());

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(
        fileName
      )}`
    );

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Download failed";

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
