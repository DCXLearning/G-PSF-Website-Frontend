"use client";

import Link from "next/link";
import { CalendarDays, FileText } from "lucide-react";
import { FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import {
  buildFacebookShareUrl,
  buildTelegramShareUrl,
} from "@/utils/socialShare";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatLocalizedDate } from "@/utils/localizedDate";
import TiptapViewer, {
  type TiptapJsonContent,
} from "@/components/Common/TiptapViewer";

export type TiptapNode = TiptapJsonContent;

export type DetailPageData = {
  category: string;
  date: string;
  dateValue?: string;
  title: string;
  heroImage: string;
  tagLabel: string;
  tagHref: string;
  summary?: string;
  contentDoc?: TiptapNode | null;
  shareUrl: string;
};

type DetailPageProps = {
  data: DetailPageData;
};

type UiLang = "en" | "kh";

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

export default function DetailPage({ data }: DetailPageProps) {
  const { language } = useLanguage();

  const dateLang = normalizeUiLang(language);
  const contentLang: UiLang = shouldUseKhmerFont(data) ? "kh" : "en";

  const titleFontClass = getTitleFontClass(contentLang);
  const bodyFontClass = getBodyFontClass(contentLang);

  const hasDocContent =
    Array.isArray(data.contentDoc?.content) &&
    data.contentDoc.content.length > 0;

  const facebookShareUrl = buildFacebookShareUrl(data.shareUrl);
  const telegramShareUrl = buildTelegramShareUrl(data.shareUrl, data.title);

  const dateText = formatLocalizedDate(
    data.dateValue || data.date,
    dateLang
  );

  return (
    <section className={`bg-white ${contentLang === "kh" ? "khmer-font" : "airbnb-font"}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 pt-8">
        <div className="inline-flex flex-col">
          <span
            className={`text-slate-700 ${bodyFontClass}`}
            style={{ fontWeight: 600 }}
          >
            {data.category}
          </span>
          <span className="mt-1 h-[3px] w-20 rounded-full bg-amber-500" />
        </div>

        <h1
          className={`mt-4 max-w-5xl tracking-tight text-[#0f1637] ${titleFontClass}`}
          style={{ fontWeight: 600 }}
        >
          {data.title}
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
            {data.tagLabel}
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={`text-[#2f2f2f] ${bodyFontClass}`}
            style={{ fontWeight: 600 }}
          >
            Share:
          </span>

          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share ${data.title} on Facebook`}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#1877F2] text-white transition hover:scale-105"
          >
            <FaFacebookF className="h-3.5 w-3.5" />
          </a>

          <a
            href={telegramShareUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Share ${data.title} on Telegram`}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#27A7E7] text-white transition hover:scale-105"
          >
            <FaTelegramPlane className="h-3.5 w-3.5" />
          </a>
        </div>

        <article className={`mt-6 max-w-7xl text-slate-700 ${bodyFontClass}`}>
          {hasDocContent && data.contentDoc ? (
            <TiptapViewer
              content={data.contentDoc}
              className={`mt-2 ${bodyFontClass}`}
            />
          ) : null}

          {!hasDocContent ? (
            <p
              className={`mt-4 text-slate-500 ${bodyFontClass}`}
              style={{ fontWeight: 400 }}
            >
              No detail content available.
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function containsKhmer(value?: string): boolean {
  return /[\u1780-\u17FF]/.test(value ?? "");
}

function shouldUseKhmerFont(data: DetailPageData): boolean {
  const docText = data.contentDoc
    ? extractPlainText(data.contentDoc.content ?? [])
    : "";

  const fullText = `${data.category} ${data.title} ${data.tagLabel} ${
    data.summary ?? ""
  } ${docText}`;

  return containsKhmer(fullText);
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
