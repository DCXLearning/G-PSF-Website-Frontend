"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import { Facebook, Send, MessageCircle, Loader2 } from "lucide-react";
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
    contact: "Contact",
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
    contact: "ទំនាក់ទំនង",
    openTime: "ម៉ោងបើកធ្វើការ",
    connected: "ភ្ជាប់ទំនាក់ទំនង",
    loadingInfo: "កំពុងផ្ទុកព័ត៌មានទំនាក់ទំនង...",
    failed: "ផ្ញើសារមិនបានជោគជ័យ។",
  },
};

/** =========================
 *  COMPONENT
 *  ========================= */
export default function ContactSection() {
  const { language } = useLanguage();
  const t = translations[language];

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
        if (mounted) {
          setSettingsError(e?.message || "Failed to load contact info.");
        }
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

  function setField<K extends keyof ContactPayload>(key: K, value: ContactPayload[K]) {
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
    <section className="max-w-7xl mx-auto px-4 pt-8 pb-10 md:pt-10 md:pb-14 bg-white">

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch mb-10">
        <div className="xl:col-span-8">
          <div className="w-full h-[380px] md:h-[520px] xl:h-[620px] overflow-hidden rounded-3xl shadow-lg border border-gray-200">
            <iframe
              title="CDC Cambodia Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770535316462!2d104.9255855758416!3d11.568305044030615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109515ad9d95963%3A0xf0260c4d444dee3a!2sThe%20Council%20for%20the%20Development%20of%20Cambodia!5e0!3m2!1sen!2skh!4v1704810000000!5m2!1sen!2skh"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="h-full bg-[#1e2653] text-white p-6 md:p-8 rounded-3xl space-y-8 shadow-lg">
            {settingsLoading ? (
              <div className={`text-sm text-gray-300 ${language === "kh" ? "khmer-font" : ""}`}>
                {t.loadingInfo}
              </div>
            ) : settingsError ? (
              <div className="text-sm rounded-lg border border-red-200 bg-red-50 text-red-700 p-3">
                {settingsError}
              </div>
            ) : (
              <>
                <section>
                  <h4
                    className={`text-xl font-semibold mb-3 ${
                      language === "kh" ? "khmer-font" : ""
                    }`}
                  >
                    {t.address}
                  </h4>
                  <p className="text-gray-300 text-sm leading-7">
                    {settings?.addressLines?.map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </section>

                <section className="space-y-4">
                  <h4
                    className={`text-xl font-semibold ${
                      language === "kh" ? "khmer-font" : ""
                    }`}
                  >
                    {t.contact}
                  </h4>

                  <div className="text-sm space-y-1 text-gray-200">
                    {settings?.phones?.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-2">
                    {settings?.desks?.map((desk) => (
                      <div key={desk.label}>
                        <p className="font-semibold text-white">{desk.label}</p>
                        {desk.emails.map((em) => (
                          <p key={em} className="text-gray-300 break-all">
                            {em}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4
                    className={`text-xl font-semibold mb-3 ${
                      language === "kh" ? "khmer-font" : ""
                    }`}
                  >
                    {t.openTime}
                  </h4>
                  <p className="text-sm text-gray-300">{settings?.openDaysText}</p>
                  <p className="text-sm text-white">{settings?.openTimeText}</p>
                </section>

                <section>
                  <h4
                    className={`text-xl font-semibold mb-4 ${
                      language === "kh" ? "khmer-font" : ""
                    }`}
                  >
                    {t.connected}
                  </h4>

                  <div className="flex items-center gap-4">
                    <a
                      href={settings?.social?.facebook || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#f39233] p-3 rounded-full hover:bg-orange-400 transition"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href={settings?.social?.telegram || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#f39233] p-3 rounded-full hover:bg-orange-400 transition"
                    >
                      <Send size={20} />
                    </a>
                    <a
                      href={settings?.social?.messenger || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#f39233] p-3 rounded-full hover:bg-orange-400 transition"
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