import { ImageResponse } from "next/og";
import {
    cleanText,
    getNewsCmsPost,
    mapPostToDetail,
    pickPrimaryImage,
} from "@/lib/newsUpdateDetail";
import { buildAbsoluteUrl } from "@/utils/socialShare";

export const runtime = "nodejs";
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = "image/png";

const GOOGLE_FONTS_USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function truncateText(value: string, limit: number) {
    if (value.length <= limit) {
        return value;
    }

    return `${value.slice(0, limit - 1).trim()}…`;
}

async function loadGoogleFont(text: string, weight: 400 | 700) {
    const url = new URL("https://fonts.googleapis.com/css2");
    url.searchParams.set("family", `Kantumruy Pro:wght@${weight}`);
    url.searchParams.set("display", "swap");
    url.searchParams.set("text", text);

    const cssResponse = await fetch(url.toString(), {
        headers: {
            "User-Agent": GOOGLE_FONTS_USER_AGENT,
        },
        cache: "force-cache",
    });

    if (!cssResponse.ok) {
        return null;
    }

    const css = await cssResponse.text();
    const fontMatch = css.match(/src: url\((https:[^)]+)\) format\('(opentype|truetype|woff2)'\)/);

    if (!fontMatch) {
        return null;
    }

    const fontResponse = await fetch(fontMatch[1], {
        cache: "force-cache",
    });

    if (!fontResponse.ok) {
        return null;
    }

    return fontResponse.arrayBuffer();
}

async function fetchImageDataUrl(src: string) {
    const imageUrl = cleanText(src);

    if (!imageUrl) {
        return "";
    }

    try {
        const response = await fetch(buildAbsoluteUrl(imageUrl), {
            cache: "no-store",
        });

        if (!response.ok) {
            return "";
        }

        const contentTypeHeader = response.headers.get("content-type") || "image/jpeg";
        const imageBuffer = Buffer.from(await response.arrayBuffer());

        return `data:${contentTypeHeader};base64,${imageBuffer.toString("base64")}`;
    } catch {
        return "";
    }
}

type PageProps = {
    params: Promise<{
        id: string;
        slug: string;
    }>;
};

export default async function Image({ params }: PageProps) {
    const { id, slug } = await params;
    const post = await getNewsCmsPost(slug, id);

    const detailData = post ? mapPostToDetail(post) : null;
    const title = detailData?.title || "News & Updates";
    const summary =
        truncateText(detailData?.summary || "Latest news and updates from G-PSF Cambodia.", 180);
    const coverImageDataUrl = post ? await fetchImageDataUrl(pickPrimaryImage(post)) : "";
    const fontText = `${title} ${summary} G-PSF Cambodia News & Updates`;

    const [regularFont, boldFont] = await Promise.all([
        loadGoogleFont(fontText, 400),
        loadGoogleFont(fontText, 700),
    ]);

    const fonts: Array<{
        name: string;
        data: ArrayBuffer;
        style: "normal";
        weight: 400 | 700;
    }> = [];

    if (regularFont) {
        fonts.push({
            name: "Kantumruy Pro",
            data: regularFont,
            style: "normal",
            weight: 400,
        });
    }

    if (boldFont) {
        fonts.push({
            name: "Kantumruy Pro",
            data: boldFont,
            style: "normal",
            weight: 700,
        });
    }

    return new ImageResponse(
        (
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    background: "#0f1637",
                    fontFamily: "Kantumruy Pro",
                }}
            >
                {coverImageDataUrl ? (
                    <img
                        src={coverImageDataUrl}
                        alt=""
                        style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                ) : null}

                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: coverImageDataUrl
                            ? "linear-gradient(180deg, rgba(15,22,55,0.12) 0%, rgba(15,22,55,0.52) 50%, rgba(15,22,55,0.92) 100%)"
                            : "linear-gradient(135deg, #10204d 0%, #243b83 100%)",
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        width: "100%",
                        height: "100%",
                        padding: "56px",
                        color: "#ffffff",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 28,
                                    fontWeight: 700,
                                }}
                            >
                                G-PSF Cambodia
                            </div>
                            <div
                                style={{
                                    fontSize: 20,
                                    opacity: 0.88,
                                }}
                            >
                                News & Updates
                            </div>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "12px 18px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.18)",
                                fontSize: 20,
                                fontWeight: 700,
                            }}
                        >
                            Article
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "18px",
                            maxWidth: "86%",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                fontSize: 58,
                                lineHeight: 1.08,
                                fontWeight: 700,
                                textShadow: "0 4px 30px rgba(0,0,0,0.25)",
                            }}
                        >
                            {truncateText(title, 120)}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                fontSize: 28,
                                lineHeight: 1.32,
                                opacity: 0.92,
                                textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                            }}
                        >
                            {summary}
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
            fonts,
        }
    );
}
