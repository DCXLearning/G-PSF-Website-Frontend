"use client";

import React from 'react';
import { useLanguage } from "@/app/context/LanguageContext";  // Import useLanguage hook

const CaseStudies = () => {
    const { language } = useLanguage();  // Access language context

    // Text content mapping based on the language
    const t = {
        header: language === "kh" ? "ជោគជ័យដែលបានបង្ហាញ" : "Featured Success",
        title: language === "kh" ? "ករណីសិក្សា" : "Case Studies",
        relatedPhoto: language === "kh" ? "រូបថតដែលទាក់ទង" : "Related Photo",
        workingGroup: language === "kh" ? "ឈ្មោះក្រុមការងារ" : "Working Group Name",
        download: language === "kh" ? "ទាញយក" : "Download",
        articleHeadline: language === "kh" ? "ចំណងជើងអត្ថបទ" : "Article Headline",
        articleDescription: language === "kh" 
            ? "ទទួលបានព័ត៌មានអំពីការអភិវឌ្ឍន៍សំខាន់ៗពី G-PSF រួមទាំងលទ្ធផលពេញអង្គ វឌ្ឍនភាពនៃក្រុមការងារ ការសង្ខេបគោលនយោបាយ និងកំណែទម្រង់ស្ថាប័ន។" 
            : "Stay informed on key developments from the G-PSF, including plenary outcomes, Working Group progress, policy briefs, and institutional reforms."
    };

    return (
        <section className={`bg-white py-12 px-4 md:px-8 ${language === "kh" ? "font-khmer" : ""}`}>
            <div className="max-w-7xl px-4 mx-auto">
                
                {/* Header Section */}
                <div className="mb-12">
                    <p className="text-[#1a2b4b] text-xl font-bold mb-1">{t.header}</p>
                    <h2 className={`text-[#1a2b4b] text-5xl font-black mb-6 leading-tight ${language === "kh" ? "khmer-font" : ""}`}>
                        {t.title}
                    </h2>
                    <div className="w-full max-w-[480px] h-1.5 bg-orange-500"></div>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* LEFT: Large Feature Card */}
                    <div className="bg-[#e9ecef] flex flex-col h-full shadow-sm">
                        <div className="bg-gray-200/50 flex-1 flex flex-col items-center justify-center p-12 min-h-[390px]">
                            <div className="bg-white p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center aspect-square w-64 text-center">
                                <svg className="w-20 h-20 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                                </svg>
                                <span className="text-gray-400 font-bold text-xs tracking-widest uppercase">{t.relatedPhoto}</span>
                            </div>
                        </div>

                        <div className="p-10 bg-[#eceff1]">
                            <span className={`inline-block bg-[#1a2b4b] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 ${language === "kh" ? "khmer-font" : ""}`}>
                                {t.workingGroup}
                            </span>
                            <h3 className={`text-[#1a2b4b] text-4xl font-black mb-4 leading-tight ${language === "kh" ? "khmer-font" : ""}`}>{t.articleHeadline}</h3>
                            <p className={`text-gray-700 text-sm leading-relaxed mb-8 max-w-md ${language === "kh" ? "khmer-font" : ""}`}>
                                {t.articleDescription}
                            </p>
                            <button className={`text-[#1a2b4b] text-xs font-bold flex items-center hover:text-orange-600 transition-colors uppercase tracking-widest ${language === "kh" ? "khmer-font" : ""}`}>
                                {t.download} <span className="ml-2 text-lg">›</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: Stacked Small Cards */}
                    <div className="flex flex-col gap-8">
                        {[1, 2].map((item) => (
                            <div key={item} className="bg-[#e9ecef] p-12 flex-1 flex flex-col justify-center">
                                <div className="text-[#1a2b4b] text-[10px] font-bold mb-3 uppercase tracking-wider">
                                    {t.workingGroup}
                                </div>
                                <h3 className="text-[#1a2b4b] text-3xl font-black mb-4 leading-tight">{t.articleHeadline}</h3>
                                <p className="text-gray-700 text-sm leading-relaxed mb-8 max-w-sm">
                                    {t.articleDescription}
                                </p>
                                <button className="text-[#1a2b4b] text-xs font-bold flex items-center hover:text-orange-600 transition-colors uppercase mt-auto tracking-widest">
                                    {t.download} <span className="ml-2 text-lg">›</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CaseStudies;
