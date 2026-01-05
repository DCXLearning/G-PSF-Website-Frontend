"use client";
//taa
import { useState, useEffect, type FC } from "react";
import Image from "next/image";
import { Menu, X, Search, Globe } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import Link from "next/link";
import { usePathname } from "next/navigation";


type Lang = "en" | "kh";

const Header: FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const { language, toggleLanguage } = useLanguage();

    type NavItem = { label: string; href: string };

    const navItems: Record<Lang, NavItem[]> = {
        en: [
            { label: "Home", href: "/" },
            { label: "About Us", href: "/about-us" },
            { label: "Working Groups (WGs)", href: "/working-groups" },
            { label: "Resources", href: "/resources" },
            { label: "News & Updates", href: "/new-update" },
            { label: "MIS Dashboard", href: "/mis-dashboard" },
            { label: "Contact Us", href: "/contact-us" },
        ],
        kh: [
            { label: "ទំព័រដើម", href: "/" },
            { label: "អំពីពួកយើង", href: "/about-us" },
            { label: "ក្រុមការងារ (WGs)", href: "/working-groups" },
            { label: "ធនធាន", href: "/resources" },
            { label: "ព័ត៌មាន និងបច្ចុប្បន្នភាព", href: "/new-update" },
            { label: "ផ្ទាំង MIS", href: "/mis-dashboard" },
            { label: "ទាក់ទងមកពួកយើង", href: "/contact-us" },
        ],
    };

    const searchPlaceholder = language === "en" ? "Search..." : "ស្វែងរក...";

    // ✅ Sticky scroll detect (smooth)
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
    const pathname = usePathname();
    return (
        <>
            {/* ===== TOP BAR ===== */}
            <header className="bg-white shadow-md">
                <div

                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-2 xl:px-2 py-2 flex flex-col md:flex-row gap-3 md:gap-0 justify-between items-center">
                        <Image
                            src="/image/logo2.png"
                            alt="G-PSF Logo"
                            width={150}
                            height={60}
                            className="object-contain"
                            priority
                        />

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <button
                                onClick={toggleLanguage}
                                className={`flex items-center cursor-pointer gap-1 px-3 py-1 rounded-full border text-sm md:text-lg ${language === "kh" ? "khmer-font" : ""
                                    }`}
                                type="button"
                            >
                                <Globe className="w-4 h-4" />
                                {language === "en" ? "English" : "ខ្មែរ"}
                            </button>

                            <div className="hidden lg:flex rounded-2xl overflow-hidden md:w-72 shadow-sm">
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    className="flex-1 px-3 py-1 text-sm md:text-lg bg-gray-200 outline-none"
                                />
                                <button className="px-3 bg-white" type="button">
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

            {/* ===== NAVBAR (Sticky) ===== */}
            <section className="bg-white shadow-md sticky top-0 z-50">
                <nav className="max-w-7xl mx-auto px-4 md:px-2 py-4">
                    <div className="flex justify-between items-center">
                        {/* Desktop links */}
                        <div className="hidden lg:flex flex-1 justify-center gap-x-12">
                            {navItems[language].map((item) => {
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative pb-1 font-medium text-xl transition-colors
                                            ${isActive ? "text-black" : "text-gray-700 hover:text-blue-600"}
                                            ${language === "kh" ? "khmer-font" : ""}
                                        `}
                                    >
                                        {item.label}

                                        {/* underline */}
                                        <span
                                            className={`absolute left-0 -bottom-1 h-[3px] bg-orange-500 transition-all duration-300
                                                ${isActive ? "w-full" : "w-0"}
                                            `}
                                        />
                                    </Link>
                                );
                            })}

                        </div>

                        {/* Mobile menu title */}
                        <div
                            className={`lg:hidden ml-3 font-medium text-gray-500 uppercase tracking-wide ${language === "kh" ? "khmer-font text-xs" : "text-[10px] sm:text-xs"
                                }`}
                        >
                            {language === "en" ? "Menu" : "ម៉ឺនុយ"}
                        </div>

                        {/* Right controls */}
                        <div className="flex items-center gap-2 mr-3">
                            {/* show these when scroll down */}
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
                                        className="flex items-center gap-1 px-2 py-1 cursor-pointer border rounded-md text-sm hover:bg-gray-50"
                                        type="button"
                                        aria-label="Language"
                                    >
                                        <Globe className="w-4 h-4" />
                                        {language === "en" ? "EN" : "ខ្មែរ"}
                                    </button>
                                </>
                            )}

                            {/* ✅ Mobile menu button */}
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

                {/* Search bar dropdown */}
                {isSearchOpen && (
                    <div className="border-t border-gray-200 px-4 py-3 bg-gray-100">
                        <div className="max-w-7xl mx-auto flex items-center rounded-lg px-4 py-2 bg-white">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="ml-2 outline-none bg-transparent w-full"
                            />
                        </div>
                    </div>
                )}

                {/* ✅ Mobile menu */}
                {/* ✅ Mobile menu (Backdrop + Drawer) */}
                {isMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-[60]">
                        {/* Backdrop */}
                        <button
                            type="button"
                            aria-label="Close menu"
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute inset-0 bg-black/40"
                        />

                        {/* Drawer */}
                        <div className="absolute right-0 top-0 h-full w-[86%] max-w-[340px] bg-white shadow-2xl">
                            {/* Drawer header */}
                            <div className="flex items-center justify-between px-4 py-4 border-b">
                                <div
                                    className={`font-semibold text-gray-800 ${language === "kh" ? "khmer-font" : ""
                                        }`}
                                >
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

                            {/* Links */}
                            <div className="p-3">
                                <div className="flex flex-col gap-1">
                                    {navItems[language].map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center justify-between rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-100 ${language === "kh" ? "khmer-font" : ""
                                                }`}
                                        >
                                            <span className="font-medium">{item.label}</span>
                                            <span className="text-gray-400">›</span>
                                        </Link>
                                    ))}
                                </div>

                                {/* Extra actions */}
                                <div className="mt-4 border-t pt-4">
                                    <button
                                        onClick={toggleLanguage}
                                        type="button"
                                        className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3 hover:bg-gray-50 ${language === "kh" ? "khmer-font" : ""
                                            }`}
                                    >
                                        <Globe className="w-4 h-4" />
                                        {language === "en" ? "Switch to Khmer" : "ប្ដូរទៅ English"}
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
