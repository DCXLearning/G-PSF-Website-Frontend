"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type I18n = { en?: string; km?: string };

type StatApiItem = {
  label?: I18n;
  value?: I18n;
};

type StatsApiResponse = {
  success: boolean;
  data?: {
    description?: I18n | null;
    items?: StatApiItem[];
  };
  message?: string;
};

const CACHE_KEY = "stats_cache";

function pickText(obj: I18n | undefined, lang: "en" | "km") {
  if (!obj) return "";
  return (lang === "km" ? obj.km : obj.en) || obj.en || obj.km || "";
}

interface StatItemProps {
  value: string;
  label: string;
  isKhmer: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, isKhmer }) => (
  <div className="flex flex-col items-center justify-center p-3 border-5 border-dashed border-indigo-900">
    <div className="text-5xl lg:text-4xl font-extrabold text-indigo-900">
      {value}
    </div>

    <div
      className={`text-base lg:text-lg text-indigo-900 font-medium tracking-wider mt-2 opacity-90 text-center ${
        isKhmer ? "khmer-font" : ""
      }`}
    >
      {label}
    </div>
  </div>
);

function readCache(): StatsApiResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StatsApiResponse;
  } catch {
    return null;
  }
}

function writeCache(data: StatsApiResponse) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore cache errors
  }
}

function StatsBarSkeleton() {
  return (
    <section className="w-full bg-white py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="h-6 w-full max-w-3xl mx-auto bg-slate-200 rounded mb-12 animate-pulse" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-3 border-5 border-dashed border-indigo-900 animate-pulse"
            >
              <div className="h-12 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-5 w-28 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const StatsBar: React.FC = () => {
  const { language } = useLanguage();
  const isKhmer = language === "kh";
  const langKey: "en" | "km" = isKhmer ? "km" : "en";

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<StatApiItem[]>([]);
  const [desc, setDesc] = useState<I18n | null>(null);

  useEffect(() => {
    setMounted(true);

    const cached = readCache();
    if (cached?.data) {
      setItems(cached.data.items ?? []);
      setDesc(cached.data.description ?? null);
      setLoading(false);
    }

    let alive = true;

    async function run() {
      try {
        setError("");

        const res = await fetch("/api/home-page/stats", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        const json = (await res.json()) as StatsApiResponse;

        if (!res.ok || !json?.success) {
          throw new Error(json?.message || `Request failed: ${res.status}`);
        }

        if (!alive) return;

        setItems(json?.data?.items ?? []);
        setDesc(json?.data?.description ?? null);
        writeCache(json);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load stats");
        // keep old cached content, do not clear state
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, []);

  const descriptionText = useMemo(() => {
    return pickText(desc ?? undefined, langKey);
  }, [desc, langKey]);

  const uiItems = useMemo(() => {
    return (items || []).map((it) => ({
      label: pickText(it.label, langKey),
      value: pickText(it.value, langKey),
    }));
  }, [items, langKey]);

  const showSkeleton = !mounted || (loading && uiItems.length === 0);
  const showErrorOnly = !showSkeleton && error && uiItems.length === 0;

  if (showSkeleton) {
    return <StatsBarSkeleton />;
  }

  if (showErrorOnly) {
    return (
      <section className="w-full bg-white py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {descriptionText && (
          <p
            className={`text-center text-gray-600 mb-12 text-lg ${
              isKhmer ? "khmer-font" : ""
            }`}
          >
            {descriptionText}
          </p>
        )}

        {uiItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {uiItems.map((stat, index) => (
              <StatItem
                key={index}
                value={stat.value}
                label={stat.label}
                isKhmer={isKhmer}
              />
            ))}
          </div>
        ) : (
          <div className={`text-center text-gray-600 ${isKhmer ? "khmer-font" : ""}`}>
            {isKhmer ? "មិនមានទិន្នន័យស្ថិតិ" : "No stats found"}
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsBar;