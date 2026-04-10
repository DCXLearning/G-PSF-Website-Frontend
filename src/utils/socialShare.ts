const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gpsf.datacolabx.com"
).replace(/\/$/, "");

export function buildPathWithQuery(
  pathname: string,
  query: Record<string, string>,
) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

export function buildAbsoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl) {
    return SITE_URL;
  }

  return new URL(pathOrUrl, `${SITE_URL}/`).toString();
}

export function buildFacebookShareUrl(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function buildTelegramShareUrl(url: string, text: string) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
}
