"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Facebook, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type UiLang = "en" | "kh";

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  organisationName?: string;
  subject: string;
  message: string;
};

type Desk = {
  label: string;
  emails: string[];
};

type SiteSettingsUI = {
  addressLines: string[];
  phones: string[];
  desks: Desk[];
  openDaysText: string;
  openTimeText: string;
  social: {
    facebook?: string;
    telegram?: string;
    messenger?: string;
  };
};

function translateDeskLabel(label: string, lang: UiLang) {
  const text = label.trim().toLowerCase();

  if (lang === "kh") {
    if (
      text === "email" ||
      text === "e-mail" ||
      text === "អ៊ីម៉ែល" ||
      text === "អ៊ីមែល"
    ) {
      return "អ៊ីមែល";
    }

    if (text === "contact" || text === "phone") {
      return "លេខទូរស័ព្ទ";
    }

    if (text === "information" || text === "info") {
      return "ព័ត៌មាន";
    }
  }

  return label || (lang === "kh" ? "អ៊ីមែល" : "Email");
}

function normalizeDesks(desks: any[], lang: UiLang, apiKey: "en" | "km"): Desk[] {
  if (!Array.isArray(desks)) return [];

  return desks
    .map((x: any) => {
      const rawTitle =
        typeof x?.title === "object"
          ? x.title?.[apiKey] ||
          x.title?.km ||
          x.title?.kh ||
          x.title?.en ||
          ""
          : x?.title || "";

      const emails = Array.isArray(x?.emails) ? x.emails.filter(Boolean) : [];

      return {
        label: translateDeskLabel(String(rawTitle).trim(), lang),
        emails,
      };
    })
    .filter((desk) => desk.emails.length > 0);
}

function normalizeSiteSettings(apiJson: any, lang: UiLang): SiteSettingsUI {
  const d = apiJson?.data ?? {};
  const apiKey: "en" | "km" = lang === "kh" ? "km" : "en";

  const addressText =
    d?.address?.[apiKey] ||
    d?.address?.kh ||
    d?.address?.km ||
    d?.address?.en ||
    "";

  const addressLines = String(addressText)
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const currentContact = d?.contact?.[apiKey] || {};
  const enContact = d?.contact?.en || {};

  const phones: string[] = Array.isArray(currentContact?.phones)
    ? currentContact.phones
    : Array.isArray(enContact?.phones)
      ? enContact.phones
      : [];

  const currentDesks = normalizeDesks(currentContact?.desks, lang, apiKey);
  const enDesks = normalizeDesks(enContact?.desks, lang, "en");

  const desks: Desk[] = currentDesks.length > 0 ? currentDesks : enDesks;

  const openText = String(
    d?.openTime?.[apiKey] ||
    d?.openTime?.kh ||
    d?.openTime?.km ||
    d?.openTime?.en ||
    ""
  ).trim();

  const openLines = openText
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const openDaysText = openLines[0] ?? "";
  const openTimeText = openLines.slice(1).join("\n");

  const socialLinks: Array<{ url?: string; icon?: string; title?: string }> =
    d?.socialLinks ?? [];

  const social: SiteSettingsUI["social"] = {};

  for (const s of socialLinks) {
    const icon = String(s?.icon ?? "").toLowerCase();
    const title = String(s?.title ?? "").toLowerCase();
    const url = String(s?.url ?? "").trim();

    if (!url) continue;

    if (icon === "facebook" || title === "facebook") {
      social.facebook = url;
    } else if (icon === "telegram" || title === "telegram") {
      social.telegram = url;
    } else if (icon === "messenger" || title === "messenger") {
      social.messenger = url;
    }
  }

  return {
    addressLines,
    phones,
    desks,
    openDaysText,
    openTimeText,
    social,
  };
}

