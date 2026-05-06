/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useLanguage } from "@/app/context/LanguageContext";

type Lang = "en" | "kh";
type RoleType = "government" | "private";

type Person = {
    name: {
        en: string;
        kh: string;
    };
    role: RoleType;
    image: string;
};

const TeamSection = () => {
    const { language } = useLanguage();
    const lang = (language as Lang) ?? "en";
    const isKh = lang === "kh";

    const t = {
        en: {
            governmentTitle: "Government Representatives",
            privateTitle: "Private Sector Representatives",
            governmentRole: "Government Representative",
            privateRole: "Private Sector Representative",
        },
        kh: {
            governmentTitle: "តំណាងរាជរដ្ឋាភិបាល",
            privateTitle: "តំណាងវិស័យឯកជន",
            governmentRole: "តំណាងរាជរដ្ឋាភិបាល",
            privateRole: "តំណាងវិស័យឯកជន",
        },
    }[lang];

    const teamMembers: Person[] = [
        {
            name: {
                en: "Name",
                kh: "ឈ្មោះ",
            },
            role: "government",
            image: "/image/image (1).JPG",
        },
        {
            name: {
                en: "Name",
                kh: "ឈ្មោះ",
            },
            role: "government",
            image: "/image/image (2).JPG",
        },
        {
            name: {
                en: "Name",
                kh: "ឈ្មោះ",
            },
            role: "private",
            image: "/image/sela1.png",
        },
        {
            name: {
                en: "Name",
                kh: "ឈ្មោះ",
            },
            role: "private",
            image: "/image/sela2.png",
        },
    ];

    const governmentNames = teamMembers.filter(
        (person) => person.role === "government"
    );

    const privateNames = teamMembers.filter((person) => person.role === "private");

    return (
        <section className="bg-gray-50 py-12">
            <div className="mx-auto max-w-7xl px-4">
                <div className="mb-8">
                    {/* Government Section */}
                    <h2
                        className={`mb-5 border-l-4 border-orange-500 pl-4 text-2xl font-bold text-gray-800 ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {t.governmentTitle}
                    </h2>

                    <ul
                        className={`mb-8 space-y-2 text-gray-700 ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {governmentNames.map((person, index) => (
                            <li key={index}>- {person.name[lang]}</li>
                        ))}
                    </ul>

                    {/* Private Section */}
                    <h2
                        className={`mb-5 border-l-4 border-orange-500 pl-4 text-2xl font-bold text-gray-800 ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {t.privateTitle}
                    </h2>

                    <ul
                        className={`mb-8 space-y-2 text-gray-700 ${isKh ? "khmer-font" : ""
                            }`}
                    >
                        {privateNames.map((person, index) => (
                            <li key={index}>- {person.name[lang]}</li>
                        ))}
                    </ul>

                    {/* Team Cards */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {teamMembers.map((person, index) => (
                            <TeamCard
                                key={index}
                                person={person}
                                lang={lang}
                                isKh={isKh}
                                roleLabel={
                                    person.role === "government"
                                        ? t.governmentRole
                                        : t.privateRole
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const TeamCard = ({
    person,
    lang,
    isKh,
    roleLabel,
}: {
    person: Person;
    lang: Lang;
    isKh: boolean;
    roleLabel: string;
}) => (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
        <div className="aspect-square bg-gray-200">
            <img
                src={person.image}
                alt={person.name[lang]}
                className="h-full w-full object-cover"
            />
        </div>
    </div>
);

export default TeamSection;