import path from "path";
import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_LOGO_PATH = path.join(
    process.cwd(),
    "public",
    "image",
    "logo2.png"
);

const CACHE_CONTROL_HEADER = "no-store, max-age=0";

type SiteSettingsResponse = {
    data?: {
        logo?: string | null;
    } | null;
};

function buildApiBaseUrl() {
    return (API_URL ?? "").replace(/\/$/, "");
}

function buildLogoUrl(logo: string, apiBase: string) {
    try {
        return new URL(logo, apiBase).toString();
    } catch {
        return "";
    }
}

async function createFallbackLogoResponse() {
    const fallbackLogo = await readFile(FALLBACK_LOGO_PATH);

    return new NextResponse(fallbackLogo, {
        headers: {
            "Content-Type": "image/png",
            "Cache-Control": CACHE_CONTROL_HEADER,
        },
    });
}

export async function GET() {
    try {
        const apiBase = buildApiBaseUrl();

        if (!apiBase) {
            return createFallbackLogoResponse();
        }

        const siteSettingsResponse = await fetch(
            `${apiBase}/site-settings/current`,
            {
                cache: "no-store",
            }
        );

        if (!siteSettingsResponse.ok) {
            return createFallbackLogoResponse();
        }

        const siteSettings: SiteSettingsResponse =
            await siteSettingsResponse.json();

        const backendLogo = siteSettings.data?.logo?.trim() || "";

        if (!backendLogo) {
            return createFallbackLogoResponse();
        }

        const logoUrl = buildLogoUrl(backendLogo, apiBase);

        if (!logoUrl) {
            return createFallbackLogoResponse();
        }

        const logoResponse = await fetch(logoUrl, {
            cache: "no-store",
        });

        if (!logoResponse.ok) {
            return createFallbackLogoResponse();
        }

        const logoBuffer = await logoResponse.arrayBuffer();
        const contentType =
            logoResponse.headers.get("content-type") || "image/png";

        return new NextResponse(logoBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": CACHE_CONTROL_HEADER,
            },
        });
    } catch (error) {
        console.error("site-logo proxy error:", error);
        return createFallbackLogoResponse();
    }
}