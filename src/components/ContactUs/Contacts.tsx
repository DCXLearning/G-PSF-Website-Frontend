/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Facebook, Send, MessageCircle } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

/** =========================
 *  TYPES
 *  ========================= */
type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  organisationName?: string;
  subject: string;
  message: string;
};

type Desk = { label: string; emails: string[] };

type SiteSettingsUI = {
  addressLines: string[];
  phones: string[];
  desks: Desk[];
  openDaysText: string;
  openTimeText: string;
  social: { facebook?: string; telegram?: string; messenger?: string };
};

/** =========================
 *  NORMALIZER
 *  ========================= */
function normalizeSiteSettings(apiJson: any): SiteSettingsUI {
  const d = apiJson?.data ?? {};

  const addressText = d?.address?.en ?? "";
  const addressLines = String(addressText)
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const contactEn = d?.contact?.en ?? {};
  const phones: string[] = Array.isArray(contactEn?.phones) ? contactEn.phones : [];

  const desks: Desk[] = Array.isArray(contactEn?.desks)
    ? contactEn.desks
        .map((x: any) => ({
          label: String(x?.title ?? "").trim(),
          emails: Array.isArray(x?.emails) ? x.emails : [],
        }))
        .filter((x: Desk) => x.label || x.emails.length)
    : [];

  const openText = String(d?.openTime?.en ?? "").trim();
  const openLines = openText
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const openDaysText = openLines[0] ?? "";
  const openTimeText = openLines.slice(1).join(" ") ?? "";

  const socialLinks: Array<{ url?: string; icon?: string }> = Array.isArray(d?.socialLinks)
    ? d.socialLinks
    : [];

  const social: SiteSettingsUI["social"] = {};
  for (const s of socialLinks) {
    const icon = String(s?.icon ?? "").toLowerCase();
    const url = String(s?.url ?? "").trim();
    if (!url) continue;

    if (icon === "facebook") social.facebook = url;
    else if (icon === "telegram") social.telegram = url;
    else if (icon === "messenger") social.messenger = url;
  }

  return { addressLines, phones, desks, openDaysText, openTimeText, social };
}

/** =========================
 *  TRANSLATIONS
 *  ========================= */
const translations = {
  en: {
    title: "Contact Us",
    subtitle_top: "Send Us a Message",
    subtitle_bottom: "to Start a Conversation",
    address: "Address",
    contact: "Contact",
    openTime: "Open Time",
    stayConnected: "Stay Connected",
    loadingContact: "Loading contact info...",
  },
  kh: {
    title: "ទាក់ទងមកយើង",
    subtitle_top: "ផ្ញើសារមកយើង",
    subtitle_bottom: "ដើម្បីចាប់ផ្តើមការសន្ទនា",
    address: "អាសយដ្ឋាន",
    contact: "ទំនាក់ទំនង",
    openTime: "ម៉ោងបើកធ្វើការ",
    stayConnected: "ភ្ជាប់ទំនាក់ទំនង",
    loadingContact: "កំពុងទាញព័ត៌មានទំនាក់ទំនង...",
  },
};

/** =========================
 *  COMPONENT
 *  ========================= */
export default function ContactSection() {
  const { language } = useLanguage();
  const t = translations[language as "en" | "kh"] ?? translations.en;

  const [form, setForm] = useState<ContactPayload>({
    firstName: "",
    lastName: "",
    email: "",
    organisationName: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [settings, setSettings] = useState<SiteSettingsUI | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      setSettingsLoading(true);
      setSettingsError("");

      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        const text = await res.text();

        let json: any = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {}

        if (!res.ok) {
          const msg = json?.message || text || `HTTP ${res.status}`;
          throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
        }

        const ui = normalizeSiteSettings(json);
        if (mounted) setSettings(ui);
      } catch (e: any) {
        if (mounted) setSettingsError(e?.message || "Failed to load contact info.");
      } finally {
        if (mounted) setSettingsLoading(false);
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return (
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.subject.trim() &&
      form.message.trim()
    );
  }, [form]);

  function set<K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!canSubmit) return;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contact/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          organisationName: form.organisationName?.trim() || undefined,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {}

      if (!res.ok) {
        const msg =
          json?.message || json?.error?.details || json?.error || text || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      setSuccessMsg("Message sent successfully!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        organisationName: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-6 pt-6 md:pt-8 md:pb-8 bg-white">
      {/* Header */}
      <div className="text-center mb-12">
        <h3 className="text-[#1e2653] text-3xl font-semibold mb-2 khmer-font">{t.title}</h3>
        <h2 className="text-3xl md:text-5xl text-[#1e2653] font-semibold khmer-font">
          {t.subtitle_top}
        </h2>
        <h2 className="text-3xl md:text-5xl text-[#1e2653] font-semibold khmer-font">
          {t.subtitle_bottom}
        </h2>
      </div>

      {/* Sidebar + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 items-stretch">
        {/* Map on right */}
        <div className="lg:col-span-2 h-[400px] md:h-[600px] bg-gray-200 overflow-hidden rounded-2xl shadow-inner">
          <iframe
            title="CDC Cambodia Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770535316462!2d104.9255855758416!3d11.568305044030615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109515ad9d95963%3A0xf0260c4d444dee3a!2sThe%20Council%20for%20the%20Development%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1704810000000!5m2!1sen!2skh"
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Sidebar */}
        <div className="bg-[#1e2653] text-white p-8 rounded-2xl space-y-8">
          {settingsLoading ? (
            <div className="text-sm text-gray-300">{t.loadingContact}</div>
          ) : settingsError ? (
            <div className="text-sm rounded-lg border border-red-200 bg-red-50 text-red-700 p-3">
              {settingsError}
            </div>
          ) : (
            <>
              <section>
                <h4 className="text-xl font-semibold mb-3">{t.address}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {settings?.addressLines?.map((line, idx) => (
                    <span key={idx}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </section>

              <section className="space-y-4">
                <h4 className="text-xl font-semibold">{t.contact}</h4>

                <div className="text-sm space-y-1">
                  {settings?.phones?.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 pt-3">
                  {settings?.desks?.map((desk) => (
                    <div key={desk.label}>
                      <p className="font-semibold">{desk.label}</p>
                      {desk.emails.map((em) => (
                        <p key={em} className="text-gray-300">
                          {em}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-xl font-semibold mb-3">{t.openTime}</h4>
                <p className="text-sm text-gray-300">{settings?.openDaysText}</p>
                <p className="text-sm">{settings?.openTimeText}</p>
              </section>

              <section>
                <h4 className="text-xl font-semibold mb-4">{t.stayConnected}</h4>
                <div className="flex space-x-4">
                  <a
                    href={settings?.social?.facebook || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#f39233] p-2 rounded-full hover:bg-orange-400 transition"
                  >
                    <Facebook size={20} />
                  </a>

                  <a
                    href={settings?.social?.telegram || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#f39233] p-2 rounded-full hover:bg-orange-400 transition"
                  >
                    <Send size={20} />
                  </a>

                  <a
                    href={settings?.social?.messenger || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#f39233] p-2 rounded-full hover:bg-orange-400 transition"
                  >
                    <MessageCircle size={20} />
                  </a>
                </div>
              </section>
            </>
          )}
        </div>

      </div>
    </div>
  );
}