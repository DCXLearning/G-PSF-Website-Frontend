"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type ApiLang = "en" | "km";

type I18nText = {
  en?: string;
  km?: string;
};

type MandateItem = {
  title?: I18nText;
  description?: I18nText;
};

type MandatePost = {
  status?: string;
  content?: {
    en?: { items?: MandateItem[] };
    km?: { items?: MandateItem[] };
  };
};

type MandateBlock = {
  type?: string;
  enabled?: boolean;
  title?: I18nText;
  posts?: MandatePost[];
};

type MandateSectionResponse = {
  data?: {
    blocks?: MandateBlock[];
  };
};

type MandateContent = {
  whatTitle: string;
  whatDescription: string;
  pathwayTitle: string;
  pathwayDescription: string;
};

type MandateScopePageProps = {
  pageSlug?: string;
};

const DEFAULT_PAGE_SLUG = "law-tax-and-governance";

function getText(value?: string | null): string {
  const text = value?.trim() ?? "";
  return text === "." ? "" : text;
}

function pickI18nText(value: I18nText | undefined, apiLang: ApiLang): string {
  if (!value) return "";

  const primary = apiLang === "km" ? getText(value.km) : getText(value.en);
  return primary || getText(value.en) || getText(value.km);
}

function isMandateBlock(block: MandateBlock): boolean {
  if (block.type !== "text_block") {
    return false;
  }

  const title = `${getText(block.title?.en)} ${getText(block.title?.km)}`.toLowerCase();

  return (
    title.includes("mandate") ||
    title.includes("scope") ||
    title.includes("ភារកិច្ច") ||
    title.includes("វិសាលភាព")
  );
}

function mapMandateContent(
  response: MandateSectionResponse,
  apiLang: ApiLang
): MandateContent | null {
  const blocks = response.data?.blocks ?? [];

  const mandateBlock =
    blocks.find((block) => block.enabled !== false && isMandateBlock(block)) ??
    blocks.find((block) => block.enabled !== false && block.type === "text_block");

  const post =
    mandateBlock?.posts?.find((item) => item.status === "published") ??
    mandateBlock?.posts?.[0];

  if (!post) {
    return null;
  }

  const items =
    post.content?.[apiLang]?.items ??
    post.content?.en?.items ??
    post.content?.km?.items ??
    [];

  const what = items[0];
  const pathway = items[1];

  const mapped: MandateContent = {
    whatTitle: pickI18nText(what?.title, apiLang),
    whatDescription: pickI18nText(what?.description, apiLang),
    pathwayTitle: pickI18nText(pathway?.title, apiLang),
    pathwayDescription: pickI18nText(pathway?.description, apiLang),
  };

  const hasAnyText =
    Boolean(mapped.whatTitle) ||
    Boolean(mapped.whatDescription) ||
    Boolean(mapped.pathwayTitle) ||
    Boolean(mapped.pathwayDescription);

  return hasAnyText ? mapped : null;
}

function splitPathway(pathwayText: string): string[] {
  return pathwayText
    .split("→")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
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

function MiniBarChart({ lang }: { lang: Lang }) {
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
    { label: labels.resolved, value: 62, color: "#0F3D5E" },
    { label: labels.inProgress, value: 12, color: "#3A73A5" },
    { label: labels.pending, value: 5, color: "#F2A53A" },
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

        const json = (await response.json()) as MandateSectionResponse;
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
  const whatDescription = mandateContent?.whatDescription || t.whatDesc;
  const pathwayTitle = mandateContent?.pathwayTitle || t.pathway;
  const pathwayDescription = mandateContent?.pathwayDescription || t.pathwayDesc;

  const pathwaySteps = useMemo(
    () => splitPathway(pathwayDescription),
    [pathwayDescription]
  );

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
                  <h2 className={`text-2xl font-bold text-slate-900 md:text-3xl ${isKh ? "khmer-font" : ""}`}>
                    {whatTitle}
                  </h2>
                  <p className={`mt-5 text-base leading-relaxed text-slate-500 md:text-lg ${isKh ? "khmer-font" : ""}`}>
                    {whatDescription}
                  </p>
                </div>

                <div>
                  <h3 className={`text-xl font-bold text-slate-900 md:text-2xl ${isKh ? "khmer-font" : ""}`}>
                    {pathwayTitle}
                  </h3>

                  {pathwaySteps.length > 1 ? (
                    <div
                      className={`mt-5 flex flex-wrap items-center gap-2 text-base font-medium text-slate-500 md:text-lg ${
                        isKh ? "khmer-font" : ""
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
                    <p className={`mt-5 text-base leading-relaxed text-slate-500 md:text-lg ${isKh ? "khmer-font" : ""}`}>
                      {pathwayDescription}
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
                <Donut value={90} />
                <div className="flex flex-col">
                  <span className="text-4xl font-black text-[#0F3D5E]">90%</span>
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
                <MiniBarChart lang={lang} />
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
