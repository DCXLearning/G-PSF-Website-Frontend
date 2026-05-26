"use client";

import React, {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
  en?: unknown;
  km?: unknown;
};

type TiptapNode = {
  type?: string;
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
};

type TiptapMark = {
  type?: string;
  attrs?: Record<string, unknown>;
};

type RichTextValue = {
  text: string;
  doc: TiptapNode | null;
};

type MandateSection = {
  title: string;
  description: RichTextValue;
};

type WgTemplateIssueItem = {
  status?: string;
  title?: I18nText;
  link?: string;
  lastUpdate?: string;
};

type WgTemplateContent = {
  textBlock?: {
    items?: Array<{
      title?: I18nText;
      description?: I18nText;
    }>;
  };
  issuesResponses?: {
    items?: WgTemplateIssueItem[];
  };
  progressSnapshot?: {
    progress?: string;
  };
};

type WgTemplateResponse = {
  data?: {
    blocks?: Array<{
      type?: string;
      enabled?: boolean;
      posts?: Array<{
        status?: string;
        content?: {
          en?: WgTemplateContent;
          km?: WgTemplateContent;
        };
      }>;
    }>;
  };
};

type MandateContent = {
  sections: MandateSection[];
  progress: number;
  issueCounts: {
    resolved: number;
    inProgress: number;
    pending: number;
  };
};

type MandateScopePageProps = {
  pageSlug?: string;
};

const DEFAULT_PAGE_SLUG = "law-tax-and-governance";

function getText(value?: string | null): string {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

function isTiptapDoc(value: unknown): value is TiptapNode {
  if (!value || typeof value !== "object") {
    return false;
  }

  const doc = value as TiptapNode;
  return doc.type === "doc" || Array.isArray(doc.content);
}

function hasVisibleTiptapContent(node: TiptapNode | undefined): boolean {
  if (!node) return false;

  if (node.type === "text") {
    return getText(node.text ?? "").length > 0;
  }

  if (
    node.type === "image" ||
    node.type === "youtube" ||
    node.type === "video" ||
    node.type === "table" ||
    node.type === "horizontalRule"
  ) {
    return true;
  }

  const children = node.content ?? [];

  for (let index = 0; index < children.length; index += 1) {
    if (hasVisibleTiptapContent(children[index])) {
      return true;
    }
  }

  return false;
}

function extractTiptapText(node: TiptapNode | undefined): string {
  if (!node) return "";

  if (node.type === "text") {
    return node.text ?? "";
  }

  if (node.type === "hardBreak") {
    return "\n";
  }

  const childText = (node.content ?? [])
    .map((item) => extractTiptapText(item))
    .join("");

  if (
    node.type === "paragraph" ||
    node.type === "heading" ||
    node.type === "blockquote" ||
    node.type === "bulletList" ||
    node.type === "orderedList" ||
    node.type === "listItem"
  ) {
    return `${childText}\n`;
  }

  return childText;
}

function getRichText(value: unknown): string {
  if (typeof value === "string") {
    return getText(value);
  }

  if (isTiptapDoc(value)) {
    return getText(
      extractTiptapText(value)
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }

  return "";
}

function getRichTextValue(value: unknown): RichTextValue {
  if (typeof value === "string") {
    return {
      text: getText(value),
      doc: null,
    };
  }

  if (isTiptapDoc(value)) {
    const text = getText(
      extractTiptapText(value)
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );

    return {
      text,
      doc: hasVisibleTiptapContent(value) ? value : null,
    };
  }

  return {
    text: "",
    doc: null,
  };
}

function pickI18nText(value: I18nText | undefined, apiLang: ApiLang): string {
  if (!value) return "";

  const primary =
    apiLang === "km" ? getRichText(value.km) : getRichText(value.en);

  return primary || getRichText(value.en) || getRichText(value.km);
}

function pickI18nRichText(
  value: I18nText | undefined,
  apiLang: ApiLang
): RichTextValue {
  if (!value) {
    return {
      text: "",
      doc: null,
    };
  }

  const primary =
    apiLang === "km"
      ? getRichTextValue(value.km)
      : getRichTextValue(value.en);

  if (primary.text || primary.doc) {
    return primary;
  }

  const fallbackEn = getRichTextValue(value.en);

  if (fallbackEn.text || fallbackEn.doc) {
    return fallbackEn;
  }

  return getRichTextValue(value.km);
}

function pickTemplateContent(
  response: WgTemplateResponse,
  apiLang: ApiLang
): WgTemplateContent | null {
  const blocks = response.data?.blocks ?? [];

  const block =
    blocks.find(
      (item) => item.enabled !== false && item.type === "wg_template"
    ) ?? blocks.find((item) => item.enabled !== false);

  const post =
    block?.posts?.find((item) => item.status === "published") ??
    block?.posts?.[0];

  if (!post) return null;

  return post.content?.[apiLang] ?? post.content?.en ?? post.content?.km ?? null;
}

function parseProgress(value?: string): number {
  const progress = Number(getText(value));

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, progress));
}

