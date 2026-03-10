"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Mail, Phone, Globe } from "lucide-react";
import { FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import { useLanguage } from "@/app/context/LanguageContext";

/* ================= TYPES ================= */
type LangText = {
    en?: string;
    km?: string;
};

type ContactDesk = {
    title?: string;
    emails?: string[];
};

type ContactInfo = {
    desks?: ContactDesk[];
    phones?: string[];
};

type ContactByLang = {
    en?: ContactInfo;
    km?: ContactInfo;
};

type SocialLink = {
    url: string;
    icon?: string;
    title?: string;
};

type SiteSettingsData = {
    id: number;
    title?: LangText;
    description?: LangText;
    logo?: string | null;
    footerBackground?: string | null;
    address?: LangText;
    contact?: ContactByLang;
    openTime?: LangText;
    socialLinks?: SocialLink[];
    createdAt?: string;
    updatedAt?: string;
};

type SiteSettingsResponse = {
    success: boolean;
    message?: string;
    data?: SiteSettingsData;
};

interface LinkGroup {
    titleEn: string;
    titleKh: string;
    links: { nameEn: string; nameKh: string; href: string }[];
}

/* ================= STATIC DATA ================= */
const keyUpdates: LinkGroup = {
    titleEn: "KEY UPDATES",
    titleKh: "ព័ត៌មានចុងក្រោយ",
    links: [
        { nameEn: "Announcements", nameKh: "សេចក្តីប្រកាស", href: "#" },
        { nameEn: "Work Group Members", nameKh: "សមាជិកក្រុមការងារ", href: "#" },
        { nameEn: "Meeting Schedule", nameKh: "កាលវិភាគប្រជុំ", href: "#" },
        { nameEn: "Member Engagement", nameKh: "ការចូលរួមរបស់សមាជិក", href: "#" },
        { nameEn: "Press Kit", nameKh: "ឯកសារផ្សព្វផ្សាយ", href: "#" },
    ],
};

const quickLinks: LinkGroup = {
    titleEn: "QUICK LINKS",
    titleKh: "តំណភ្ជាប់លឿន",
    links: [
        { nameEn: "Member Engagement", nameKh: "ការចូលរួមរបស់សមាជិក", href: "#" },
        { nameEn: "Policy Updates", nameKh: "ព័ត៌មាននយោបាយ", href: "#" },
        { nameEn: "Market Data", nameKh: "ទិន្នន័យទីផ្សារ", href: "#" },
        { nameEn: "G-PSF Training", nameKh: "ការបណ្តុះបណ្តាល G-PSF", href: "#" },
        { nameEn: "Labor Law & Visa", nameKh: "ច្បាប់ការងារ និងវីសា", href: "#" },
        { nameEn: "Tourism Toolkit", nameKh: "ឧបករណ៍ទេសចរណ៍", href: "#" },
        { nameEn: "MIS Portal", nameKh: "ផតថល MIS", href: "#" },
    ],
};

/* ================= HELPERS ================= */
function pickText(text: LangText | undefined, language: "en" | "kh") {
    if (!text) return "";
    return language === "kh"
        ? text.km || text.en || ""
        : text.en || text.km || "";
}

function getContactData(
    contact: ContactByLang | undefined,
    language: "en" | "kh"
): ContactInfo | undefined {
    if (!contact) return undefined;
    return language === "kh"
        ? contact.km || contact.en
        : contact.en || contact.km;
}

function renderSocialIcon(icon?: string, title?: string) {
    const value = `${icon || ""} ${title || ""}`.toLowerCase();

    if (value.includes("facebook")) return <FaFacebookF />;
    if (value.includes("telegram")) return <FaTelegramPlane />;
    return <Globe size={18} />;
}

/* ================= FOOTER ================= */
const Footer: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    const [siteData, setSiteData] = useState<SiteSettingsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSiteSettings = async () => {
            try {
                const res = await fetch("/api/site-settings", {
                    cache: "no-store",
                });

                const json: SiteSettingsResponse = await res.json();

                if (res.ok && json?.success) {
                    setSiteData(json.data || null);
                }
            } catch (error) {
                console.error("Failed to fetch site settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSiteSettings();
    }, []);

    const description = useMemo(
        () => pickText(siteData?.description, language),
        [siteData, language]
    );

    const contactInfo = useMemo(
        () => getContactData(siteData?.contact, language),
        [siteData, language]
    );

    const firstPhone = contactInfo?.phones?.[0] || "";
    const firstEmail =
        contactInfo?.desks?.flatMap((desk) => desk.emails || [])?.[0] || "";

    const socialLinks = siteData?.socialLinks || [];

    return (
        <footer className="bg-white mt-0 shadow-[0_-6px_12px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-20">
                {/* ========== LOGO + DESCRIPTION ========== */}
                <div>
                    <div className="relative w-60 h-20 mb-4">
                        <Image
                            src={siteData?.logo || "/image/logo1.png"}
                            alt={pickText(siteData?.title, language) || "G-PSF Logo"}
                            fill
                            className="object-cover"
                            sizes="300px"
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <div className="h-5 w-56 bg-gray-200 animate-pulse rounded" />
                            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
                        </div>
                    ) : (
                        <p
                            className={`text-lg text-gray-800 max-w-sm leading-8 ${
                                isKhmer ? "khmer-font" : ""
                            }`}
                        >
                            {description}
                        </p>
                    )}
                </div>

                {/* ========== KEY UPDATES ========== */}
                <LinkSection group={keyUpdates} isKhmer={isKhmer} />

                {/* ========== QUICK LINKS ========== */}
                <LinkSection group={quickLinks} isKhmer={isKhmer} />

                {/* ========== CONTACT + SOCIAL ========== */}
                <div className="space-y-6">
                    <div>
                        <h3
                            className={`text-2xl font-bold mb-3 ${
                                isKhmer ? "khmer-font" : ""
                            }`}
                        >
                            {isKhmer ? "ទំនាក់ទំនង" : "CONTACT"}
                        </h3>

                        <div className="space-y-3 text-gray-700">
                            {firstPhone ? (
                                <ContactItem
                                    icon={<Phone size={18} />}
                                    text={firstPhone}
                                />
                            ) : (
                                <ContactItem
                                    icon={<Phone size={18} />}
                                    text="+855 99 799 579"
                                />
                            )}

                            {firstEmail ? (
                                <ContactItem
                                    icon={<Mail size={18} />}
                                    text={firstEmail}
                                />
                            ) : (
                                <ContactItem
                                    icon={<Mail size={18} />}
                                    text="helpdesk@cdc.gov.kh"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <h3
                            className={`text-2xl font-bold mb-3 ${
                                isKhmer ? "khmer-font" : ""
                            }`}
                        >
                            {isKhmer ? "តាមដានពួកយើង" : "FOLLOW US"}
                        </h3>

                        <div className="flex gap-3 flex-wrap">
                            {socialLinks.length > 0 ? (
                                socialLinks.map((social) => (
                                    <SocialIcon
                                        key={`${social.url}-${social.title}`}
                                        href={social.url}
                                        label={social.title || "Social Media"}
                                        icon={renderSocialIcon(
                                            social.icon,
                                            social.title
                                        )}
                                    />
                                ))
                            ) : (
                                <SocialIcon
                                    href="https://gpsf.datacolabx.com/"
                                    label="Website"
                                    icon={<Globe size={18} />}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* ================= SMALL COMPONENTS ================= */
const ContactItem = ({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) => (
    <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-[#00008b]">{icon}</span>
        <span>{text}</span>
    </div>
);

const LinkSection = ({
    group,
    isKhmer,
}: {
    group: LinkGroup;
    isKhmer: boolean;
}) => (
    <div>
        <h3 className={`text-2xl font-bold mb-4 ${isKhmer ? "khmer-font" : ""}`}>
            {isKhmer ? group.titleKh : group.titleEn}
        </h3>

        <ul className="space-y-3">
            {group.links.map((link) => (
                <li key={link.nameEn}>
                    <a
                        href={link.href}
                        className={`text-lg underline text-gray-700 hover:text-[#0808e1] transition ${
                            isKhmer ? "khmer-font" : ""
                        }`}
                    >
                        {isKhmer ? link.nameKh : link.nameEn}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

const SocialIcon = ({
    icon,
    href,
    label,
}: {
    icon: React.ReactNode;
    href: string;
    label: string;
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-[#00008b] rounded-full flex items-center justify-center text-white hover:bg-red-700 transition"
        aria-label={label}
        title={label}
    >
        {icon}
    </a>
);

export default Footer;