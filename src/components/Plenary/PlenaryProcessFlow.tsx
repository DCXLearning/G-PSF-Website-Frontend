"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { Download } from "lucide-react";

type Doc = {
    titleEn: string;
    titleKh: string;
    file: string;
    label: string;
};

const documents: Doc[] = [
    {
        label: "Sub-Decree 307",
        titleEn:
            "Sub-Decree No. 307 on the Organization and Functioning of the G-PSF Coordination Committee (Oct 6, 2023)",
        titleKh:
            "អនុក្រឹត្យលេខ ៣០៧ អនក្រ.បក ចុះថ្ងៃទី៦ ខែតុលា ឆ្នាំ២០២៣ ស្តីពីការរៀបចំ និងការប្រព្រឹត្តទៅរបស់គណៈកម្មាធិការសម្របសម្រួលការងារ សម្រាប់យន្តការវេទិការាជរដ្ឋាភិបាល-ផ្នែកឯកជន",
        file: "/docs/sub-decree-307.pdf",
    },
    {
        label: "Decision 153",
        titleEn:
            "Decision No. 153 on Appointment of G-PSF Coordination Committee Members (Nov 3, 2023)",
        titleKh:
            "សេចក្តីសម្រេចលេខ ១៥៣ សសរ ចុះថ្ងៃទី៣ ខែវិច្ឆិកា ឆ្នាំ២០២៣ ស្តីពីការតែងតាំងសមាសភាពគណៈកម្មាធិការសម្របសម្រួលការងារ",
        file: "/docs/decision-153.pdf",
    },
    {
        label: "Notification 1772",
        titleEn:
            "Notification No. 1772 on the Results of the 19th G-PSF Forum (Nov 22, 2023)",
        titleKh:
            "សេចក្តីជូនដំណឹងលេខ ១៧៧២ សជណ.អកទ ចុះថ្ងៃទី២២ ខែវិច្ឆិកា ឆ្នាំ២០២៣ ស្តីពីលទ្ធផលនៃវេទិការាជរដ្ឋាភិបាល-ផ្នែកឯកជនលើកទី១៩",
        file: "/docs/notification-1772.pdf",
    },
    {
        label: "Decision 97",
        titleEn:
            "Decision No. 97 on Recognition of 16 Private Sector Working Groups (May 21, 2024)",
        titleKh:
            "សេចក្តីសម្រេចលេខ ៩៧ សសរ ចុះថ្ងៃទី២១ ខែឧសភា ឆ្នាំ២០២៤ ស្តីពីការទទួលស្គាល់ជាផ្លូវការនូវសមាសភាពក្រុមការងារទាំង១៦",
        file: "/docs/decision-97.pdf",
    },
];

export default function PlenaryProcessFlow() {
    const { language } = useLanguage();
    const isKh = language === "kh";

    return (
        <section className="bg-[#efefef] py-10 md:py-12">
            <div className="mx-auto max-w-7xl px-4">
                {/* Title */}
                <h2
                    className={`text-center text-2xl md:text-3xl font-bold mb-10 ${
                        isKh ? "khmer-font" : ""
                    }`}
                >
                    {isKh ? "ឯកសារគតិយុត្ត" : "Legal Documents"}
                </h2>

                {/* Document Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {documents.map((doc, index) => (
                        <div
                            key={index}
                            className="bg-white border border-slate-200 rounded-2xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition"
                        >
                            {/* Label */}
                            <span className="text-xl font-semibold text-indigo-600 mb-2">
                                {doc.label}
                            </span>

                            {/* Title */}
                            <p
                                className={`text-lg text-gray-700 mb-6 leading-relaxed ${
                                    isKh ? "khmer-font" : ""
                                }`}
                            >
                                {isKh ? doc.titleKh : doc.titleEn}
                            </p>

                            {/* Download Button */}
                            <div className="flex gap-3 mt-auto">
                                {/* Download */}
                                <a
                                    href={doc.file}
                                    download
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg"
                                >
                                    <Download size={16} />
                                    {isKh ? "ទាញយក" : "Download"}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}