function countIssueStatuses(items: WgTemplateIssueItem[] | undefined) {
  const counts = {
    resolved: 0,
    inProgress: 0,
    pending: 0,
  };

  for (let index = 0; index < (items ?? []).length; index += 1) {
    const status = getText(items?.[index]?.status).toLowerCase();

    if (status === "resolved") {
      counts.resolved += 1;
      continue;
    }

    if (
      status === "in_progress" ||
      status === "in progress" ||
      status === "in-progress"
    ) {
      counts.inProgress += 1;
      continue;
    }

    counts.pending += 1;
  }

  return counts;
}

function mapMandateContent(
  response: WgTemplateResponse,
  apiLang: ApiLang
): MandateContent | null {
  const content = pickTemplateContent(response, apiLang);

  if (!content) return null;

  const items = content.textBlock?.items ?? [];
  const sections: MandateSection[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const title = pickI18nText(item?.title, apiLang);
    const description = pickI18nRichText(item?.description, apiLang);

    if (!title && !description.text && !description.doc) {
      continue;
    }

    sections.push({
      title,
      description,
    });
  }

  const mapped: MandateContent = {
    sections,
    progress: parseProgress(content.progressSnapshot?.progress),
    issueCounts: countIssueStatuses(content.issuesResponses?.items),
  };

  const hasAnyText =
    mapped.sections.length > 0 ||
    mapped.progress > 0 ||
    mapped.issueCounts.resolved > 0 ||
    mapped.issueCounts.inProgress > 0 ||
    mapped.issueCounts.pending > 0;

  return hasAnyText ? mapped : null;
}

function containsKhmer(value?: string): boolean {
  return /[\u1780-\u17FF]/.test(value ?? "");
}

function normalizeLang(value: unknown): Lang {
  const lang = String(value || "en").toLowerCase();

  if (lang === "kh" || lang === "km") {
    return "kh";
  }

  return "en";
}

function getTitleFontClass(isKh: boolean): string {
  return isKh ? "title-km khmer-font" : "title-en airbnb-font";
}

function getBodyFontClass(isKh: boolean): string {
  return isKh ? "body-km khmer-font" : "body-en airbnb-font";
}

function getMainTitleFontClass(isKh: boolean): string {
  return isKh ? "main-title-km khmer-font" : "main-title-en airbnb-font";
}

function MandateRichText({
  doc,
  bodyFontClass,
  titleFontClass,
}: {
  doc: TiptapNode;
  bodyFontClass: string;
  titleFontClass: string;
}) {
  return (
    <div
      className={`mt-5 text-slate-500 ${bodyFontClass}`}
      style={{ fontWeight: 400 }}
    >
      {renderTiptapNodes(
        doc.content ?? [],
        "mandate-root",
        bodyFontClass,
        titleFontClass
      )}
    </div>
  );
}

function renderTiptapNodes(
  nodes: TiptapNode[],
  path: string,
  bodyFontClass: string,
  titleFontClass: string
): ReactNode[] {
  return nodes.map((node, index) =>
    renderTiptapNode(node, `${path}-${index}`, bodyFontClass, titleFontClass)
  );
}

