"use client";

import React from "react";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import { useLanguage } from "@/app/context/LanguageContext";

/* ================= TYPES ================= */
interface LinkGroup {
    titleEn: string;
    titleKh: string;
    links: { nameEn: string; nameKh: string; href: string }[];
}

/* ================= DATA ================= */
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

/* ================= FOOTER ================= */
const Footer: React.FC = () => {
    const { language } = useLanguage();
    const isKhmer = language === "kh";

    return (
        <footer className="bg-white mt-0 shadow-[0_-6px_12px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-28">
                {/* ========== LOGO + DESCRIPTION ========== */}
                <div>
                    <div className="relative w-60 h-20 mb-4">
                        <Image
                            src="/image/logo1.png"
                            alt="G-PSF Logo"
                            fill
                            className="object-cover"
                            sizes="300px"
                        />
                    </div>

                    <p className={`text-lg text-gray-800 max-w-sm mb-3 ${isKhmer ? "khmer-font" : ""}`}>
                        {isKhmer
                            ? "អត្ថបទគំរូសម្រាប់ពិពណ៌នាពីបេសកកម្ម និងតួនាទីរបស់ G-PSF។"
                            : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh."}
                    </p>

                    <p className={`text-lg text-gray-800 max-w-sm ${isKhmer ? "khmer-font" : ""}`}>
                        {isKhmer
                            ? "អត្ថបទគំរូបន្ថែម សម្រាប់ពិពណ៌នាពីការងារជាមួយវិស័យឯកជន។"
                            : "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh."}
                    </p>
                </div>

                {/* ========== KEY UPDATES ========== */}
                <LinkSection group={keyUpdates} isKhmer={isKhmer} />

                {/* ========== QUICK LINKS ========== */}
                <LinkSection group={quickLinks} isKhmer={isKhmer} />

                {/* ========== CONTACT + SOCIAL ========== */}
                <div className="space-y-6">
                    <div>
                        <h3 className={`text-2xl font-bold mb-3 ${isKhmer ? "khmer-font" : ""}`}>
                            {isKhmer ? "ទំនាក់ទំនង" : "CONTACT"}
                        </h3>

                        <div className="space-y-3 text-gray-700">
                            <ContactItem icon={<Phone size={18} />} text="+855 999 999 999"/>
                            <ContactItem icon={<Mail size={18} />} text="info@website.gov.kh" />
                        </div>
                    </div>

                    <div className="mt-18">
                        <h3 className={`text-2xl font-bold mb-3 ${isKhmer ? "khmer-font" : ""}`}>
                            {isKhmer ? "តាមដានពួកយើង" : "FOLLOW US"}
                        </h3>

                        <div className="flex gap-3">
                            <SocialIcon icon={<FaFacebookF />} href="#" />
                            <SocialIcon icon={<FaTelegramPlane />} href="#" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* ================= COMPONENTS ================= */

const ContactItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
    <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-[#00008b]">{icon}</span>
        <span>{text}</span>
    </div>
);

const LinkSection = ({ group, isKhmer }: { group: LinkGroup; isKhmer: boolean }) => (
    <div>
        <h3 className={`text-2xl font-bold mb-4 ${isKhmer ? "khmer-font" : ""}`}>
            {isKhmer ? group.titleKh : group.titleEn}
        </h3>

        <ul className="space-y-3">
            {group.links.map((link) => (
                <li key={link.nameEn} >
                    <a
                        href={link.href}
                        className={`text-xl text-gray-700 hover:text-[#00008b] transition ${isKhmer ? "khmer-font" : ""
                            }`}
                    >
                        {isKhmer ? link.nameKh : link.nameEn}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
    <a
        href={href}
        className="w-10 h-10 bg-[#00008b] rounded-full flex items-center justify-center text-white hover:bg-red-700 transition"
        aria-label="Social Media"
    >
        {icon}
    </a>
);

export default Footer;
