import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const FALLBACK_API_BASE = "https://api-gpsf.datacolabx.com/api/v1";

const ROUTE_OVERRIDES: Record<string, string> = {
    "/home": "/",
    "/featured": "/feature",
    "/laws-regulations": "/publication/laws-regulations",
    "/decisions": "/publication/decisions",
    "/reports": "/publication/reports",
    "/reform-tracker": "/publication/reform-tracker",
    "/press": "/new-update/media/press",
    "/photos": "/new-update/media/photos",
    "/videos": "/new-update/media/video",
    "/video": "/new-update/media/video",
};

type ApiMenuItem = {
    id?: number;
    label?: {
        en?: string;
        km?: string;
    };
    url?: string;
    orderIndex?: number;
    parentId?: number | null;
    children?: ApiMenuItem[];
};

function normalizeHref(url?: string) {
    if (!url) return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;

    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;

    return ROUTE_OVERRIDES[normalizedUrl] ?? normalizedUrl;
}

function normalizeMenuItems(items: ApiMenuItem[] = []): ApiMenuItem[] {
    return [...items]
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((item) => ({
            id: item.id,
            label: {
                // Keep both languages so the header can switch instantly without refetching.
                en: item.label?.en || item.label?.km || "Untitled",
                km: item.label?.km || item.label?.en || "Untitled",
            },
            url: normalizeHref(item.url),
            orderIndex: item.orderIndex ?? 0,
            parentId: item.parentId ?? null,
            children: normalizeMenuItems(item.children),
        }));
}

export async function GET() {
    try {
        const apiBase = (
            process.env.API_URL ||
            process.env.NEXT_PUBLIC_API_URL ||
            FALLBACK_API_BASE
        ).replace(/\/$/, "");
        const response = await fetch(`${apiBase}/menus/slug/main-nav/tree`, {
            method: "GET",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        const result = await response.json();
        const items = normalizeMenuItems(result?.data?.items);

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
        console.error("Main nav API fetch error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch main navigation data",
                data: {
                    menu: null,
                    items: [],
                },
            },
            { status: 500 }
        );
    }
}
