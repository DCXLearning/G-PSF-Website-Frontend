import React from "react";

interface NewsItem {
    id: number;
    date: string;
    group: string;
    headline: string;
    excerpt: string;
}

const newsData: NewsItem[] = [
    {
        id: 1,
        date: "23 November 2025",
        group: "WORKING GROUP NAME",
        headline: "NEWS HEADLINE",
        excerpt:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.",
    },
    {
        id: 2,
        date: "10 October 2025",
        group: "WORKING GROUP NAME",
        headline: "NEWS HEADLINE",
        excerpt:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.",
    },
    {
        id: 3,
        date: "06 October 2025",
        group: "WORKING GROUP NAME",
        headline: "NEWS HEADLINE",
        excerpt:
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy.",
    },
];

const NewUpdateSection = () => {
    return (
        <section className="relative bg-white font-sans overflow-hidden">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 relative z-10">
                <p className="text-gray-900 font-bold text-xl mb-1">Latest</p>
                <h2 className="text-gray-900 text-5xl font-extrabold mb-4">
                    News & Updates
                </h2>
                <div className="w-40 h-1 bg-orange-400"></div>
            </div>

            {/* BLUE BACKGROUND (only bottom part) */}
            <div className="absolute bottom-10 left-0 w-full h-[30%] bg-[#3b5998]"></div>

            {/* CARDS */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {newsData.map((item) => (
                        <div
                            key={item.id}
                            className="bg-[#e9ecef] flex flex-col shadow-xl"
                        >
                            {/* Image */}
                            <div className="bg-white m-4 aspect-square flex flex-col items-center justify-center">
                                <div className="w-20 h-20 text-gray-300">
                                    <svg
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                                    </svg>
                                </div>
                                <span className="text-gray-500 font-medium text-lg mt-2 uppercase">
                                    Related Photo
                                </span>
                            </div>

                            {/* Content */}
                            <div className="px-6 pb-8 pt-2 flex flex-col grow">
                                <span className="text-[#1a2b4b] text-xs font-semibold mb-3">
                                    {item.date}
                                </span>

                                <div className="inline-block bg-[#1a2b4b] text-white text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-4">
                                    [ {item.group} ]
                                </div>

                                <h3 className="text-[#1a2b4b] text-2xl font-bold mb-3 uppercase">
                                    {item.headline}
                                </h3>

                                <p className="text-gray-700 text-sm mb-6">
                                    {item.excerpt}
                                </p>

                                <button className="mt-auto text-[#1a2b4b] text-xs font-bold flex items-center hover:underline">
                                    View details <span className="ml-1">›</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination dots */}
                <div className="flex justify-center mt-12 gap-3">
                    <span className="w-4 h-4 rounded-full bg-orange-400"></span>
                    <span className="w-4 h-4 rounded-full bg-orange-400 opacity-60"></span>
                    <span className="w-4 h-4 rounded-full bg-orange-400 opacity-60"></span>
                </div>
            </div>
        </section>
    );
};

export default NewUpdateSection;
