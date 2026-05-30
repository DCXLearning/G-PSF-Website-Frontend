"use client";

import React, { type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";
import { FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import {
  buildFacebookShareUrl,
  buildTelegramShareUrl,
} from "@/utils/socialShare";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export type TiptapMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type?: string;
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
};

type UiLang = "en" | "kh";

type LocalizedText = {
  en?: string | null;
  km?: string | null;
  kh?: string | null;
};

type MaybeLocalizedText = string | LocalizedText | null | undefined;

type ApiCategory = {
  id?: number;
  name?: LocalizedText | null;
};

type MaybeCategory = string | LocalizedText | ApiCategory | null | undefined;

type LocalizedContentDoc = {
  en?: TiptapNode | null;
  km?: TiptapNode | null;
  kh?: TiptapNode | null;
};

export type DetailPageData = {
  category?: MaybeCategory;
  date: string;
  dateValue?: string;
  title: MaybeLocalizedText;
  heroImage?: string;
  tagLabel?: MaybeCategory;
  tagHref: string;
  summary?: MaybeLocalizedText;
  contentDoc?: TiptapNode | LocalizedContentDoc | null;
  shareUrl: string;
};

type DetailPageProps = {
  data: DetailPageData;
};

type ImageSlide = {
  key: string;
  src: string;
  alt: string;
};

function normalizeUiLang(value: unknown): UiLang {
  const lang = String(value || "en").toLowerCase();
  return lang === "kh" || lang === "km" ? "kh" : "en";
}

function getTitleFontClass(lang: UiLang) {
  return lang === "kh" ? "title-km khmer-font" : "title-en airbnb-font";
}

function getBodyFontClass(lang: UiLang) {
  return lang === "kh" ? "body-km khmer-font" : "body-en airbnb-font";
}

function isLocalizedObject(value: unknown): value is LocalizedText {
  return (
    typeof value === "object" &&
    value !== null &&
    ("en" in value || "km" in value || "kh" in value)
  );
}

function isApiCategory(value: unknown): value is ApiCategory {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as ApiCategory).name === "object"
  );
}

function pickLocalizedText(
  value: MaybeLocalizedText,
  lang: UiLang,
  fallback = ""
): string {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value;
  }

  if (lang === "kh") {
    return value.km || value.kh || value.en || fallback;
  }

  return value.en || value.km || value.kh || fallback;
}

function pickCategoryText(
  value: MaybeCategory,
  lang: UiLang,
  fallback = ""
): string {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value;
  }

  if (isApiCategory(value)) {
    return pickLocalizedText(value.name, lang, fallback);
  }

  if (isLocalizedObject(value)) {
    return pickLocalizedText(value, lang, fallback);
  }

  return fallback;
}

function isLocalizedContentDoc(value: unknown): value is LocalizedContentDoc {
  return (
    typeof value === "object" &&
    value !== null &&
    ("en" in value || "km" in value || "kh" in value)
  );
}

function isTiptapDoc(value: unknown): value is TiptapNode {
  return (
    typeof value === "object" &&
    value !== null &&
    ((value as TiptapNode).type === "doc" ||
      Array.isArray((value as TiptapNode).content))
  );
}

function pickContentDoc(
  value: DetailPageData["contentDoc"],
  lang: UiLang
): TiptapNode | null {
  if (!value) return null;

  if (isTiptapDoc(value)) {
    return value;
  }

  if (isLocalizedContentDoc(value)) {
    if (lang === "kh") {
      return value.km || value.kh || value.en || null;
    }

    return value.en || value.km || value.kh || null;
  }

  return null;
}

