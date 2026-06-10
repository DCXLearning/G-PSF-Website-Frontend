"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Facebook, Send } from "lucide-react";
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
        if (text === "email" || text === "e-mail" || text === "អ៊ីម៉ែល" || text === "អ៊ីមែល") {
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
                    ? x.title?.[apiKey] || x.title?.km || x.title?.kh || x.title?.en || ""
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
        d?.address?.[apiKey] || d?.address?.kh || d?.address?.km || d?.address?.en || "";

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
        d?.openTime?.[apiKey] || d?.openTime?.kh || d?.openTime?.km || d?.openTime?.en || ""
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
        address: "Address",
        contact: "Phone",
        openTime: "Open Time",
        connected: "Stay Connected",
        loadingInfo: "Loading contact info...",
        failed: "Failed to send message.",
    },
    kh: {
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

    const [form, setForm] = useState<ContactPayload>({
        firstName: "",
        lastName: "",
        email: "",
        organisationName: "",
        subject: "",
        message: "",
    });

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

    useMemo(() => {
        return (
            form.firstName.trim() &&
            form.lastName.trim() &&
            form.email.trim() &&
            form.subject.trim() &&
            form.message.trim()
        );
    }, [form]);

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
                    <div className="flex h-full min-h-[380px] flex-col rounded-3xl bg-[#1e2653] p-6 shadow-lg md:min-h-[520px] md:p-8 xl:min-h-[680px]">
                        {settingsLoading ? (
                            <div className={`!text-gray-200 ${bodyClass}`}>
                                {t.loadingInfo}
                            </div>
                        ) : settingsError ? (
                            <div className={`!text-red-400 ${bodyClass}`}>
                                {settingsError}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col space-y-7">
                                <section>
                                    <h4 className={`mb-3 !text-white ${mainTitleClass}`}>
                                        {t.address}
                                    </h4>

                                    <div className={`space-y-1.5 !text-gray-200 ${bodyClass}`}>
                                        {settings?.addressLines.map((line, idx) => (
                                            <p key={idx}>{line}</p>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h4 className={`mb-3 !text-white ${mainTitleClass}`}>
                                        {t.contact}
                                    </h4>

                                    <div className={`space-y-1.5 !text-gray-200 ${bodyClass}`}>
                                        {settings?.phones.map((phone, idx) => (
                                            <p key={idx}>{phone}</p>
                                        ))}
                                    </div>
                                </section>

                                {settings?.desks.map((desk, index) => (
                                    <section key={`${desk.label}-${index}`}>
                                        <h4 className={`mb-3 !text-white ${mainTitleClass}`}>
                                            {desk.label}
                                        </h4>

                                        <div className="space-y-1.5">
                                            {desk.emails.map((email) => (
                                                <p
                                                    key={email}
                                                    className={`break-all !text-gray-200 ${enBodyClass}`}
                                                >
                                                    {email}
                                                </p>
                                            ))}
                                        </div>
                                    </section>
                                ))}

                                <section>
                                    <h4 className={`mb-3 !text-white ${mainTitleClass}`}>
                                        {t.openTime}
                                    </h4>

                                    <div className={`space-y-1.5 !text-gray-200 ${bodyClass}`}>
                                        <p>{settings?.openDaysText}</p>
                                        <p className="whitespace-pre-line">
                                            {settings?.openTimeText}
                                        </p>
                                    </div>
                                </section>

                                <section>
                                    <h4 className={`mb-4 !text-white ${mainTitleClass}`}>
                                        {t.connected}
                                    </h4>

                                    <div className="flex items-center gap-4 !text-white">
                                        {settings?.social.facebook && (
                                            <a
                                                href={settings.social.facebook}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label="Facebook"
                                                className="rounded-full bg-[#f39233] p-3 !text-white transition hover:bg-orange-400"
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
                                                className="rounded-full bg-[#f39233] p-3 !text-white transition hover:bg-orange-400"
                                            >
                                                <Send size={20} />
                                            </a>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}