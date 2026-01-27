import React from 'react';
import { ChevronRight, Hexagon } from 'lucide-react';

interface ReportCard {
    year: string;
    image: string;
    points: string[];
}

const reports: ReportCard[] = [
    {
        year: '2025',
        image: '/image/Subpage_mock1.bmp',
        points: ['Key Point 1', 'Key Point 2', 'Key Point 3', 'Key Point 4'],
    },
    {
        year: '2024',
        image: '/image/Subpage_mock2.bmp',
        points: ['Key Point 1', 'Key Point 2', 'Key Point 3', 'Key Point 4'],
    },
    {
        year: '2023',
        image: '/image/Subpage_mock3.bmp',
        points: ['Key Point 1', 'Key Point 2', 'Key Point 3', 'Key Point 4'],
    },
];

const AnnualReports = () => {
    return (
        <section className="bg-[#3b5998] py-12 px-4 sm:py-20">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Annual Reports
                    </h2>
                    <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-2">
                        Turning conversation into action through Cambodia's trusted G-PSF mechanism.
                        See the reform progress by the Royal Government of Cambodia line ministries.
                    </p>
                </div>

                {/* Reports Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {reports.map((report, index) => (
                        <div
                            key={index}
                            className="bg-white p-3 md:p-4 shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                        >
                            {/* Report Mockup/Image Container */}
                            <div className="relative aspect-[3/4.2] overflow-hidden bg-gray-100 flex-grow">
                                <img
                                    src={report.image}
                                    alt={`${report.year} Annual Report`}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay Content - Using higher opacity for better text legibility on mobile */}
                                <div className="absolute inset-x-0 bottom-0 top-[35%] bg-white/40 md:bg-white/60 backdrop-blur-md p-5 md:p-6 flex flex-col justify-between border-t border-white/20">
                                    <div>
                                        <h3 className="text-gray-500 text-sm md:text-base font-semibold uppercase tracking-wider">
                                            {report.year}
                                        </h3>
                                        <p className="text-[#3b5998] text-xl md:text-2xl font-extrabold mb-4">
                                            Annual Report
                                        </p>

                                        <ul className="space-y-2 md:space-y-3 ml-22">
                                            {report.points.map((point, i) => (
                                                <li key={i} className="flex items-center text-gray-700 text-xs md:text-sm font-medium">
                                                    <Hexagon className="w-3 h-3 mr-2 text-[#3b5998] fill-[#3b5998]/10 shrink-0" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Download Button */}
                                    <button className="w-full mt-3 md:mt-5 cursor-pointer bg-[#f39c12] hover:bg-[#e67e22] text-white font-stretch-normal py-1 px-2 rounded transition-all flex items-center justify-center group">
                                        <span>Download</span>
                                        <ChevronRight className="ml-1 w-5 h-5 transition-transform group-hover:translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AnnualReports;