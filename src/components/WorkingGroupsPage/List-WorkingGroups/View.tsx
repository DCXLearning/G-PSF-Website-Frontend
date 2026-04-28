"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";
type Status = "Resolved" | "In Progress" | "Pending";

type I18nText = {
  en?: string;
  km?: string;
};

type WgTemplateContent = {
  issuesResponses?: {
    items?: Array<{
      link?: string;
      title?: I18nText;
      status?: string;
      lastUpdate?: string;
    }>;
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

type IssueRow = {
  id: string;
  title: string;
  status: Status;
  lastUpdate: string;
  href: string;
};

type RecentIssuesPageProps = {
  pageSlug?: string;
};

const DEFAULT_PAGE_SLUG = "law-tax-and-governance";

function getText(value?: string | null): string {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

function pickI18nText(value: I18nText | undefined, apiLang: ApiLang): string {
  if (!value) {
    return "";
  }

  const primary = apiLang === "km" ? getText(value.km) : getText(value.en);
  return primary || getText(value.en) || getText(value.km);
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

function mapStatus(statusValue?: string): Status {
  const status = getText(statusValue).toLowerCase();

  if (status === "resolved") {
    return "Resolved";
  }

  if (
    status === "in_progress" ||
    status === "in progress" ||
    status === "in-progress"
  ) {
    return "In Progress";
  }

  return "Pending";
}

function mapIssueRows(response: WgTemplateResponse, apiLang: ApiLang): IssueRow[] {
  const content = pickTemplateContent(response, apiLang);
  const items = content?.issuesResponses?.items ?? [];

  const rows: IssueRow[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const title = pickI18nText(item.title, apiLang);

    if (!title) {
      continue;
    }

    rows.push({
      id: `${title}-${index}`,
      title,
      status: mapStatus(item.status),
      lastUpdate: getText(item.lastUpdate) || "-",
      href: getText(item.link) || "#",
    });
  }

  return rows;
}

function StatusPill({ status, lang }: { status: Status; lang: Lang }) {
  const label =
    lang === "kh"
      ? status === "Resolved"
        ? "ដោះស្រាយរួច"
        : status === "In Progress"
        ? "កំពុងដំណើរការ"
        : "កំពុងរង់ចាំ"
      : status;

  const styles: Record<Status, string> = {
    Resolved: "bg-emerald-100 text-slate-900",
    "In Progress": "bg-sky-100 text-slate-900",
    Pending: "bg-amber-100 text-slate-900",
  };

  return (
    <span
      className={[
        "inline-flex h-10 w-full md:w-auto md:min-w-[170px] items-center justify-center rounded-full px-6 text-sm font-semibold",
        styles[status],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function IssueLinkButton({
  href,
  label,
  isKh,
}: {
  href: string;
  label: string;
  isKh: boolean;
}) {
  const buttonClass = [
    "inline-flex h-10 w-full md:w-auto items-center justify-center rounded-full bg-[#0F3D5E] px-8 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99]",
    isKh ? "khmer-font" : "",
  ].join(" ");

  if (!href || href === "#") {
    return <span className="inline-flex h-10 w-full md:w-auto items-center justify-center rounded-full bg-slate-300 px-8 text-sm font-semibold text-white">{label}</span>;
  }

  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={buttonClass}>
      {label}
    </Link>
  );
}

export default function RecentIssuesPage({
  pageSlug = DEFAULT_PAGE_SLUG,
}: RecentIssuesPageProps) {
  const { language } = useLanguage();
  const lang = (language as Lang) ?? "en";
  const isKh = lang === "kh";
  const apiLang: ApiLang = isKh ? "km" : "en";

  const [rows, setRows] = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIssues() {
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
          setRows([]);
          return;
        }

        const json = (await response.json()) as WgTemplateResponse;
        setRows(mapIssueRows(json, apiLang));
      } catch (error) {
        if ((error as { name?: string })?.name !== "AbortError") {
          setRows([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadIssues();

    return () => {
      controller.abort();
    };
  }, [apiLang, pageSlug]);

  const t =
    lang === "kh"
      ? {
          title1: "បញ្ហាថ្មីៗ និង",
          title2: "ការឆ្លើយតប",
          issueTheme: "ប្រធានបទបញ្ហា",
          status: "ស្ថានភាព",
          lastUpdate: "បច្ចុប្បន្នភាពចុងក្រោយ",
          link: "តំណភ្ជាប់",
          lastUpdateMobile: "បច្ចុប្បន្នភាពចុងក្រោយ៖",
          view: "មើល",
          empty: "មិនទាន់មានទិន្នន័យបញ្ហា",
        }
      : {
          title1: "Recent Issues &",
          title2: "Responses",
          issueTheme: "Issue theme",
          status: "Status",
          lastUpdate: "Last update",
          link: "Link",
          lastUpdateMobile: "Last update:",
          view: "View",
          empty: "No issues found",
        };

  return (
    <main className="bg-white px-4 py-10 sm:px-6 md:px-10 lg:px-14">
      <div className="mx-auto w-full max-w-7xl px-4">
        <header className="mb-8 md:mb-10">
          <h1
            className={`text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl ${
              isKh ? "khmer-font" : ""
            }`}
          >
            {t.title1}{" "}
            <span className="relative inline-block">
              {t.title2}
              <span className="absolute -bottom-2 left-0 h-[5px] w-2/3 rounded-full bg-orange-400 md:w-full" />
            </span>
          </h1>
          {loading ? (
            <p className={`mt-3 text-sm text-slate-500 ${isKh ? "khmer-font" : ""}`}>
              {isKh ? "កំពុងទាញទិន្នន័យ..." : "Loading data..."}
            </p>
          ) : null}
        </header>

        <section className="rounded-[22px] sm:rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="hidden md:block bg-slate-50 px-6 py-6 md:px-10">
            <div
              className={`grid grid-cols-12 items-center text-sm font-bold text-slate-900 ${
                isKh ? "khmer-font" : ""
              }`}
            >
              <div className="col-span-6">{t.issueTheme}</div>
              <div className="col-span-3 text-center">{t.status}</div>
              <div className="col-span-2 text-center">{t.lastUpdate}</div>
              <div className="col-span-1 text-right">{t.link}</div>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6 md:px-10 md:py-6">
            {rows.length === 0 ? (
              <p className={`py-6 text-center text-slate-500 ${isKh ? "khmer-font" : ""}`}>
                {t.empty}
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="py-5 md:py-6 grid gap-4 grid-cols-1 md:grid-cols-12 md:items-center"
                  >
                    <div className="md:col-span-6">
                      <div
                        className={`text-base font-semibold text-slate-800 ${
                          isKh ? "khmer-font" : ""
                        }`}
                      >
                        {row.title}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 md:hidden">
                        <span className={`rounded-full bg-slate-100 px-3 py-1 ${isKh ? "khmer-font" : ""}`}>
                          {t.lastUpdateMobile}{" "}
                          <span className="font-semibold text-slate-700">{row.lastUpdate}</span>
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-3 md:text-center">
                      <div className={`mb-2 text-xs font-semibold text-slate-500 md:hidden ${isKh ? "khmer-font" : ""}`}>
                        {t.status}
                      </div>
                      <StatusPill status={row.status} lang={lang} />
                    </div>

                    <div className="hidden md:block md:col-span-2 md:text-center">
                      <span className="text-sm font-semibold text-slate-700">
                        {row.lastUpdate}
                      </span>
                    </div>

                    <div className="md:col-span-1 md:text-right">
                      <IssueLinkButton href={row.href} label={t.view} isKh={isKh} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-6 md:h-8" />
        </section>
      </div>
    </main>
  );
}
