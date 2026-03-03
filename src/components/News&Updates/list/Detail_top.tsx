"use client";

import React, { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";

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

export type DetailPageData = {
  category: string;
  date: string;
  title: string;
  heroImage: string;
  tagLabel: string;
  tagHref: string;
  summary?: string;
  contentDoc?: TiptapNode | null;
};

type DetailPageProps = {
  data: DetailPageData;
};

export default function DetailPage({ data }: DetailPageProps) {
  const hasDocContent = Array.isArray(data.contentDoc?.content) && data.contentDoc.content.length > 0;
  const isKhmerContent = shouldUseKhmerFont(data);
  const khmerClass = isKhmerContent ? "khmer-font" : "";
  const heroImage = data.heroImage.trim();

  return (
    <section className={`bg-white ${khmerClass}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 pt-8">
        <div className="inline-flex flex-col">
          <span className={`text-lg font-semibold text-slate-700 ${khmerClass}`}>{data.category}</span>
          <span className="mt-1 h-[3px] w-20 rounded-full bg-amber-500" />
        </div>

        <h1 className={`mt-4 max-w-5xl text-3xl font-semibold leading-tight tracking-tight text-[#0f1637] md:text-4xl ${khmerClass}`}>
          {data.title}
        </h1>

        <div className={`mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-600 ${khmerClass}`}>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>{data.date}</span>
          </div>

          <Link
            href={data.tagHref}
            className="inline-flex items-center gap-3 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-amber-50 text-amber-600">
              <FileText className="h-4 w-4" />
            </span>
            {data.tagLabel}
          </Link>
        </div>

        {heroImage ? <HeroImage src={heroImage} alt={data.title} /> : null}

        <article className={`mt-6 max-w-7xl text-slate-700 ${khmerClass}`}>
          {hasDocContent && data.contentDoc ? (
            <div className="mt-2">
              <TiptapRenderer doc={data.contentDoc} />
            </div>
          ) : null}

          {!hasDocContent ? (
            <p className="mt-4 text-[18px] leading-7 text-slate-500">
              No detail content available.
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
      <div className="relative aspect-[16/9] w-full">
        {!failed && src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
            Image not available
          </div>
        )}
      </div>
    </div>
  );
}

function TiptapRenderer({ doc }: { doc: TiptapNode }) {
  const nodes = doc.content ?? [];
  return <>{renderNodes(nodes, "root")}</>;
}

function containsKhmer(value?: string): boolean {
  return /[\u1780-\u17FF]/.test(value ?? "");
}

function shouldUseKhmerFont(data: DetailPageData): boolean {
  const docText = data.contentDoc ? extractPlainText(data.contentDoc.content ?? []) : "";
  const fullText = `${data.category} ${data.title} ${data.tagLabel} ${data.summary ?? ""} ${docText}`;
  return containsKhmer(fullText);
}

function renderNodes(nodes: TiptapNode[], path: string): ReactNode[] {
  return nodes.map((node, index) => renderNode(node, `${path}-${index}`));
}

function renderNode(node: TiptapNode, key: string): ReactNode {
  const type = node.type ?? "";
  const content = node.content ?? [];
  const attrs = node.attrs ?? {};
  const style = getTextAlignStyle(attrs);

  if (type === "doc") {
    return <React.Fragment key={key}>{renderNodes(content, key)}</React.Fragment>;
  }

  if (type === "text") {
    return <React.Fragment key={key}>{applyMarks(node.text ?? "", node.marks, key)}</React.Fragment>;
  }

  if (type === "hardBreak") {
    return <br key={key} />;
  }

  if (type === "paragraph") {
    return (
      <p key={key} className="mt-4 text-[18px] leading-7" style={style}>
        {renderNodes(content, key)}
      </p>
    );
  }

  if (type === "heading") {
    const level = normalizeHeadingLevel(attrs.level);
    const headingClass = getHeadingClass(level);

    if (level === 1) {
      return (
        <h1 key={key} className={headingClass} style={style}>
          {renderNodes(content, key)}
        </h1>
      );
    }

    if (level === 2) {
      return (
        <h2 key={key} className={headingClass} style={style}>
          {renderNodes(content, key)}
        </h2>
      );
    }

    if (level === 3) {
      return (
        <h3 key={key} className={headingClass} style={style}>
          {renderNodes(content, key)}
        </h3>
      );
    }

    if (level === 4) {
      return (
        <h4 key={key} className={headingClass} style={style}>
          {renderNodes(content, key)}
        </h4>
      );
    }

    if (level === 5) {
      return (
        <h5 key={key} className={headingClass} style={style}>
          {renderNodes(content, key)}
        </h5>
      );
    }

    return (
      <h6 key={key} className={headingClass} style={style}>
        {renderNodes(content, key)}
      </h6>
    );
  }

  if (type === "bulletList") {
    return (
      <ul key={key} className="mt-4 list-disc pl-6 space-y-2" style={style}>
        {renderNodes(content, key)}
      </ul>
    );
  }

  if (type === "orderedList") {
    const start = typeof attrs.start === "number" ? attrs.start : 1;
    return (
      <ol key={key} start={start} className="mt-4 list-decimal pl-6 space-y-2" style={style}>
        {renderNodes(content, key)}
      </ol>
    );
  }

  if (type === "listItem") {
    return (
      <li key={key} className="leading-7">
        {renderNodes(content, key)}
      </li>
    );
  }

  if (type === "blockquote") {
    return (
      <blockquote key={key} className="mt-4 border-l-4 border-amber-500 pl-4 italic text-slate-700" style={style}>
        {renderNodes(content, key)}
      </blockquote>
    );
  }

  if (type === "codeBlock") {
    return (
      <pre key={key} className="mt-4 overflow-x-auto rounded bg-slate-900 p-4 text-sm text-slate-100" style={style}>
        <code>{extractPlainText(content)}</code>
      </pre>
    );
  }

  if (type === "horizontalRule") {
    return <hr key={key} className="my-6 border-slate-300" />;
  }

  if (type === "image") {
    const src = typeof attrs.src === "string" ? attrs.src : "";
    const alt = typeof attrs.alt === "string" ? attrs.alt : "Image";

    if (!src) {
      return null;
    }

    return (
      <figure key={key} className="mt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="w-full rounded-md border border-slate-200" />
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
        <div className="relative w-full overflow-hidden rounded-md border border-slate-200" style={{ paddingBottom: "56.25%" }}>
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
        <table className="min-w-full border-collapse border border-slate-300">
          <tbody>{renderNodes(content, key)}</tbody>
        </table>
      </div>
    );
  }

  if (type === "tableRow") {
    return <tr key={key}>{renderNodes(content, key)}</tr>;
  }

  if (type === "tableHeader") {
    return (
      <th key={key} className="border border-slate-300 bg-slate-100 px-3 py-2 text-left font-semibold" style={style}>
        {renderNodes(content, key)}
      </th>
    );
  }

  if (type === "tableCell") {
    return (
      <td key={key} className="border border-slate-300 px-3 py-2" style={style}>
        {renderNodes(content, key)}
      </td>
    );
  }

  if (content.length > 0) {
    return <div key={key}>{renderNodes(content, key)}</div>;
  }

  return null;
}

function applyMarks(text: string, marks: TiptapMark[] | undefined, keyBase: string): ReactNode {
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
      result = <code key={markKey} className="rounded bg-slate-100 px-1">{result}</code>;
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
      const target = typeof mark.attrs?.target === "string" ? mark.attrs.target : undefined;
      const rel = typeof mark.attrs?.rel === "string"
        ? mark.attrs.rel
        : target === "_blank"
          ? "noopener noreferrer"
          : undefined;

      result = (
        <a key={markKey} href={href} target={target} rel={rel} className="underline text-blue-700 break-words">
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
  const textAlign = typeof attrs.textAlign === "string" ? attrs.textAlign : "";

  if (textAlign === "left" || textAlign === "center" || textAlign === "right" || textAlign === "justify") {
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
  if (level === 1) return "mt-6 text-4xl font-bold text-slate-900";
  if (level === 2) return "mt-6 text-3xl font-bold text-slate-900";
  if (level === 3) return "mt-6 text-2xl font-bold text-slate-900";
  if (level === 4) return "mt-6 text-xl font-bold text-slate-900";
  if (level === 5) return "mt-6 text-lg font-bold text-slate-900";
  return "mt-6 text-base font-bold text-slate-900";
}

function getStringAttr(attrs: Record<string, unknown>, key: string): string {
  const value = attrs[key];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeVideoUrl(url: string): string {
  if (!url) {
    return "";
  }

  // Convert common YouTube URLs to embed URL.
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

  // Keep as provided for already-embedded or direct video URLs.
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
