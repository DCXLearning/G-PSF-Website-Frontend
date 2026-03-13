import { NextResponse } from "next/server";

const QUICK_LINK_API_URL =
    "https://api-gpsf.datacolabx.com/api/v1/menus/slug/quick-link/tree";

function normalizeHref(url?: string) {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    if (url === "/mis-portala") return "/mis-portal";

    return url.startsWith("/") ? url : `/${url}`;
}

export async function GET() {
    try {
        const response = await fetch(QUICK_LINK_API_URL, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        const result = await response.json();

        const items = Array.isArray(result?.data?.items)
            ? result.data.items
                  .sort(
                      (a: { orderIndex?: number }, b: { orderIndex?: number }) =>
                          (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
                  )
                  .map(
                      (item: {
                          id: number;
                          label?: { en?: string; km?: string };
                          url?: string;
                          orderIndex?: number;
                          parentId?: number | null;
                          children?: unknown[];
                      }) => ({
                          id: item.id,
                          label: {
                              en: item.label?.en || "Untitled",
                              km: item.label?.km || item.label?.en || "Untitled",
                          },
                          url: normalizeHref(item.url),
                          orderIndex: item.orderIndex ?? 0,
                          parentId: item.parentId ?? null,
                          children: item.children ?? [],
                      })
                  )
            : [];

        return NextResponse.json(
            {
                success: true,
                message: "OK",
                data: {
                    menu: result?.data?.menu ?? null,
                    items,
                },
            },
            { status: response.status }
        );
    } catch (error) {
        console.error("Quick Link API fetch error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch quick link data",
                data: {
                    menu: null,
                    items: [],
                },
            },
            { status: 500 }
        );
    }
}