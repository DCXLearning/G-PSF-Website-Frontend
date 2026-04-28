"use client";

import { useEffect, useState, type FC, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, Globe, ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";

type SubChildItem = {
    href: string;
    label: string;
};

type ApiNavItem = {
    id?: number;
    label?: {
        en?: string;
        km?: string;
    };
    url?: string;
    children?: ApiNavItem[];
};

type ChildItem = {
    label: string;
    href?: string;
    children?: SubChildItem[];
};

type NavItem = {
    label?: string;
    href?: string;
    children?: ChildItem[];
};

type SiteText = {
    en?: string;
    km?: string;
};

type SiteSettingsData = {
    logo?: string | null;
    title?: SiteText;
};

type SiteSettingsResponse = {
    success?: boolean;
    data?: SiteSettingsData | null;
};

const FALLBACK_LOGO_SRC = "/image/logo2.png";

const MENU_API_ENDPOINT = "/api/main-nav";
const SITE_SETTINGS_API_ENDPOINT = "/api/site-settings";

const FALLBACK_NAV_ITEMS: Record<Lang, NavItem[]> = {
    en: [
        { label: "About Us", href: "/about-us" },
        { label: "Plenary", href: "/plenary" },
        { label: "Working Groups", href: "/working-groups" },
        {
            label: "Publication",
            href: "/publication",
            children: [
                { label: "Laws & Regulations", href: "/publication/laws-regulations" },
                { label: "Decisions", href: "/publication/decisions" },
                { label: "Reform Tracker", href: "/publication/reform-tracker" },
                { label: "Reports", href: "/publication/reports" },
            ],
        },
        {
            label: "News & Update",
            href: "/new-update",
            children: [
                { label: "Featured", href: "/new-update/featured" },
                {
                    label: "Media",
                    children: [
                        { label: "Press", href: "/new-update/media/press" },
                        { label: "Photos", href: "/new-update/media/photos" },
                        { label: "Video", href: "/new-update/media/video" },
                    ],
                },
            ],
        },
        { label: "MIS", href: "/mis-dashboard" },
        { label: "Contact Us", href: "/contact-us" },
    ],
    kh: [
        { label: "អំពីពួកយើង", href: "/about-us" },
        { label: "កិច្ចប្រជុំពេញអង្គ", href: "/plenary" },
        { label: "ក្រុមការងារ", href: "/working-groups" },
        {
            label: "បណ្ដុំឯកសារ",
            href: "/publication",
            children: [
                { label: "ច្បាប់ និងបទប្បញ្ញត្តិ", href: "/publication/laws-regulations" },
                { label: "សេចក្តីសម្រេច", href: "/publication/decisions" },
                { label: "តាមដានកំណែទម្រង់", href: "/publication/reform-tracker" },
                { label: "របាយការណ៍", href: "/publication/reports" },
            ],
        },
        {
            label: "ព័ត៌មាន និងបច្ចុប្បន្នភាព",
            href: "/new-update",
            children: [
                { label: "ព័ត៌មានលេចធ្លោ", href: "/new-update/featured" },
                {
                    label: "មេឌៀ",
                    children: [
                        { label: "ពត៌មានលេចធ្លោ", href: "/new-update/media/press" },
                        { label: "រូបថត", href: "/new-update/media/photos" },
                        { label: "វីដេអូ", href: "/new-update/media/video" },
                    ],
                },
            ],
        },
        { label: "ផ្ទាំង MIS", href: "/mis-dashboard" },
        { label: "ទាក់ទងមកពួកយើង", href: "/contact-us" },
    ],
};

function getApiLabel(item: ApiNavItem, language: Lang) {
    return language === "kh"
        ? item.label?.km || item.label?.en || "Untitled"
        : item.label?.en || item.label?.km || "Untitled";
}

function isHomeItem(item: ApiNavItem) {
    const englishLabel = item.label?.en?.trim().toLowerCase();
    const khmerLabel = item.label?.km?.trim();

    return item.url === "/" || englishLabel === "home" || khmerLabel === "ទំព័រដើម";
}

function buildSubChildItems(items: ApiNavItem[] = [], language: Lang): SubChildItem[] {
    return items.map((item) => ({
        label: getApiLabel(item, language),
        href: item.url || "#",
    }));
}

function buildChildItems(items: ApiNavItem[] = [], language: Lang): ChildItem[] {
    return items.map((item) => ({
        label: getApiLabel(item, language),
        href: item.url || "#",
        children:
            item.children && item.children.length > 0
                ? buildSubChildItems(item.children, language)
                : undefined,
    }));
}

function buildNavItems(items: ApiNavItem[] = [], language: Lang): NavItem[] {
    return items
        .filter((item) => !isHomeItem(item))
        .map((item) => ({
            label: getApiLabel(item, language),
            href: item.url || "#",
            children:
                item.children && item.children.length > 0
                    ? buildChildItems(item.children, language)
                    : undefined,
        }));
}

function pickSiteText(text: SiteText | undefined, language: Lang) {
    if (!text) return "";
    return language === "kh"
        ? text.km?.trim() || text.en?.trim() || ""
        : text.en?.trim() || text.km?.trim() || "";
}

const normalizePath = (value?: string | null) => {
    if (!value) return "/";
    const normalized = value.split("?")[0].split("#")[0].replace(/\/+$/, "");
    return normalized || "/";
};

const isPathActive = (pathname: string, href?: string) => {
    if (!href || href === "#") return false;

    const currentPath = normalizePath(pathname);
    const targetPath = normalizePath(href);

    if (targetPath === "/") {
        return currentPath === "/";
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const Header: FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
    const [openMobileSubDropdown, setOpenMobileSubDropdown] = useState<string | null>(null);
    const [navItems, setNavItems] = useState<Record<Lang, NavItem[]>>(FALLBACK_NAV_ITEMS);
    const [siteSettings, setSiteSettings] = useState<SiteSettingsData | null>(null);
    const [failedLogoSrc, setFailedLogoSrc] = useState("");

    const { language, toggleLanguage } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const searchPlaceholder = language === "en" ? "Search..." : "ស្វែងរក...";
    const mobileLanguageText = language === "en" ? "Switch to Khmer" : "ប្ដូរទៅ English";

    const backendLogo = siteSettings?.logo?.trim() || "";
    const logoSrc = backendLogo && failedLogoSrc !== backendLogo ? backendLogo : FALLBACK_LOGO_SRC;
    const logoAlt = pickSiteText(siteSettings?.title, language) || "G-PSF Logo";

    const translateFlagSrc = language === "en" ? "/image/flagkhmer.jpg" : "/image/english.png";
    const translateFlagAlt = language === "en" ? "Khmer" : "English";

    const handleSearch = () => {
        const keyword = searchValue.trim();
        router.push(`/search${keyword ? `?q=${encodeURIComponent(keyword)}` : ""}`);
        setIsSearchOpen(false);
        setIsMenuOpen(false);
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSearch();
    };

    useEffect(() => {
        const controller = new AbortController();

        const loadMenu = async () => {
            try {
                const response = await fetch(MENU_API_ENDPOINT, {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) return;

                const result = await response.json();

                if (Array.isArray(result?.data?.items) && result.data.items.length > 0) {
                    setNavItems({
                        en: buildNavItems(result.data.items, "en"),
                        kh: buildNavItems(result.data.items, "kh"),
                    });
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                console.error("Failed to load main nav menu:", error);
            }
        };

        void loadMenu();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const loadSiteSettings = async () => {
            try {
                const response = await fetch(SITE_SETTINGS_API_ENDPOINT, {
                    cache: "no-store",
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) return;

                const result: SiteSettingsResponse = await response.json();

                if (result?.success && result.data) {
                    setSiteSettings(result.data);
                }
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") return;
                console.error("Failed to load site settings:", error);
            }
        };

        void loadSiteSettings();

        return () => controller.abort();
    }, []);

    const isParentActive = (item: NavItem) => {
        if (isPathActive(pathname, item.href)) return true;

        if (item.children && item.children.length > 0) {
            return item.children.some((child) => {
                if (isPathActive(pathname, child.href)) return true;

                if (child.children && child.children.length > 0) {
                    return child.children.some((sub) => isPathActive(pathname, sub.href));
                }

                return false;
            });
        }

        return false;
    };

    return (
        <section className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 md:px-2 py-3">
                <div className="flex items-center justify-between gap-5">
                    <Link href="/" className="flex shrink-0 items-center">
                        <Image
                            src={logoSrc}
                            alt={logoAlt}
                            width={150}
                            height={56}
                            className="object-contain max-h-[58px] w-auto"
                            priority
                            onError={() => {
                                if (backendLogo) {
                                    setFailedLogoSrc(backendLogo);
                                }
                            }}
                        />
                    </Link>

                    <div className="hidden lg:flex flex-1 justify-center items-center gap-x-6 xl:gap-x-7">
                        {navItems[language].map((item, index) => {
                            const isActive = isParentActive(item);

                            if (item.children && item.children.length > 0) {
                                return (
                                    <div key={`${item.label}-${index}`} className="relative group shrink-0">
                                        <Link
                                            href={item.href || "#"}
                                            className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap pb-1 transition-colors ${isActive ? "text-black" : "text-gray-600 hover:text-black"
                                                } ${language === "kh" ? "khmer-font" : ""}`}
                                        >
                                            <span className="block text-base font-medium leading-none">
                                                {item.label}
                                            </span>
                                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                            <span
                                                className={`absolute left-0 -bottom-1 h-[2px] bg-orange-500 transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                                                    }`}
                                            />
                                        </Link>

                                        <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                            <div className="min-w-[260px] bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                                                {item.children.map((child) => {
                                                    const isChildActive =
                                                        isPathActive(pathname, child.href) ||
                                                        child.children?.some((sub) => isPathActive(pathname, sub.href));

                                                    if (child.children && child.children.length > 0) {
                                                        return (
                                                            <div key={child.label} className="relative group/sub">
                                                                <div
                                                                    className={`flex items-center justify-between px-4 py-3 text-base font-medium cursor-pointer transition-colors ${isChildActive
                                                                        ? "bg-gray-50 text-black font-semibold"
                                                                        : "text-gray-700 hover:bg-gray-50 hover:text-black"
                                                                        } ${language === "kh" ? "khmer-font" : ""}`}
                                                                >
                                                                    <span>{child.label}</span>
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </div>

                                                                <div className="absolute left-full top-0 ml-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                                    <div className="min-w-[240px] bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                                                                        {child.children.map((sub) => {
                                                                            const isSubActive = isPathActive(pathname, sub.href);

                                                                            return (
                                                                                <Link
                                                                                    key={sub.href}
                                                                                    href={sub.href}
                                                                                    className={`block px-4 py-3 text-sm transition-colors ${isSubActive
                                                                                        ? "bg-gray-50 text-black font-semibold"
                                                                                        : "text-gray-700 hover:bg-gray-50 hover:text-black"
                                                                                        } ${language === "kh" ? "khmer-font" : ""}`}
                                                                                >
                                                                                    {sub.label}
                                                                                </Link>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href || "#"}
                                                            className={`block px-4 py-3 text-base font-medium transition-colors ${isChildActive
                                                                ? "bg-gray-50 text-black font-semibold"
                                                                : "text-gray-700 hover:bg-gray-50 hover:text-black"
                                                                } ${language === "kh" ? "khmer-font" : ""}`}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={`${item.href}-${index}`}
                                    href={item.href || "#"}
                                    className={`relative shrink-0 whitespace-nowrap pb-1 transition-colors ${isActive ? "text-black" : "text-gray-600 hover:text-black"
                                        } ${language === "kh" ? "khmer-font" : ""}`}
                                >
                                    <span className="block text-base font-medium leading-none">{item.label}</span>
                                    <span
                                        className={`absolute left-0 -bottom-1 h-[2px] bg-orange-400 transition-all duration-300 ${isActive ? "w-full" : "w-0"
                                            }`}
                                    />
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <div className="hidden lg:block" />

                        <form
                            onSubmit={handleSearchSubmit}
                            className="hidden lg:flex h-9 w-[190px] xl:w-[220px] items-center gap-2 rounded-full border border-gray-200 bg-white px-3 shadow-[0_3px_12px_rgba(15,23,42,0.05)] transition-all focus-within:border-gray-300 focus-within:shadow-[0_5px_18px_rgba(15,23,42,0.08)]"
                        >
                            <Search className="h-5 w-5 shrink-0 text-gray-400" />

                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder={searchPlaceholder}
                                className={`h-full min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 ${language === "kh" ? "khmer-font" : ""
                                    }`}
                            />
                        </form>

                        <button
                            onClick={() => {
                                setIsSearchOpen((s) => !s);
                                setIsMenuOpen(false);
                            }}
                            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                            type="button"
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5 text-gray-600" />
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className="group flex items-center cursor-pointer justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2 px-2 shadow-sm transition-all duration-200 hover:border-blue-100 hover:bg-slate-50 active:scale-95"
                            type="button"
                            aria-label="Translate language"
                            title={language === "en" ? "ភាសាខ្មែរ" : "English"}
                        >
                            {/* Flag Container */}
                            <div className="relative h-4 w-6 overflow-hidden rounded-[2px] border border-gray-100">
                                <Image
                                    src={translateFlagSrc}
                                    alt={translateFlagAlt}
                                    fill
                                    className="object-cover rounded-[2px]"
                                />
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                setIsMenuOpen((m) => !m);
                                setIsSearchOpen(false);
                            }}
                            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:shadow-md transition-all"
                            type="button"
                            aria-label="Menu"
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {isSearchOpen && (
                <div className="lg:hidden border-t border-gray-200 px-4 py-3 bg-gray-50">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="mx-auto flex h-11 max-w-7xl items-center gap-2 rounded-full border border-gray-200 bg-white px-4 shadow-sm"
                    >
                        <Search className="w-4 h-4 text-gray-400" />

                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder={searchPlaceholder}
                            className={`h-full min-w-0 flex-1 outline-none bg-transparent text-sm ${language === "kh" ? "khmer-font" : ""
                                }`}
                        />

                        <button
                            type="submit"
                            className={`text-sm font-semibold cursor-pointer text-gray-700 ${language === "kh" ? "khmer-font" : ""
                                }`}
                        >
                            {language === "en" ? "Go" : "ស្វែងរក"}
                        </button>
                    </form>
                </div>
            )}

            {isMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[60]">
                    <button
                        type="button"
                        aria-label="Close menu"
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute inset-0 bg-black/40"
                    />

                    <div className="absolute right-0 top-0 h-full w-[86%] max-w-[340px] bg-white shadow-2xl overflow-y-auto">
                        <div className="flex items-center justify-between px-4 py-4 border-b">
                            <div className={`font-semibold text-gray-800 ${language === "kh" ? "khmer-font" : ""}`}>
                                {language === "en" ? "Menu" : "ម៉ឺនុយ"}
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 rounded-md hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>

                        <div className="p-3">
                            <div className="flex flex-col gap-1">
                                {navItems[language].map((item, index) => {
                                    if (item.children && item.children.length > 0) {
                                        const isOpen = openMobileDropdown === item.label;

                                        return (
                                            <div
                                                key={`${item.label}-${index}`}
                                                className="rounded-xl border border-gray-200"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenMobileDropdown(isOpen ? null : item.label || null)
                                                    }
                                                    className={`w-full flex items-center justify-between px-4 py-3 text-gray-800 ${language === "kh" ? "khmer-font" : ""
                                                        }`}
                                                >
                                                    <span className="font-medium">{item.label}</span>
                                                    <ChevronDown
                                                        className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </button>

                                                {isOpen && (
                                                    <div className="pb-2">
                                                        {item.href && (
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => {
                                                                    setIsMenuOpen(false);
                                                                    setOpenMobileDropdown(null);
                                                                    setOpenMobileSubDropdown(null);
                                                                }}
                                                                className={`block px-6 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 ${language === "kh" ? "khmer-font" : ""
                                                                    }`}
                                                            >
                                                                {item.label}
                                                            </Link>
                                                        )}

                                                        {item.children.map((child) => {
                                                            if (child.children && child.children.length > 0) {
                                                                const subKey = `${item.label}-${child.label}`;
                                                                const isSubOpen = openMobileSubDropdown === subKey;

                                                                return (
                                                                    <div key={subKey} className="px-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setOpenMobileSubDropdown(isSubOpen ? null : subKey)
                                                                            }
                                                                            className={`w-full flex items-center justify-between rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${language === "kh" ? "khmer-font" : ""
                                                                                }`}
                                                                        >
                                                                            <span>{child.label}</span>
                                                                            <ChevronDown
                                                                                className={`w-4 h-4 transition-transform ${isSubOpen ? "rotate-180" : ""
                                                                                    }`}
                                                                            />
                                                                        </button>

                                                                        {isSubOpen && (
                                                                            <div className="ml-4 pb-2">
                                                                                {child.children.map((sub) => (
                                                                                    <Link
                                                                                        key={sub.href}
                                                                                        href={sub.href}
                                                                                        onClick={() => {
                                                                                            setIsMenuOpen(false);
                                                                                            setOpenMobileDropdown(null);
                                                                                            setOpenMobileSubDropdown(null);
                                                                                        }}
                                                                                        className={`block px-4 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg ${language === "kh" ? "khmer-font" : ""
                                                                                            }`}
                                                                                    >
                                                                                        {sub.label}
                                                                                    </Link>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <Link
                                                                    key={child.href}
                                                                    href={child.href || "#"}
                                                                    onClick={() => {
                                                                        setIsMenuOpen(false);
                                                                        setOpenMobileDropdown(null);
                                                                        setOpenMobileSubDropdown(null);
                                                                    }}
                                                                    className={`block px-6 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 ${language === "kh" ? "khmer-font" : ""
                                                                        }`}
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={`${item.href}-${index}`}
                                            href={item.href || "#"}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center justify-between rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-100 ${language === "kh" ? "khmer-font" : ""
                                                }`}
                                        >
                                            <span className="font-medium">{item.label}</span>
                                            <span className="text-gray-400">›</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-4 border-t pt-4">
                                <button
                                    onClick={toggleLanguage}
                                    type="button"
                                    className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 hover:bg-gray-50 ${language === "kh" ? "khmer-font" : ""
                                        }`}
                                >
                                    <Image
                                        src={translateFlagSrc}
                                        alt={translateFlagAlt}
                                        width={26}
                                        height={26}
                                        className="h-6 w-6 rounded-full object-cover"
                                    />
                                    <Globe className="w-4 h-4" />
                                    {mobileLanguageText}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Header;