const translations = {
  en: {
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    organisation: "Organisation Name",
    subject: "Subject",
    message: "Your Message",
    send: "Send Message",
    sending: "Sending...",
    success: "Message sent successfully!",
    required: "Please fill in all required fields.",
    invalidEmail: "Please enter a valid email address.",
    address: "Address",
    contact: "Phone",
    openTime: "Open Time",
    connected: "Stay Connected",
    loadingInfo: "Loading contact info...",
    failed: "Failed to send message.",
  },
  kh: {
    firstName: "នាមខ្លួន",
    lastName: "នាមត្រកូល",
    email: "អ៊ីមែល",
    organisation: "ឈ្មោះអង្គការ",
    subject: "ប្រធានបទ",
    message: "សាររបស់អ្នក",
    send: "ផ្ញើសារ",
    sending: "កំពុងផ្ញើ...",
    success: "ផ្ញើសារជោគជ័យ!",
    required: "សូមបំពេញព័ត៌មានចាំបាច់ទាំងអស់។",
    invalidEmail: "សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ។",
    address: "អាសយដ្ឋាន",
    contact: "លេខទូរស័ព្ទ",
    openTime: "ម៉ោងបើកធ្វើការ",
    connected: "ភ្ជាប់ទំនាក់ទំនង",
    loadingInfo: "កំពុងផ្ទុកព័ត៌មានទំនាក់ទំនង...",
    failed: "ផ្ញើសារមិនបានជោគជ័យ។",
  },
};

