"use client";

import { useState, useEffect, type FC } from "react";
import Image from "next/image";
import { Menu, X, Search, Globe, ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Lang = "en" | "kh";

type SubChildItem = {
    label: string;
    href: string;
};

type ChildItem = {
    label: string;
    href?: string;
    children?: SubChildItem[];
};

type NavItem = {
    label?: string;
    href?: string;
    image?: string;
    children?: ChildItem[];
};

const Header: FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
    const [openMobileSubDropdown, setOpenMobileSubDropdown] = useState<string | null>(null);

    const { language, toggleLanguage } = useLanguage();
    const pathname = usePathname();
    const router = useRouter();

    const navItems: Record<Lang, NavItem[]> = {
        en: [
            {
                image: "/image/home.png",
                href: "/",
            },
            {
                label: "About Us",
                href: "/about-us",
            },
            {
                label: "Plenary",
                href: "/plenary",
            },
            {
                label: "Working Groups",
                href: "/working-groups",
            },
            {
                label: "Publication",
                href: "/resources",
                children: [
                    { label: "Laws & Regulations", href: "/new-update/plenary/laws-regulations" },
                    { label: "Decisions", href: "/new-update/plenary/decisions" },
                    { label: "Reform Tracker", href: "/new-update/plenary/reform-tracker" },
                    { label: "Reports", href: "/new-update/working-groups/reports" },
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
            {
                label: "MIS",
                href: "/mis-dashboard",
            },
            {
                label: "Contact Us",
                href: "/contact-us",
            },
        ],
        kh: [
            {
                image: "/image/home.png",
                href: "/",
            },
            {
                label: "អំពីពួកយើង",
                href: "/about-us",
            },
            {
                label: "កិច្ចប្រជុំពេញអង្គ",
                href: "/plenary",
            },
            {
                label: "ក្រុមការងារ",
                href: "/working-groups",
            },
            {
                label: "បណ្ដុំឯកសារ",
                href: "/resources",
                children: [
                    { label: "ច្បាប់ និងបទប្បញ្ញត្តិ", href: "/new-update/plenary/laws-regulations" },
                    { label: "សេចក្តីសម្រេច", href: "/new-update/plenary/decisions" },
                    { label: "តាមដានកំណែទម្រង់", href: "/new-update/plenary/reform-tracker" },
                    { label: "របាយការណ៍", href: "/new-update/working-groups/reports" },
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
            {
                label: "MIS",
                href: "/mis-dashboard",
            },
            {
                label: "ទាក់ទងមកពួកយើង",
                href: "/contact-us",
            },
        ],
    };

    const searchPlaceholder = language === "en" ? "Search..." : "ស្វែងរក...";
    const languageButtonText = language === "en" ? "" : "";
    const mobileLanguageText = language === "en" ? "Switch to Khmer" : "ប្ដូរទៅ English";

    const handleSearch = () => {
        const keyword = searchValue.trim();
        router.push(`/search${keyword ? `?q=${encodeURIComponent(keyword)}` : ""}`);
        setIsSearchOpen(false);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const next = window.scrollY > 20;
                setIsSticky((prev) => (prev === next ? prev : next));
                ticking = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isParentActive = (item: NavItem) => {
        if (item.href && pathname === item.href) return true;

        if (item.children) {
            return item.children.some((child) => {
                if (child.href && pathname === child.href) return true;
                if (child.children) return child.children.some((sub) => pathname === sub.href);
                return false;
            });
        }

        return false;
    };

    return (
        <>
            <header className="bg-white shadow-md">
                <div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-2 xl:px-2 py-2 flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-center">
                        <Link href="/">
                            <Image
                                src="/image/logo2.png"
                                alt="G-PSF Logo"
                                width={160}
                                height={60}
                                className="object-cover"
                                priority
                            />
                        </Link>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <button
                                onClick={toggleLanguage}
                                className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-xl bg-gray-100 border border-gray-400 text-sm md:text-lg ${language === "kh" ? "khmer-font" : ""
                                    }`}
                                type="button"
                            >
                                <Image
                                    src={language === "en" ? "/image/flagkhmer.jpg" : "/image/english.png"}
                                    alt={language === "en" ? "Khmer" : "English"}
                                    width={18}
                                    height={18}
                                    className="object-cover h-5 w-7 rounded-sm"
                                />
                                {languageButtonText}
                            </button>

                            <div className="hidden lg:flex rounded-2xl overflow-hidden md:w-72 shadow-sm">
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSearch();
                                    }}
                                    placeholder={searchPlaceholder}
                                    className={`flex-1 px-3 py-2 text-sm md:text-base bg-gray-200 outline-none ${language === "kh" ? "khmer-font" : ""
                                        }`}
                                />
                                <button className="px-3 bg-white" type="button" onClick={handleSearch}>
                                    <Search className="w-5 h-5 text-gray-500 cursor-pointer" />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsSearchOpen((s) => !s)}
                                className="lg:hidden p-2 mr-3"
                                type="button"
                            >
                                <Search className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="bg-white shadow-md sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 md:px-2 py-4">
                    <div className="flex justify-between items-center">
                        <div className="hidden lg:flex flex-1 justify-center items-center gap-x-13">
                            {navItems[language].map((item, index) => {
                                const isActive = isParentActive(item);

                                if (item.image && item.href) {
                                    return (
                                        <Link
                                            key={`${item.href}-${index}`}
                                            href={item.href}
                                            className="flex items-center"
                                        >
                                            <Image
                                                src={item.image}
                                                alt="Home"
                                                width={28}
                                                height={28}
                                                className="object-contain -mt-1 hover:scale-110 transition-transform"
                                            />
                                        </Link>
                                    );
                                }

                                if (item.children) {
                                    return (
                                        <div key={`${item.label}-${index}`} className="relative group">
                                            <Link
                                                href={item.href || "#"}
                                                className={`relative flex items-center gap-2 pb-1 font-medium text-lg transition-colors ${isActive ? "text-black" : "text-gray-700 hover:text-blue-600"
                                                    } ${language === "kh" ? "khmer-font" : ""}`}
                                            >
                                                {item.label}
                                                <ChevronDown className="w-4 h-4" />
                                                <span
                                                    className={`absolute left-0 -bottom-1 h-[3px] bg-orange-500 transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                                                        }`}
                                                />
                                            </Link>

                                            <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <div className="min-w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                                                    {item.children.map((child) => {
                                                        const isChildActive =
                                                            (child.href && pathname === child.href) ||
                                                            child.children?.some((sub) => pathname === sub.href);

                                                        if (child.children) {
                                                            return (
                                                                <div key={child.label} className="relative group/sub">
                                                                    <div
                                                                        className={`flex items-center justify-between px-4 py-3 text-lg font-medium cursor-pointer transition-colors ${isChildActive
                                                                                ? "bg-orange-50 text-orange-600 font-semibold"
                                                                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                                                            } ${language === "kh" ? "khmer-font" : ""}`}
                                                                    >
                                                                        <span>{child.label}</span>
                                                                        <ChevronRight className="w-4 h-4" />
                                                                    </div>

                                                                    <div className="absolute left-full top-0 ml-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                                                        <div className="min-w-[240px] bg-white border border-gray-200 rounded-xl shadow-lg py-2">
                                                                            {child.children.map((sub) => {
                                                                                const isSubActive = pathname === sub.href;

                                                                                return (
                                                                                    <Link
                                                                                        key={sub.href}
                                                                                        href={sub.href}
                                                                                        className={`block px-4 py-3 text-sm transition-colors ${isSubActive
                                                                                                ? "bg-orange-50 text-orange-600 font-semibold"
                                                                                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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
                                                                className={`block px-4 py-3 text-lg font-medium transition-colors ${isChildActive
                                                                        ? "bg-orange-50 text-orange-600 font-semibold"
                                                                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
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
                                        key={item.href}
                                        href={item.href || "#"}
                                        className={`relative pb-1 font-medium text-xl transition-colors ${isActive ? "text-black" : "text-gray-700 hover:text-blue-600"
                                            } ${language === "kh" ? "khmer-font" : ""}`}
                                    >
                                        {item.label}
                                        <span
                                            className={`absolute left-0 -bottom-1 h-[3px] bg-orange-500 transition-all duration-300 ${isActive ? "w-full" : "w-0"
                                                }`}
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        <div
                            className={`lg:hidden ml-3 font-medium text-gray-500 uppercase tracking-wide ${language === "kh" ? "khmer-font text-xs" : "text-[10px] sm:text-xs"
                                }`}
                        >
                            {language === "en" ? "Menu" : "ម៉ឺនុយ"}
                        </div>

                        <div className="flex items-center gap-3 ml-3 mr-1">
                            {isSticky && (
                                <>
                                    <button
                                        onClick={() => setIsSearchOpen((s) => !s)}
                                        className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                        type="button"
                                        aria-label="Search"
                                    >
                                        <Search className="w-5 h-5 text-gray-600" />
                                    </button>

                                    <button
                                        onClick={toggleLanguage}
                                        className={`flex items-center font-medium gap-2 px-3 py-2 cursor-pointer border border-gray-400 rounded-xl text-sm hover:bg-gray-100 ${language === "kh" ? "khmer-font" : ""
                                            }`}
                                        type="button"
                                        aria-label="Language"
                                    >
                                        <Image
                                            src={language === "en" ? "/image/flagkhmer.jpg" : "/image/english.png"}
                                            alt={language === "en" ? "Khmer" : "English"}
                                            width={18}
                                            height={18}
                                            className="object-cover h-4 w-6 rounded-sm"
                                        />
                                        {languageButtonText}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={() => {
                                    setIsMenuOpen((m) => !m);
                                    setIsSearchOpen(false);
                                }}
                                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
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
                    <div className="border-t border-gray-200 px-4 md:px-33 py-3 bg-gray-100">
                        <div className="max-w-7xl mx-auto flex items-center rounded-lg px-4 py-2 bg-white">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                                placeholder={searchPlaceholder}
                                className={`ml-2 outline-none bg-transparent w-full ${language === "kh" ? "khmer-font" : ""
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={handleSearch}
                                className={`text-sm font-semibold cursor-pointer text-orange-500 ${language === "kh" ? "khmer-font" : ""
                                    }`}
                            >
                                {language === "en" ? "Go" : "ស្វែងរក"}
                            </button>
                        </div>
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
                                        if (item.image && item.href) {
                                            return (
                                                <Link
                                                    key={`${item.href}-${index}`}
                                                    href={item.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-100"
                                                >
                                                    <Image
                                                        src={item.image}
                                                        alt="Home"
                                                        width={24}
                                                        height={24}
                                                        className="object-contain"
                                                    />
                                                </Link>
                                            );
                                        }

                                        if (item.children) {
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
                                                                    className={`block px-6 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 ${language === "kh" ? "khmer-font" : ""
                                                                        }`}
                                                                >
                                                                    {item.label}
                                                                </Link>
                                                            )}

                                                            {item.children.map((child) => {
                                                                if (child.children) {
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
                                                                                            className={`block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg ${language === "kh" ? "khmer-font" : ""
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
                                                                        className={`block px-6 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 ${language === "kh" ? "khmer-font" : ""
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
                                                key={item.href}
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
                                        <Globe className="w-4 h-4" />
                                        {mobileLanguageText}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

export default Header;