function renderTiptapNode(
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
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
      </React.Fragment>
    );
  }

  if (type === "text") {
    return (
      <React.Fragment key={key}>
        {applyTiptapMarks(node.text ?? "", node.marks, key)}
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
        className={`mt-4 text-slate-500 ${bodyFontClass}`}
        style={{ ...style, fontWeight: 400 }}
      >
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
      </p>
    );
  }

  if (type === "heading") {
    const level = normalizeHeadingLevel(attrs.level);
    const headingClass = getHeadingClass(level, titleFontClass);
    const children = renderTiptapNodes(
      content,
      key,
      bodyFontClass,
      titleFontClass
    );
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
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
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
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
      </ol>
    );
  }

  if (type === "listItem") {
    return (
      <li
        key={key}
        className={`leading-relaxed ${bodyFontClass}`}
        style={{ fontWeight: 400 }}
      >
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
      </li>
    );
  }

  if (type === "blockquote") {
    return (
      <blockquote
        key={key}
        className={`mt-4 border-l-4 border-amber-500 pl-4 italic text-slate-600 ${bodyFontClass}`}
        style={{ ...style, fontWeight: 400 }}
      >
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
      </blockquote>
    );
  }

  if (type === "codeBlock") {
    return (
      <pre
        key={key}
        className="mt-4 overflow-x-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100"
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
    const src = getStringAttr(attrs, "src");
    const alt = getStringAttr(attrs, "alt") || "Image";

    if (!src) return null;

    return (
      <figure key={key} className="mt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full rounded-xl border border-slate-200"
        />
      </figure>
    );
  }

  if (type === "youtube") {
    const src = normalizeVideoUrl(getStringAttr(attrs, "src"));
    const title = getStringAttr(attrs, "title") || "YouTube video";
    const allowFullScreenAttr = getStringAttr(
      attrs,
      "allowfullscreen"
    ).toLowerCase();
    const allowFullScreen = allowFullScreenAttr !== "false";

    if (!src) return null;

    return (
      <div key={key} className="mt-6">
        <div
          className="relative w-full overflow-hidden rounded-xl border border-slate-200"
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

    if (!src) return null;

    return (
      <div key={key} className="mt-6">
        <video
          src={src}
          poster={poster || undefined}
          controls
          className="w-full rounded-xl border border-slate-200 bg-black"
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
            {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === "tableRow") {
    return (
      <tr key={key}>
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
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
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
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
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
      </td>
    );
  }

  if (content.length > 0) {
    return (
      <div key={key}>
        {renderTiptapNodes(content, key, bodyFontClass, titleFontClass)}
      </div>
    );
  }

  return null;
}

function applyTiptapMarks(
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
        <code key={markKey} className="rounded bg-slate-100 px-1 text-[0.95em]">
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
      const href = getStringAttr(mark.attrs ?? {}, "href") || "#";
      const target = getStringAttr(mark.attrs ?? {}, "target") || undefined;
      const rel =
        getStringAttr(mark.attrs ?? {}, "rel") ||
        (target === "_blank" ? "noopener noreferrer" : undefined);

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
  const textAlign = getStringAttr(attrs, "textAlign");

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
  if (typeof level !== "number") return 2;
  if (level < 1) return 1;
  if (level > 6) return 6;
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

function normalizeVideoUrl(url: string): string {
  if (!url) return "";

  if (url.includes("youtube.com/watch")) {
    const value = extractQueryParam(url, "v");
    if (value) return `https://www.youtube.com/embed/${value}`;
  }

  if (url.includes("youtu.be/")) {
    const value = url.split("youtu.be/")[1]?.split(/[?&/]/)[0] ?? "";
    if (value) return `https://www.youtube.com/embed/${value}`;
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

function Donut({
  value = 90,
  size = 120,
  stroke = 14,
}: {
  value?: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#E7EDF3"
          strokeWidth={stroke}
        />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#0F3D5E"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>

      <div className="absolute text-center">
        <div className="text-base text-slate-900" style={{ fontWeight: 600 }}>
          {clamped}%
        </div>
      </div>
    </div>
  );
}

function MiniBarChart({
  lang,
  counts,
}: {
  lang: Lang;
  counts: {
    resolved: number;
    inProgress: number;
    pending: number;
  };
}) {
  const labels =
    lang === "kh"
      ? {
          resolved: "ដោះស្រាយរួច",
          inProgress: "កំពុងដំណើរការ",
          pending: "កំពុងរង់ចាំ",
          count: "ចំនួន",
        }
      : {
          resolved: "Resolved",
          inProgress: "In progress",
          pending: "Pending",
          count: "Count",
        };

  const data = [
    { label: labels.resolved, value: counts.resolved, color: "#0F3D5E" },
    { label: labels.inProgress, value: counts.inProgress, color: "#3A73A5" },
    { label: labels.pending, value: counts.pending, color: "#F2A53A" },
  ];

  const highestValue = Math.max(...data.map((item) => item.value), 1);
  const yStep = Math.max(10, Math.ceil(highestValue / 3 / 10) * 10);
  const max = yStep * 3;
  const yTicks = [0, yStep, yStep * 2, yStep * 3];

  const chartH = 160;
  const chartW = 320;
  const padding = { top: 10, right: 10, bottom: 40, left: 40 };
  const innerW = chartW - padding.left - padding.right;
  const innerH = chartH - padding.top - padding.bottom;
  const gap = 20;
  const barW = (innerW - gap * (data.length - 1)) / data.length;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full"
        aria-label="Issues and responses bar chart"
      >
        {yTicks.map((tick) => {
          const y = padding.top + innerH - (tick / max) * innerH;

          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={chartW - padding.right}
                y1={y}
                y2={y}
                stroke="#E7EDF3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[11px] font-medium"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <text
          x={12}
          y={padding.top + innerH / 2}
          transform={`rotate(-90 12 ${padding.top + innerH / 2})`}
          className="fill-slate-400 text-[10px] font-bold uppercase tracking-wider"
        >
          {labels.count}
        </text>

        {data.map((item, index) => {
          const value = Math.max(0, Math.min(item.value, max));
          const height = (value / max) * innerH;
          const x = padding.left + index * (barW + gap);
          const y = padding.top + innerH - height;

          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={height}
                rx="4"
                fill={item.color}
              />
              <text
                x={x + barW / 2}
                y={chartH - 15}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-bold"
                transform={`rotate(-15 ${x + barW / 2} ${chartH - 15})`}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function MandateScopePage({
  pageSlug = DEFAULT_PAGE_SLUG,
}: MandateScopePageProps) {
  const { language } = useLanguage();

  const lang = normalizeLang(language);
  const isKh = lang === "kh";
  const apiLang: ApiLang = isKh ? "km" : "en";

  const titleFontClass = getTitleFontClass(isKh);
  const bodyFontClass = getBodyFontClass(isKh);
  const mainTitleFontClass = getMainTitleFontClass(isKh);

  const [mandateContent, setMandateContent] =
    useState<MandateContent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMandate() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/working-groups-page/section?slug=${encodeURIComponent(pageSlug)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setMandateContent(null);
          return;
        }

        const json = (await response.json()) as WgTemplateResponse;
        const mapped = mapMandateContent(json, apiLang);
        setMandateContent(mapped);
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setMandateContent(null);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMandate();

    return () => {
      controller.abort();
    };
  }, [apiLang, pageSlug]);

  const t =
    lang === "kh"
      ? {
          title1: "ភារកិច្ច និង",
          title2: "វិសាលភាព",
          what: "ក្រុមការងារនេះធ្វើអ្វី?",
          whatDesc:
            "WG 4 ដោះស្រាយបញ្ហាច្បាប់ និងអភិបាលកិច្ចដែលពាក់ព័ន្ធជាច្រើន ដែលវិស័យឯកជនលើកឡើង។ បញ្ហានឹងត្រូវពិភាក្សានៅកិច្ចប្រជុំ Technical WG ដែលមានសហប្រធានពីរដ្ឋ និងឯកជន។ ប្រសិនបើមិនអាចដោះស្រាយបាន នឹងលើកទៅ Plenary ដើម្បីទទួលការណែនាំ។",
          pathway: "ផ្លូវនៃការចូលរួម",
          pathwayDesc:
            "BMOs/PSWGs → Technical WG → Secretariat tracking → Plenary (if needed)",
          submit: "ដាក់ស្នើបញ្ហា",
          progress: "សង្ខេបវឌ្ឍនភាព",
          resolution: "ដោះស្រាយ",
          issues: "បញ្ហា និងការឆ្លើយតប",
        }
      : {
          title1: "Mandate &",
          title2: "Scope",
          what: "What this WG does",
          whatDesc:
            "WG 4 addresses cross-cutting regulatory and governance constraints raised by the private sector. Issues are discussed in Technical WG sessions co-chaired by government and private sector leads. Unresolved items are escalated to the national Plenary for direction.",
          pathway: "Engagement pathway",
          pathwayDesc:
            "BMOs/PSWGs → Technical WG → Secretariat tracking → Plenary (if needed)",
          submit: "Submit Issue",
          progress: "Progress Snapshot",
          resolution: "resolution",
          issues: "Issues & responses",
        };

  const sections = mandateContent?.sections?.length
    ? mandateContent.sections
    : [
        {
          title: t.what,
          description: {
            text: t.whatDesc,
            doc: null,
          },
        },
        {
          title: t.pathway,
          description: {
            text: t.pathwayDesc,
            doc: null,
          },
        },
      ];

  const progressValue = mandateContent?.progress ?? 0;

  const issueCounts = mandateContent?.issueCounts ?? {
    resolved: 0,
    inProgress: 0,
    pending: 0,
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-4 lg:py-16">
        <header className="mb-12">
          <h1
            className={`tracking-tight text-slate-900 ${titleFontClass}`}
            style={{ fontWeight: 600 }}
          >
            {t.title1}{" "}
            <span className="relative inline-block">
              {t.title2}
              <span className="absolute -bottom-1 left-0 h-[4px] w-full rounded-full bg-orange-400 md:h-[6px]" />
            </span>
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <section className="lg:col-span-7">
            <div className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-12">
              <div className="space-y-12">
                {sections.map((section, index) => {
                  const sectionTitleFontClass =
                    isKh || containsKhmer(section.title)
                      ? "main-title-km khmer-font"
                      : "main-title-en airbnb-font";

                  const sectionBodyFontClass =
                    isKh || containsKhmer(section.description.text)
                      ? "body-km khmer-font"
                      : "body-en airbnb-font";

                  return (
                    <div key={`${section.title}-${index}`}>
                      {section.title ? (
                        <h2
                          className={`text-slate-900 ${sectionTitleFontClass}`}
                          style={{ fontWeight: 600 }}
                        >
                          {section.title}
                        </h2>
                      ) : null}

                      {section.description.doc ? (
                        <MandateRichText
                          doc={section.description.doc}
                          bodyFontClass={sectionBodyFontClass}
                          titleFontClass={sectionTitleFontClass}
                        />
                      ) : (
                        <p
                          className={`mt-5 whitespace-pre-line text-slate-500 ${sectionBodyFontClass}`}
                          style={{ fontWeight: 400 }}
                        >
                          {section.description.text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-10 lg:col-span-5">
            <div className="rounded-[40px] bg-[#F8FAFC] p-8 md:p-10">
              <h2
                className={`text-slate-900 ${mainTitleFontClass}`}
                style={{ fontWeight: 600 }}
              >
                {t.progress}
              </h2>

              <div className="mt-8 flex items-center gap-8">
                <Donut value={progressValue} />

                <div className="flex flex-col">
                  <span
                    className={`text-[#0F3D5E] ${mainTitleFontClass}`}
                    style={{ fontWeight: 600 }}
                  >
                    {progressValue}%
                  </span>

                  <span
                    className={`text-slate-500 uppercase tracking-wider ${bodyFontClass} ${
                      isKh ? "normal-case" : ""
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {t.resolution}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-2">
              <h2
                className={`mb-6 text-slate-900 ${mainTitleFontClass}`}
                style={{ fontWeight: 600 }}
              >
                {t.issues}
              </h2>

              <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
                <MiniBarChart lang={lang} counts={issueCounts} />
              </div>
            </div>
          </aside>
        </div>

        {loading ? (
          <p
            className={`mt-4 text-slate-500 ${bodyFontClass}`}
            style={{ fontWeight: 400 }}
          >
            {isKh ? "កំពុងទាញទិន្នន័យ..." : "Loading data..."}
          </p>
        ) : null}
      </div>
    </main>
  );
}