export default function ContactSection() {
  const { language } = useLanguage();
  const lang: UiLang = language === "kh" ? "kh" : "en";
  const t = translations[lang];

  const isKh = lang === "kh";
  const mainTitleClass = isKh ? "main-title-km" : "main-title-en";
  const bodyClass = isKh ? "body-km" : "body-en";
  const enBodyClass = "body-en";
  const smallFontClass = isKh ? "khmer-font" : "airbnb-font";

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

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const json = await res.json();
        const ui = normalizeSiteSettings(json, lang);

        if (mounted) {
          setSettings(ui);
        }
      } catch (e: any) {
        if (mounted) {
          setSettingsError(e?.message || "Error loading settings");
        }
      } finally {
        if (mounted) {
          setSettingsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [lang]);

  const canSubmit = useMemo(() => {
    return (
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.subject.trim() &&
      form.message.trim()
    );
  }, [form]);

  function setField<K extends keyof ContactPayload>(
    key: K,
    value: ContactPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSuccessMsg("");
    setErrorMsg("");

    if (!canSubmit) {
      setErrorMsg(t.required);
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());

    if (!emailOk) {
      setErrorMsg(t.invalidEmail);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(t.failed);
      }

      setSuccessMsg(t.success);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        organisationName: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setErrorMsg(err?.message || t.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl bg-white px-4 pb-10 pt-8 md:pb-14 md:pt-10">
      <div className="mb-10 grid grid-cols-1 items-stretch gap-8 xl:grid-cols-12">
    <div className="h-full xl:col-span-8">
        <div className="h-full min-h-[380px] w-full overflow-hidden rounded-3xl border border-gray-200 shadow-lg md:min-h-[520px] xl:min-h-[680px]">
            <iframe
                title="CDC Cambodia Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770535316462!2d104.9255855758416!3d11.568305044030615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109515ad9d95963%3A0xf0260c4d444dee3a!2sThe%20Council%20for%20the%20Development%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1704810000000!5m2!1sen!2skh"
                className="h-full min-h-[380px] w-full border-0 md:min-h-[520px] xl:min-h-[680px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    </div>

    <div className="h-full xl:col-span-4">
        <div className="flex h-full min-h-[380px] flex-col space-y-8 rounded-3xl bg-[#1e2653] p-6 text-white shadow-lg md:min-h-[520px] md:p-8 xl:min-h-[680px]">
            {settingsLoading ? (
              <div className={bodyClass}>{t.loadingInfo}</div>
            ) : settingsError ? (
              <div className={`text-red-400 ${bodyClass}`}>{settingsError}</div>
            ) : (
              <>
                <section>
                  <h4 className={`mb-3 text-white ${mainTitleClass}`}>
                    {t.address}
                  </h4>

                  <div className={`text-gray-300 ${bodyClass}`}>
                    {settings?.addressLines.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h4 className={`text-white ${mainTitleClass}`}>
                    {t.contact}
                  </h4>

                  <div className={`space-y-1 text-gray-200 ${bodyClass}`}>
                    {settings?.phones.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  {settings?.desks.map((desk, index) => (
                    <div key={`${desk.label}-${index}`} className="pt-2">
                      <p className={`mb-3 text-white ${mainTitleClass}`}>
                        {desk.label}
                      </p>

                      <div className="space-y-1">
                        {desk.emails.map((em) => (
                          <p
                            key={em}
                            className={`break-all text-gray-300 ${enBodyClass}`}
                          >
                            {em}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>

                <section>
                  <h4 className={`mb-3 text-white ${mainTitleClass}`}>
                    {t.openTime}
                  </h4>

                  <p className={`text-gray-300 ${bodyClass}`}>
                    {settings?.openDaysText}
                  </p>

                  <p className={`whitespace-pre-line font-medium text-white ${bodyClass}`}>
                    {settings?.openTimeText}
                  </p>
                </section>

                <section>
                  <h4 className={`mb-3 text-white ${mainTitleClass}`}>
                    {t.connected}
                  </h4>

                  <div className="flex items-center gap-4">
                    {settings?.social.facebook && (
                      <a
                        href={settings.social.facebook}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="rounded-full bg-[#f39233] p-3 transition hover:bg-orange-400"
                      >
                        <Facebook size={20} />
                      </a>
                    )}

                    {settings?.social.telegram && (
                      <a
                        href={settings.social.telegram}
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Telegram"
                        className="rounded-full bg-[#f39233] p-3 transition hover:bg-orange-400"
                      >
                        <Send size={20} />
                      </a>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===============from contact========== */}

      {/* <div className="max-w-7xl mx-auto">
        <form onSubmit={onSubmit} className="space-y-6 bg-white rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-lg font-semibold text-[#1e2653] mb-2 ${
                  language === "kh" ? "khmer-font" : ""
                }`}
              >
                {t.firstName} <span className="text-orange-500">*</span>
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                type="text"
                placeholder="Ex. Pheak"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                className={`block text-lg font-semibold text-[#1e2653] mb-2 ${
                  language === "kh" ? "khmer-font" : ""
                }`}
              >
                {t.lastName} <span className="text-orange-500">*</span>
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                type="text"
                placeholder="Ex. Kdey"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-lg font-semibold text-[#1e2653] mb-2 ${
                  language === "kh" ? "khmer-font" : ""
                }`}
              >
                {t.email} <span className="text-orange-500">*</span>
              </label>
              <input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                type="email"
                placeholder="example@gmail.com"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label
                className={`block text-lg font-semibold text-[#1e2653] mb-2 ${
                  language === "kh" ? "khmer-font" : ""
                }`}
              >
                {t.organisation}
              </label>
              <input
                value={form.organisationName || ""}
                onChange={(e) => setField("organisationName", e.target.value)}
                type="text"
                placeholder="Enter Organisation Name"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-lg font-semibold text-[#1e2653] mb-2 ${
                language === "kh" ? "khmer-font" : ""
              }`}
            >
              {t.subject} <span className="text-orange-500">*</span>
            </label>
            <input
              value={form.subject}
              onChange={(e) => setField("subject", e.target.value)}
              type="text"
              placeholder="Enter subject here..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label
              className={`block text-lg font-semibold text-[#1e2653] mb-2 ${
                language === "kh" ? "khmer-font" : ""
              }`}
            >
              {t.message} <span className="text-orange-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setField("message", e.target.value)}
              rows={7}
              placeholder="Enter here..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {(successMsg || errorMsg) && (
            <div
              className={
                "rounded-lg border p-3 text-sm " +
                (successMsg
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700")
              }
            >
              {successMsg || errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={
              "bg-[#f39233] hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition duration-300 inline-flex items-center gap-2 " +
              (language === "kh" ? "khmer-font " : "") +
              (loading ? "opacity-70 cursor-not-allowed" : "")
            }
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {loading ? t.sending : t.send}
          </button>
        </form>
      </div> */}
    </section>
  );
}
