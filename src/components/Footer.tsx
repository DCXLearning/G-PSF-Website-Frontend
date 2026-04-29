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

type FooterMenuItem = {
    id: number;
    label: {
        en: string;
        km: string;
    };
    url: string;
    orderIndex?: number;
};

type FooterMenuResponse = {
    success: boolean;
    message?: string;
    data?: {
        menu?: {
            id: number;
            name: string;
            slug: string;
        } | null;
        items?: FooterMenuItem[];
    };
};

interface LinkItem {
    nameEn: string;
    nameKh: string;
    href: string;
}

interface LinkGroup {
    titleEn: string;
    titleKh: string;
    links: LinkItem[];
}

/* ================= DEFAULT DATA ================= */
const emptyKeyUpdates: LinkGroup = {
    titleEn: "KEY UPDATES",
    titleKh: "ព័ត៌មានចុងក្រោយ",
    links: [],
};

const emptyQuickLinks: LinkGroup = {
    titleEn: "QUICK LINKS",
    titleKh: "តំណភ្ជាប់លឿន",
    links: [],
};

/* ================= HELPERS ================= */
const ASSET_BASE_URL =
    process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
    "https://api-gpsf.datacolabx.com";

function pickText(text: LangText | undefined, language: "en" | "kh") {
    if (!text) return "";
    return language === "kh" ? text.km || text.en || "" : text.en || text.km || "";
}

function getContactData(
    contact: ContactByLang | undefined,
    language: "en" | "kh"
): ContactInfo | undefined {
    if (!contact) return undefined;
    return language === "kh" ? contact.km || contact.en : contact.en || contact.km;
}

