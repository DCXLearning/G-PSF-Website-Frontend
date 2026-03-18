"use client";

import React, { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  whatTitle: string;
  whatDescription: RichTextValue;
  pathwayTitle: string;
  pathwayDescription: RichTextValue;
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
  if (!node) {
    return false;
  }

  if (node.type === "text") {
    return getText(node.text ?? "").length > 0;
  }

  // These nodes still show something on screen even without text.
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
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.text ?? "";
  }

  if (node.type === "hardBreak") {
    return "\n";
  }

  const childText = (node.content ?? []).map((item) => extractTiptapText(item)).join("");

  // Add a line break after block-level nodes so the final text stays readable.
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
    const hasVisibleContent = hasVisibleTiptapContent(value);

    // Keep the original TipTap document so the page can render full rich text.
    return {
      text,
      doc: hasVisibleContent ? value : null,
    };
  }

  return {
    text: "",
    doc: null,
  };
}

function pickI18nText(value: I18nText | undefined, apiLang: ApiLang): string {
  if (!value) {
    return "";
  }

  const primary = apiLang === "km" ? getRichText(value.km) : getRichText(value.en);
  return primary || getRichText(value.en) || getRichText(value.km);
}

function pickI18nRichText(value: I18nText | undefined, apiLang: ApiLang): RichTextValue {
  if (!value) {
    return {
      text: "",
      doc: null,
    };
  }

  const primary = apiLang === "km" ? getRichTextValue(value.km) : getRichTextValue(value.en);

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
    blocks.find((item) => item.enabled !== false && item.type === "wg_template") ??
    blocks.find((item) => item.enabled !== false);

  const post =
    block?.posts?.find((item) => item.status === "published") ??
    block?.posts?.[0];

  if (!post) {
    return null;
  }

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

    if (status === "in_progress" || status === "in progress" || status === "in-progress") {
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

  if (!content) {
    return null;
  }

  const items = content.textBlock?.items ?? [];

  const what = items[0];
  const pathway = items[1];

  const mapped: MandateContent = {
    whatTitle: pickI18nText(what?.title, apiLang),
    whatDescription: pickI18nRichText(what?.description, apiLang),
    pathwayTitle: pickI18nText(pathway?.title, apiLang),
    pathwayDescription: pickI18nRichText(pathway?.description, apiLang),
    progress: parseProgress(content.progressSnapshot?.progress),
    issueCounts: countIssueStatuses(content.issuesResponses?.items),
  };

  const hasAnyText =
    Boolean(mapped.whatTitle) ||
    Boolean(mapped.whatDescription.text) ||
    Boolean(mapped.whatDescription.doc) ||
    Boolean(mapped.pathwayTitle) ||
    Boolean(mapped.pathwayDescription.text) ||
    Boolean(mapped.pathwayDescription.doc) ||
    mapped.progress > 0 ||
    mapped.issueCounts.resolved > 0 ||
    mapped.issueCounts.inProgress > 0 ||
    mapped.issueCounts.pending > 0;

  return hasAnyText ? mapped : null;
}

function splitPathway(pathwayText: string): string[] {
  return pathwayText
    .split("→")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function containsKhmer(value?: string): boolean {
  return /[\u1780-\u17FF]/.test(value ?? "");
}

function MandateRichText({
  doc,
  isKh,
  text,
}: {
  doc: TiptapNode;
  isKh: boolean;
  text: string;
}) {
  // This renderer shows TipTap JSON from the CMS inside the Mandate section.
  return (
    <div className={`mt-5 text-slate-500 ${isKh || containsKhmer(text) ? "khmer-font" : ""}`}>
      {renderTiptapNodes(doc.content ?? [], "mandate-root")}
    </div>
  );
}

function renderTiptapNodes(nodes: TiptapNode[], path: string): ReactNode[] {
  return nodes.map((node, index) => renderTiptapNode(node, `${path}-${index}`));
}

function renderTiptapNode(node: TiptapNode, key: string): ReactNode {
  const type = node.type ?? "";
  const content = node.content ?? [];
  const attrs = node.attrs ?? {};
  const style = getTextAlignStyle(attrs);

  if (type === "doc") {
    return <React.Fragment key={key}>{renderTiptapNodes(content, key)}</React.Fragment>;
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
      <p key={key} className="mt-4 text-base leading-relaxed md:text-lg" style={style}>
        {renderTiptapNodes(content, key)}
      </p>
    );
  }

  if (type === "heading") {
    const level = normalizeHeadingLevel(attrs.level);
    const headingClass = getHeadingClass(level);

    if (level === 1) {
      return (
        <h1 key={key} className={headingClass} style={style}>
          {renderTiptapNodes(content, key)}
        </h1>
      );
    }

    if (level === 2) {
      return (
        <h2 key={key} className={headingClass} style={style}>
          {renderTiptapNodes(content, key)}
        </h2>
      );
    }

    if (level === 3) {
      return (
        <h3 key={key} className={headingClass} style={style}>
          {renderTiptapNodes(content, key)}
        </h3>
      );
    }

    if (level === 4) {
      return (
        <h4 key={key} className={headingClass} style={style}>
          {renderTiptapNodes(content, key)}
        </h4>
      );
    }

    if (level === 5) {
      return (
        <h5 key={key} className={headingClass} style={style}>
          {renderTiptapNodes(content, key)}
        </h5>
      );
    }

    return (
      <h6 key={key} className={headingClass} style={style}>
        {renderTiptapNodes(content, key)}
      </h6>
    );
  }

  if (type === "bulletList") {
    return (
      <ul key={key} className="mt-4 list-disc space-y-2 pl-6" style={style}>
        {renderTiptapNodes(content, key)}
      </ul>
    );
  }

  if (type === "orderedList") {
    const start = typeof attrs.start === "number" ? attrs.start : 1;

    return (
      <ol key={key} start={start} className="mt-4 list-decimal space-y-2 pl-6" style={style}>
        {renderTiptapNodes(content, key)}
      </ol>
    );
  }

  if (type === "listItem") {
    return (
      <li key={key} className="leading-relaxed md:text-lg">
        {renderTiptapNodes(content, key)}
      </li>
    );
  }

  if (type === "blockquote") {
    return (
      <blockquote
        key={key}
        className="mt-4 border-l-4 border-amber-500 pl-4 italic text-slate-600"
        style={style}
      >
        {renderTiptapNodes(content, key)}
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

    if (!src) {
      return null;
    }

    return (
      <figure key={key} className="mt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full rounded-xl border border-slate-200" />
      </figure>
    );
  }

  if (type === "youtube") {
    const src = normalizeVideoUrl(getStringAttr(attrs, "src"));
    const title = getStringAttr(attrs, "title") || "YouTube video";
    const allowFullScreenAttr = getStringAttr(attrs, "allowfullscreen").toLowerCase();
    const allowFullScreen = allowFullScreenAttr !== "false";

    if (!src) {
      return null;
    }

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

    if (!src) {
      return null;
    }

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
        <table className="min-w-full border-collapse border border-slate-300">
          <tbody>{renderTiptapNodes(content, key)}</tbody>
        </table>
      </div>
    );
  }

  if (type === "tableRow") {
    return <tr key={key}>{renderTiptapNodes(content, key)}</tr>;
  }

  if (type === "tableHeader") {
    return (
      <th
        key={key}
        className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold"
        style={style}
      >
        {renderTiptapNodes(content, key)}
      </th>
    );
  }

  if (type === "tableCell") {
    return (
      <td key={key} className="border border-slate-300 px-3 py-2" style={style}>
        {renderTiptapNodes(content, key)}
      </td>
    );
  }

  if (content.length > 0) {
    return <div key={key}>{renderTiptapNodes(content, key)}</div>;
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
      const rel = getStringAttr(mark.attrs ?? {}, "rel")
        || (target === "_blank" ? "noopener noreferrer" : undefined);

      result = (
        <a
          key={markKey}
          href={href}
          target={target}
          rel={rel}
          className="break-words underline text-blue-700"
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

function getTextAlignStyle(attrs: Record<string, unknown>): CSSProperties | undefined {
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

function getHeadingClass(level: number): string {
  if (level === 1) return "mt-6 text-3xl font-bold text-slate-900 md:text-4xl";
  if (level === 2) return "mt-6 text-2xl font-bold text-slate-900 md:text-3xl";
  if (level === 3) return "mt-6 text-xl font-bold text-slate-900 md:text-2xl";
  if (level === 4) return "mt-6 text-lg font-bold text-slate-900 md:text-xl";
  if (level === 5) return "mt-6 text-base font-bold text-slate-900 md:text-lg";
  return "mt-6 text-sm font-bold text-slate-900 md:text-base";
}

function getStringAttr(attrs: Record<string, unknown>, key: string): string {
  const value = attrs[key];
  return typeof value === "string" ? value.trim() : "";
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
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#E7EDF3" strokeWidth={stroke} />
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
        <div className="text-base font-extrabold text-slate-900">{clamped}%</div>
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
        className="w-full h-auto"
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
              <rect x={x} y={y} width={barW} height={height} rx="4" fill={item.color} />
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
  const lang = (language as Lang) ?? "en";
  const isKh = lang === "kh";
  const apiLang: ApiLang = isKh ? "km" : "en";

  const [mandateContent, setMandateContent] = useState<MandateContent | null>(null);
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

  const whatTitle = mandateContent?.whatTitle || t.what;
  const whatDescription = mandateContent?.whatDescription ?? {
    text: t.whatDesc,
    doc: null,
  };
  const pathwayTitle = mandateContent?.pathwayTitle || t.pathway;
  const pathwayDescription = mandateContent?.pathwayDescription ?? {
    text: t.pathwayDesc,
    doc: null,
  };
  const progressValue = mandateContent?.progress ?? 0;
  const issueCounts = mandateContent?.issueCounts ?? {
    resolved: 0,
    inProgress: 0,
    pending: 0,
  };

  const pathwaySteps = useMemo(
    () => splitPathway(pathwayDescription.text),
    [pathwayDescription.text]
  );
  const whatTitleClass = isKh || containsKhmer(whatTitle) ? "khmer-font" : "";
  const whatDescriptionClass =
    isKh || containsKhmer(whatDescription.text) ? "khmer-font" : "";
  const pathwayTitleClass = isKh || containsKhmer(pathwayTitle) ? "khmer-font" : "";
  const pathwayDescriptionClass =
    isKh || containsKhmer(pathwayDescription.text) ? "khmer-font" : "";

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-4 lg:py-16">
        <header className="mb-12">
          <h1
            className={`text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-6xl ${
              isKh ? "khmer-font" : ""
            }`}
          >
            {t.title1}{" "}
            <span className="relative inline-block">
              {t.title2}
              <span className="absolute -bottom-1 left-0 h-[4px] md:h-[6px] w-full rounded-full bg-orange-400" />
            </span>
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          <section className="lg:col-span-7">
            <div className="rounded-[40px] border border-slate-100 bg-white p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="space-y-12">
                <div>
                  <h2 className={`text-2xl font-bold text-slate-900 md:text-3xl ${whatTitleClass}`}>
                    {whatTitle}
                  </h2>
                  {whatDescription.doc ? (
                    <MandateRichText
                      doc={whatDescription.doc}
                      isKh={isKh}
                      text={whatDescription.text}
                    />
                  ) : (
                    <p
                      className={`mt-5 whitespace-pre-line text-base leading-relaxed text-slate-500 md:text-lg ${
                        whatDescriptionClass
                      }`}
                    >
                      {whatDescription.text}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className={`text-xl font-bold text-slate-900 md:text-2xl ${pathwayTitleClass}`}>
                    {pathwayTitle}
                  </h3>

                  {pathwayDescription.doc ? (
                    <MandateRichText
                      doc={pathwayDescription.doc}
                      isKh={isKh}
                      text={pathwayDescription.text}
                    />
                  ) : pathwaySteps.length > 1 ? (
                    <div
                      className={`mt-5 flex flex-wrap items-center gap-2 text-base font-medium text-slate-500 md:text-lg ${
                        pathwayDescriptionClass
                      }`}
                    >
                      {pathwaySteps.map((step, index) => (
                        <React.Fragment key={`${step}-${index}`}>
                          {index > 0 ? <span className="text-slate-300">→</span> : null}
                          <span>{step}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <p
                      className={`mt-5 whitespace-pre-line text-base leading-relaxed text-slate-500 md:text-lg ${
                        pathwayDescriptionClass
                      }`}
                    >
                      {pathwayDescription.text}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <Link
                    href="/contact-us"
                    className={`inline-flex h-14 items-center rounded-2xl bg-[#0F3D5E] px-10 text-lg font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isKh ? "khmer-font" : ""
                    }`}
                  >
                    {t.submit}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-5 flex flex-col gap-10">
            <div className="rounded-[40px] bg-[#F8FAFC] p-8 md:p-10">
              <h2 className={`text-2xl font-bold text-slate-900 ${isKh ? "khmer-font" : ""}`}>{t.progress}</h2>

              <div className="mt-8 flex items-center gap-8">
                <Donut value={progressValue} />
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#0F3D5E]">{progressValue}%</span>
                  <span
                    className={`text-slate-500 font-semibold uppercase tracking-wider text-sm ${
                      isKh ? "khmer-font normal-case" : ""
                    }`}
                  >
                    {t.resolution}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-2">
              <h2 className={`mb-6 text-2xl font-bold text-slate-900 ${isKh ? "khmer-font" : ""}`}>{t.issues}</h2>
              <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
                <MiniBarChart lang={lang} counts={issueCounts} />
              </div>
            </div>
          </aside>
        </div>

        {loading ? (
          <p className={`mt-4 text-sm text-slate-500 ${isKh ? "khmer-font" : ""}`}>
            {isKh ? "កំពុងទាញទិន្នន័យ..." : "Loading data..."}
          </p>
        ) : null}
      </div>
    </main>
  );
}