export default function DetailPage({ data }: DetailPageProps) {
  const { language } = useLanguage();

  const uiLang = normalizeUiLang(language);
  const dateLang = uiLang;

  const selectedContentDoc = pickContentDoc(data.contentDoc, uiLang);

  const titleText = pickLocalizedText(
    data.title,
    uiLang,
    uiLang === "kh" ? "គ្មានចំណងជើង" : "No title"
  );

  const categoryText = pickCategoryText(
    data.category,
    uiLang,
    uiLang === "kh" ? "សារព័ត៌មាន" : "Press"
  );

  const tagLabelText = pickCategoryText(
    data.tagLabel ?? data.category,
    uiLang,
    uiLang === "kh" ? "សារព័ត៌មាន" : "Press"
  );

  const summaryText = pickLocalizedText(data.summary, uiLang, "");

  const contentLang: UiLang =
    shouldUseKhmerFont({
      title: titleText,
      category: categoryText,
      tagLabel: tagLabelText,
      summary: summaryText,
      contentDoc: selectedContentDoc,
    }) || uiLang === "kh"
      ? "kh"
      : "en";

  const titleFontClass = getTitleFontClass(contentLang);
  const bodyFontClass = getBodyFontClass(contentLang);

  const shareLabel = uiLang === "kh" ? "ចែករំលែក៖" : "Share:";

  const hasDocContent =
    Array.isArray(selectedContentDoc?.content) &&
    selectedContentDoc.content.length > 0;

  const facebookShareUrl = buildFacebookShareUrl(data.shareUrl);
  const telegramShareUrl = buildTelegramShareUrl(data.shareUrl, titleText);

  const dateText = formatLocalizedDate(data.dateValue || data.date, dateLang);

  return (
    <section
      className={`bg-white ${
        contentLang === "kh" ? "khmer-font" : "airbnb-font"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-8 pt-8">
        <div className="inline-flex flex-col">
          <span
            className={`text-slate-700 ${bodyFontClass}`}
            style={{ fontWeight: 600 }}
          >
            {categoryText}
          </span>
          <span className="mt-1 h-[3px] w-20 rounded-full bg-amber-500" />
        </div>

        <h1
          className={`mt-4 max-w-5xl tracking-tight text-[#0f1637] ${titleFontClass}`}
          style={{ fontWeight: 600 }}
        >
          {titleText}
        </h1>

        <div
          className={`mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-slate-600 ${bodyFontClass}`}
          style={{ fontWeight: 400 }}
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>{dateText}</span>
          </div>

          <Link
            href={data.tagHref}
            className={`inline-flex items-center gap-3 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50 ${bodyFontClass}`}
            style={{ fontWeight: 600 }}
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-amber-50 text-amber-600">
              <FileText className="h-4 w-4" />
            </span>
            {tagLabelText}
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={`text-[#2f2f2f] ${bodyFontClass}`}
            style={{ fontWeight: 600 }}
          >
            {shareLabel}
          </span>

          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share ${titleText} on Facebook`}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#1877F2] text-white transition hover:scale-105"
          >
            <FaFacebookF className="h-3.5 w-3.5" />
          </a>

          <a
            href={telegramShareUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share ${titleText} on Telegram`}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#27A7E7] text-white transition hover:scale-105"
          >
            <FaTelegramPlane className="h-3.5 w-3.5" />
          </a>
        </div>

        <article className={`mt-6 max-w-7xl text-slate-700 ${bodyFontClass}`}>
          {hasDocContent && selectedContentDoc ? (
            <div className="mt-2">
              <TiptapRenderer
                doc={selectedContentDoc}
                bodyFontClass={bodyFontClass}
                titleFontClass={titleFontClass}
              />
            </div>
          ) : null}

          {!hasDocContent ? (
            <p
              className={`mt-4 text-slate-500 ${bodyFontClass}`}
              style={{ fontWeight: 400 }}
            >
              {uiLang === "kh"
                ? "មិនមានមាតិកាលម្អិតទេ។"
                : "No detail content available."}
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function TiptapRenderer({
  doc,
  bodyFontClass,
  titleFontClass,
}: {
  doc: TiptapNode;
  bodyFontClass: string;
  titleFontClass: string;
}) {
  const nodes = doc.content ?? [];

  return <>{renderNodes(nodes, "root", bodyFontClass, titleFontClass)}</>;
}

function containsKhmer(value?: string): boolean {
  return /[\u1780-\u17FF]/.test(value ?? "");
}

function shouldUseKhmerFont(data: {
  category?: string;
  title?: string;
  tagLabel?: string;
  summary?: string;
  contentDoc?: TiptapNode | null;
}): boolean {
  const docText = data.contentDoc
    ? extractPlainText(data.contentDoc.content ?? [])
    : "";

  const fullText = `${data.category ?? ""} ${data.title ?? ""} ${
    data.tagLabel ?? ""
  } ${data.summary ?? ""} ${docText}`;

  return containsKhmer(fullText);
}

function renderNodes(
  nodes: TiptapNode[],
  path: string,
  bodyFontClass: string,
  titleFontClass: string
): ReactNode[] {
  const imageSlides = getImageSlides(nodes, path);
  const shouldUseCarousel = imageSlides.length > 1;
  let hasRenderedCarousel = false;

  return nodes.map((node, index) => {
    const key = `${path}-${index}`;

    if (shouldUseCarousel && getImageSlide(node, key)) {
      if (hasRenderedCarousel) {
        return null;
      }

      hasRenderedCarousel = true;

      return (
        <ImageCarousel key={`${path}-photo-carousel`} slides={imageSlides} />
      );
    }

    return renderNode(node, key, bodyFontClass, titleFontClass);
  });
}

function renderNode(
  node: TiptapNode,
  key: string,
  bodyFontClass: string,
  titleFontClass: string
): ReactNode {
  const type = node.type ?? "";
  const content = node.content ?? [];
  const attrs = node.attrs ?? {};
  const style = getTextAlignStyle(attrs);

  if (type === "doc") {
    return (
      <React.Fragment key={key}>
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </React.Fragment>
    );
  }

  if (type === "text") {
    return (
      <React.Fragment key={key}>
        {applyMarks(node.text ?? "", node.marks, key)}
      </React.Fragment>
    );
  }

  if (type === "hardBreak") {
    return <br key={key} />;
  }

  if (type === "paragraph") {
    return (
      <p
        key={key}
        className={`mt-4 text-slate-700 ${bodyFontClass}`}
        style={{ ...style, fontWeight: 400 }}
      >
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </p>
    );
  }

  if (type === "heading") {
    const level = normalizeHeadingLevel(attrs.level);
    const headingClass = getHeadingClass(level, titleFontClass);

    const children = renderNodes(content, key, bodyFontClass, titleFontClass);
    const headingStyle = { ...style, fontWeight: 600 };

    if (level === 1) {
      return (
        <h1 key={key} className={headingClass} style={headingStyle}>
          {children}
        </h1>
      );
    }

    if (level === 2) {
      return (
        <h2 key={key} className={headingClass} style={headingStyle}>
          {children}
        </h2>
      );
    }

    if (level === 3) {
      return (
        <h3 key={key} className={headingClass} style={headingStyle}>
          {children}
        </h3>
      );
    }

    if (level === 4) {
      return (
        <h4 key={key} className={headingClass} style={headingStyle}>
          {children}
        </h4>
      );
    }

    if (level === 5) {
      return (
        <h5 key={key} className={headingClass} style={headingStyle}>
          {children}
        </h5>
      );
    }

    return (
      <h6 key={key} className={headingClass} style={headingStyle}>
        {children}
      </h6>
    );
  }

  if (type === "bulletList") {
    return (
      <ul
        key={key}
        className={`mt-4 list-disc space-y-2 pl-6 ${bodyFontClass}`}
        style={{ ...style, fontWeight: 400 }}
      >
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </ul>
    );
  }

  if (type === "orderedList") {
    const start = typeof attrs.start === "number" ? attrs.start : 1;

    return (
      <ol
        key={key}
        start={start}
        className={`mt-4 list-decimal space-y-2 pl-6 ${bodyFontClass}`}
        style={{ ...style, fontWeight: 400 }}
      >
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </ol>
    );
  }

  if (type === "listItem") {
    return (
      <li
        key={key}
        className={`leading-7 ${bodyFontClass}`}
        style={{ fontWeight: 400 }}
      >
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </li>
    );
  }

  if (type === "blockquote") {
    return (
      <blockquote
        key={key}
        className={`mt-4 border-l-4 border-amber-500 pl-4 italic text-slate-700 ${bodyFontClass}`}
        style={{ ...style, fontWeight: 400 }}
      >
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </blockquote>
    );
  }

  if (type === "codeBlock") {
    return (
      <pre
        key={key}
        className="mt-4 overflow-x-auto rounded bg-slate-900 p-4 text-sm text-slate-100"
        style={style}
      >
        <code>{extractPlainText(content)}</code>
      </pre>
    );
  }

  if (type === "horizontalRule") {
    return <hr key={key} className="my-6 border-slate-300" />;
  }

  if (type === "image") {
    const src = normalizeImageUrl(getStringAttr(attrs, "src"));
    const alt =
      getStringAttr(attrs, "alt") || getStringAttr(attrs, "title") || "Image";

    if (!src) {
      return null;
    }

    return <ImageFigure key={key} src={src} alt={alt} />;
  }

  if (type === "youtube") {
    const src = normalizeVideoUrl(getStringAttr(attrs, "src"));
    const title = getStringAttr(attrs, "title") || "YouTube video";
    const allowFullScreenAttr = getStringAttr(
      attrs,
      "allowfullscreen"
    ).toLowerCase();
    const allowFullScreen = allowFullScreenAttr !== "false";

    if (!src) {
      return null;
    }

    return (
      <div key={key} className="mt-6">
        <div
          className="relative w-full overflow-hidden rounded-md border border-slate-200"
          style={{ paddingBottom: "56.25%" }}
        >
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={allowFullScreen}
          />
        </div>
      </div>
    );
  }

  if (type === "video") {
    const src = normalizeVideoUrl(getStringAttr(attrs, "src"));
    const poster = getStringAttr(attrs, "poster");

    if (!src) {
      return null;
    }

    return (
      <div key={key} className="mt-6">
        <video
          src={src}
          poster={poster || undefined}
          controls
          className="w-full rounded-md border border-slate-200 bg-black"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div key={key} className="mt-6 overflow-x-auto">
        <table
          className={`min-w-full border-collapse border border-slate-300 ${bodyFontClass}`}
        >
          <tbody>
            {renderNodes(content, key, bodyFontClass, titleFontClass)}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "tableRow") {
    return (
      <tr key={key}>
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </tr>
    );
  }

  if (type === "tableHeader") {
    return (
      <th
        key={key}
        className={`border border-slate-300 bg-slate-100 px-3 py-2 text-left ${bodyFontClass}`}
        style={{ ...style, fontWeight: 600 }}
      >
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </th>
    );
  }

  if (type === "tableCell") {
    return (
      <td
        key={key}
        className={`border border-slate-300 px-3 py-2 ${bodyFontClass}`}
        style={{ ...style, fontWeight: 400 }}
      >
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </td>
    );
  }

  if (content.length > 0) {
    return (
      <div key={key}>
        {renderNodes(content, key, bodyFontClass, titleFontClass)}
      </div>
    );
  }

  return null;
}

function ImageFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="mt-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-auto w-full object-contain" />
    </figure>
  );
}

function ImageCarousel({ slides }: { slides: ImageSlide[] }) {
  return (
    <figure className="mt-6 overflow-hidden bg-slate-50">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={slides.length > 1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation
        pagination={{ clickable: true }}
        className="news-detail-photo-carousel"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.key}>
            <div className="flex h-[300px] items-center justify-center bg-white sm:h-[520px] lg:h-[720px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.src}
                alt={slide.alt}
                className="h-full w-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </figure>
  );
}

function getImageSlides(nodes: TiptapNode[], path: string): ImageSlide[] {
  const slides: ImageSlide[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const slide = getImageSlide(nodes[index], `${path}-${index}`);

    if (slide) {
      slides.push(slide);
    }
  }

  return slides;
}

function getImageSlide(node: TiptapNode, key: string): ImageSlide | null {
  if (node.type !== "image") {
    return null;
  }

  const attrs = node.attrs ?? {};
  const src = normalizeImageUrl(getStringAttr(attrs, "src"));

  if (!src) {
    return null;
  }

  return {
    key,
    src,
    alt: getStringAttr(attrs, "alt") || getStringAttr(attrs, "title") || "Image",
  };
}

function applyMarks(
  text: string,
  marks: TiptapMark[] | undefined,
  keyBase: string
): ReactNode {
  let result: ReactNode = text;

  if (!marks || marks.length === 0) {
    return result;
  }

  for (let index = 0; index < marks.length; index += 1) {
    const mark = marks[index];
    const markKey = `${keyBase}-mark-${index}`;

    if (mark.type === "bold") {
      result = <strong key={markKey}>{result}</strong>;
      continue;
    }

    if (mark.type === "italic") {
      result = <em key={markKey}>{result}</em>;
      continue;
    }

    if (mark.type === "underline") {
      result = <u key={markKey}>{result}</u>;
      continue;
    }

    if (mark.type === "strike") {
      result = <s key={markKey}>{result}</s>;
      continue;
    }

    if (mark.type === "code") {
      result = (
        <code key={markKey} className="rounded bg-slate-100 px-1">
          {result}
        </code>
      );
      continue;
    }

    if (mark.type === "subscript") {
      result = <sub key={markKey}>{result}</sub>;
      continue;
    }

    if (mark.type === "superscript") {
      result = <sup key={markKey}>{result}</sup>;
      continue;
    }

    if (mark.type === "link") {
      const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
      const target =
        typeof mark.attrs?.target === "string" ? mark.attrs.target : undefined;
      const rel =
        typeof mark.attrs?.rel === "string"
          ? mark.attrs.rel
          : target === "_blank"
            ? "noopener noreferrer"
            : undefined;

      result = (
        <a
          key={markKey}
          href={href}
          target={target}
          rel={rel}
          className="break-words text-blue-700 underline"
        >
          {result}
        </a>
      );

      continue;
    }
  }

  return result;
}

function extractPlainText(nodes: TiptapNode[]): string {
  let text = "";

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];

    if (node.type === "text") {
      text += node.text ?? "";
      continue;
    }

    if (node.type === "hardBreak") {
      text += "\n";
      continue;
    }

    if (node.content && node.content.length > 0) {
      text += extractPlainText(node.content);
    }
  }

  return text;
}

function getTextAlignStyle(
  attrs: Record<string, unknown>
): CSSProperties | undefined {
  const textAlign =
    typeof attrs.textAlign === "string" ? attrs.textAlign : "";

  if (
    textAlign === "left" ||
    textAlign === "center" ||
    textAlign === "right" ||
    textAlign === "justify"
  ) {
    return { textAlign };
  }

  return undefined;
}

function normalizeHeadingLevel(level: unknown): number {
  if (typeof level !== "number") {
    return 2;
  }

  if (level < 1) {
    return 1;
  }

  if (level > 6) {
    return 6;
  }

  return level;
}

function getHeadingClass(level: number, titleFontClass: string): string {
  if (level === 1) return `mt-6 text-slate-900 ${titleFontClass}`;
  if (level === 2) return `mt-6 text-slate-900 ${titleFontClass}`;
  if (level === 3) return `mt-6 text-slate-900 ${titleFontClass}`;
  if (level === 4) return `mt-6 text-xl text-slate-900 ${titleFontClass}`;
  if (level === 5) return `mt-6 text-lg text-slate-900 ${titleFontClass}`;
  return `mt-6 text-base text-slate-900 ${titleFontClass}`;
}

function getStringAttr(attrs: Record<string, unknown>, key: string): string {
  const value = attrs[key];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeImageUrl(url: string): string {
  if (url.startsWith("/https://") || url.startsWith("/http://")) {
    return url.slice(1);
  }

  return url;
}

function normalizeVideoUrl(url: string): string {
  if (!url) {
    return "";
  }

  if (url.includes("youtube.com/watch")) {
    const value = extractQueryParam(url, "v");
    if (value) {
      return `https://www.youtube.com/embed/${value}`;
    }
  }

  if (url.includes("youtu.be/")) {
    const value = url.split("youtu.be/")[1]?.split(/[?&/]/)[0] ?? "";
    if (value) {
      return `https://www.youtube.com/embed/${value}`;
    }
  }

  return url;
}

function extractQueryParam(url: string, key: string): string {
  const query = url.split("?")[1] ?? "";
  const params = query.split("&");

  for (let index = 0; index < params.length; index += 1) {
    const pair = params[index].split("=");

    if (pair[0] === key && pair[1]) {
      return pair[1];
    }
  }

  return "";
}