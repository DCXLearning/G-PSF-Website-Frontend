import { NextResponse } from "next/server";
import { API_URL } from "@/config/api";

type I18n = {
    en?: string;
    km?: string;
};

type EventBlock = {
    id?: number;
    type?: string;
    enabled?: boolean;
    title?: I18n;
    settings?: {
        limit?: number;
        categoryIds?: number[];
    } | null;
    posts?: unknown[];
};

type SectionResponse = {
    success?: boolean;
    message?: string;
    data?: {
        blocks?: EventBlock[];
    };
};

const FALLBACK_API_URL = "https://api-gpsf.datacolabx.com/api/v1";

function normalizeText(value?: string) {
    return value?.trim().toLowerCase() || "";
}

function isEventBlock(block: EventBlock) {
    const englishTitle = normalizeText(block.title?.en);

    return (
        block.enabled !== false &&
        block.type === "post_list" &&
        englishTitle === "event & meetings schedule"
    );
}

export async function GET() {

    const url = `${API_URL || FALLBACK_API_URL}/pages/working-groups/section`;

    try {
        const res = await fetch(url, {
            cache: "no-store",
            headers: { Accept: "application/json" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { success: false, message: `Upstream error ${res.status}`, data: [] },
                { status: 502 }
            );
        }

        const json = (await res.json()) as SectionResponse;
        const blocks = Array.isArray(json.data?.blocks) ? json.data?.blocks : [];

        const eventBlock = blocks.find(isEventBlock);

        return NextResponse.json(
            {
                success: true,
                message: "OK",
                sectionId: eventBlock?.id ?? null,
                sectionTitle: eventBlock?.title ?? null,
                limit: eventBlock?.settings?.limit ?? null,
                data: Array.isArray(eventBlock?.posts) ? eventBlock?.posts : [],
            },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch events";

        return NextResponse.json(
            {
                success: false,
                message,
                sectionId: null,
                sectionTitle: null,
                limit: null,
                data: [],
            },
            { status: 500 }
        );
    }
}