function getAssetUrl(url?: string | null) {
    if (!url || !url.trim()) return "/image/logo1.png";

    const cleanUrl = url.trim();

    if (
        cleanUrl.startsWith("http://") ||
        cleanUrl.startsWith("https://") ||
        cleanUrl.startsWith("data:") ||
        cleanUrl.startsWith("blob:")
    ) {
        return cleanUrl;
    }

    if (cleanUrl.startsWith("/")) {
        return `${ASSET_BASE_URL.replace(/\/$/, "")}${cleanUrl}`;
    }

    return `${ASSET_BASE_URL.replace(/\/$/, "")}/${cleanUrl}`;
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

    const [keyUpdateLinks, setKeyUpdateLinks] = useState<LinkItem[]>([]);
    const [quickLinks, setQuickLinks] = useState<LinkItem[]>([]);

    const [menuLoading, setMenuLoading] = useState(true);
    const [quickLoading, setQuickLoading] = useState(true);

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

    useEffect(() => {
        const fetchFooterMenu = async () => {
            try {
                const res = await fetch("/api/footer", {
                    cache: "no-store",
                });

                const json: FooterMenuResponse = await res.json();

                if (res.ok && json?.success) {
                    const items = (json.data?.items || []).map((item) => ({
                        nameEn: item.label?.en || "Untitled",
                        nameKh: item.label?.km || item.label?.en || "Untitled",
                        href: item.url || "#",
                    }));

                    setKeyUpdateLinks(items);
                }
            } catch (error) {
                console.error("Failed to fetch footer menu:", error);
            } finally {
                setMenuLoading(false);
            }
        };

        fetchFooterMenu();
    }, []);

    useEffect(() => {
        const fetchQuickLinks = async () => {
            try {
                const res = await fetch("/api/quick-link", {
                    cache: "no-store",
                });

                const json: FooterMenuResponse = await res.json();

                if (res.ok && json?.success) {
                    const items = (json.data?.items || []).map((item) => ({
                        nameEn: item.label?.en || "Untitled",
                        nameKh: item.label?.km || item.label?.en || "Untitled",
                        href: item.url || "#",
                    }));

                    setQuickLinks(items);
                }
            } catch (error) {
                console.error("Failed to fetch quick links menu:", error);
            } finally {
                setQuickLoading(false);
            }
        };

        fetchQuickLinks();
    }, []);

    const title = useMemo(
        () => pickText(siteData?.title, language),
        [siteData, language]
    );

    const description = useMemo(
        () => pickText(siteData?.description, language),
        [siteData, language]
    );

    const logoSrc = useMemo(() => getAssetUrl(siteData?.logo), [siteData?.logo]);

    const contactInfo = useMemo(
        () => getContactData(siteData?.contact, language),
        [siteData, language]
    );

    const firstPhone = contactInfo?.phones?.[0] || "";
    const firstEmail =
        contactInfo?.desks?.flatMap((desk) => desk.emails || [])?.[0] || "";

    const socialLinks = siteData?.socialLinks || [];

    const keyUpdates = useMemo(
        () => ({
            ...emptyKeyUpdates,
            links: keyUpdateLinks,
        }),
        [keyUpdateLinks]
    );

    const quickLinksGroup = useMemo(
        () => ({
            ...emptyQuickLinks,
            links: quickLinks,
        }),
        [quickLinks]
    );

    return (
        <footer className="bg-white mt-0 shadow-[0_-6px_12px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-20">
                {/* ========== LOGO + DESCRIPTION ========== */}
                {/* ========== LOGO + DESCRIPTION ========== */}
                <div className="flex flex-col items-start text-left sm:items-center sm:text-center">
                    <div className="relative w-60 h-20 mb-5 -mt-3">
                        <Image
                            src={siteData?.logo || "/image/logo1.png"}
                            alt={title || "G-PSF Logo"}
                            fill
                            className="object-cover object-left sm:object-center"
                            sizes="240px"
                            unoptimized
                        />
                    </div>

                    {loading ? (
                        <div className="space-y-3 flex flex-col items-start sm:items-center">
                            <div className="h-5 w-56 bg-gray-200 animate-pulse rounded" />
                            <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
                        </div>
                    ) : (
                        <p
                            className={`text-lg text-gray-800 max-w-sm leading-8 text-left sm:text-center ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {description}
                        </p>
                    )}
                </div>

                {/* ========== KEY UPDATES ========== */}
                <LinkSection group={keyUpdates} isKhmer={isKhmer} loading={menuLoading} />

                {/* ========== QUICK LINKS ========== */}
                <LinkSection
                    group={quickLinksGroup}
                    isKhmer={isKhmer}
                    loading={quickLoading}
                />

                {/* ========== CONTACT + SOCIAL ========== */}
                <div className="space-y-6">
                    <div>
                        <h3
                            className={`text-2xl font-bold mb-3 ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {isKhmer ? "ទំនាក់ទំនង" : "CONTACT"}
                        </h3>

                        <div className="space-y-3 text-gray-700">
                            {firstPhone ? (
                                <ContactItem icon={<Phone size={18} />} text={firstPhone} />
                            ) : (
                                <ContactItem icon={<Phone size={18} />} text="+855 99 799 579" />
                            )}

                            {firstEmail ? (
                                <ContactItem icon={<Mail size={18} />} text={firstEmail} />
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
                            className={`text-2xl font-bold mb-3 ${isKhmer ? "khmer-font" : ""
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
                                        icon={renderSocialIcon(social.icon, social.title)}
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
    loading = false,
}: {
    group: LinkGroup;
    isKhmer: boolean;
    loading?: boolean;
}) => (
    <div>
        <h3 className={`text-2xl font-bold mb-4 ${isKhmer ? "khmer-font" : ""}`}>
            {isKhmer ? group.titleKh : group.titleEn}
        </h3>

        {loading ? (
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-5 w-40 bg-gray-200 animate-pulse rounded" />
                ))}
            </div>
        ) : (
            <ul className="space-y-3">
                {group.links.map((link) => (
                    <li key={`${link.nameEn}-${link.href}`}>
                        <a
                            href={link.href}
                            className={`text-lg text-gray-700 hover:text-[#0808e1] transition ${isKhmer ? "khmer-font" : ""
                                }`}
                        >
                            {isKhmer ? link.nameKh : link.nameEn}
                        </a>
                    </li>
                ))}
            </ul>
        )}
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