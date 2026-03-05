"use client"
import React, { use, useState } from 'react';

// --- Types ---
type ResourceType = 'Publication' | 'Report' | 'Video' | 'Press' | 'Blog' | 'Social' | 'Template' | 'Online';

interface Resource {
    id: number;
    type: ResourceType;
    title: string;
    date: string;
    org?: string;
    author?: string;
    description: string;
    languages: string[];
    image: string;
}

// --- Mock Data (Based on your images) ---
const DATA: Resource[] = [
    {
        id: 1,
        type: 'Publication',
        title: 'Title of Publication',
        date: 'December 2025',
        org: 'Organisation or Agency Name',
        author: 'Author Name',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        languages: ['Khmer'],
        image: 'https://placehold.co/400x530/white/black?text=G-PSF+Cover'
    },
    {
        id: 2,
        type: 'Video',
        title: 'Title of Video',
        date: 'January 2024',
        org: 'Organisation or Agency Name',
        author: 'Author Name',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        languages: ['English'],
        image: 'https://placehold.co/400x530/f3f4f6/red?text=Play+Icon'
    },
    {
        id: 3,
        type: 'Blog',
        title: 'Government-Private sector forum marks 25 years of dialogue partnership and reform',
        date: 'December 2025',
        description: 'H.E. Sun Chanthol said, "As we celebrate 25 years of the G-PSF, this mechanism is more important than ever. In the face of new regional challenges..." ',
        languages: ['English'],
        image: 'https://placehold.co/400x530/white/blue?text=CAPRED'
    },
    {
        id: 4,
        type: 'Social',
        title: 'Message from Deputy Prime Minister',
        date: 'July 2025',
        description: 'អត្ថបទសារលិខិតផ្ញើជូនសមាជិក សមាជិកាក្រុមការងាររាជរដ្ឋាភិបាល និងវិស័យឯកជន ក្នុងឱកាសខួប ២៥ ឆ្នាំ នៃវេទិកា...',
        languages: ['Khmer'],
        image: 'https://placehold.co/400x530/003366/white?text=DPM+Photo'
    },
    {
        id: 5,
        type: 'Publication',
        title: 'Title of Publication',
        date: 'December 2025',
        org: 'Organisation or Agency Name',
        author: 'Author Name',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        languages: ['Khmer'],
        image: 'https://placehold.co/400x530/white/black?text=G-PSF+Cover'
    },
    {
        id: 6,
        type: 'Video',
        title: 'Title of Video',
        date: 'January 2024',
        org: 'Organisation or Agency Name',
        author: 'Author Name',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        languages: ['English'],
        image: 'https://placehold.co/400x530/f3f4f6/red?text=Play+Icon'
    },
    {
        id: 7,
        type: 'Blog',
        title: 'Government-Private sector forum marks 25 years of dialogue partnership and reform',
        date: 'December 2025',
        description: 'H.E. Sun Chanthol said, "As we celebrate 25 years of the G-PSF, this mechanism is more important than ever. In the face of new regional challenges..." ',
        languages: ['English'],
        image: 'https://placehold.co/400x530/white/blue?text=CAPRED'
    },
    {
        id: 8,
        type: 'Social',
        title: 'Message from Deputy Prime Minister',
        date: 'July 2025',
        description: 'អត្ថបទសារលិខិតផ្ញើជូនសមាជិក សមាជិកាក្រុមការងាររាជរដ្ឋាភិបាល និងវិស័យឯកជន ក្នុងឱកាសខួប ២៥ ឆ្នាំ នៃវេទិកា...',
        languages: ['Khmer'],
        image: 'https://placehold.co/400x530/003366/white?text=DPM+Photo'
    },
    {
        id: 9,
        type: 'Blog',
        title: 'Government-Private sector forum marks 25 years of dialogue partnership and reform',
        date: 'December 2025',
        description: 'H.E. Sun Chanthol said, "As we celebrate 25 years of the G-PSF, this mechanism is more important than ever. In the face of new regional challenges..." ',
        languages: ['English'],
        image: 'https://placehold.co/400x530/white/blue?text=CAPRED'
    },
    {
        id: 10,
        type: 'Social',
        title: 'Message from Deputy Prime Minister',
        date: 'July 2025',
        description: 'អត្ថបទសារលិខិតផ្ញើជូនសមាជិក សមាជិកាក្រុមការងាររាជរដ្ឋាភិបាល និងវិស័យឯកជន ក្នុងឱកាសខួប ២៥ ឆ្នាំ នៃវេទិកា...',
        languages: ['Khmer'],
        image: 'https://placehold.co/400x530/003366/white?text=DPM+Photo'
    }
];

// --- Sub-Components ---

const FilterSection = ({ title, items }: { title: string; items: string[] }) => (
    <div className="mb-10">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-orange-500 w-fit pb-1 text-slate-800 tracking-tight">
            {title}
        </h3>
        <div className="space-y-3">
            {items.map((item) => (
                <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <input type="checkbox" className="mt-1 w-5 h-5 border-gray-300 rounded text-blue-800 focus:ring-blue-500" />
                    <span className="text-[15px] text-slate-700 leading-snug group-hover:text-blue-700 transition-colors">
                        {item}
                    </span>
                </label>
            ))}
        </div>
    </div>
);

const ResourceItem = ({ item }: { item: Resource }) => {
    const badgeStyles: Record<ResourceType, string> = {
        Publication: 'bg-[#3f51b5]',
        Report: 'bg-[#3949ab]',
        Video: 'bg-[#5c6bc0]',
        Press: 'bg-[#1e88e5]',
        Blog: 'bg-[#3f51b5]',
        Social: 'bg-[#283593]',
        Template: 'bg-[#303f9f]',
        Online: 'bg-[#1a237e]',
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 py-10 border-b border-gray-200 last:border-0">
            {/* Cover Image */}
            <div className="w-full md:w-44 flex-shrink-0">
                <div className="aspect-[3/4] bg-white shadow-xl overflow-hidden border border-gray-100 ring-1 ring-black/5">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                <span className={`inline-block px-3 py-0.5 text-[10px] font-bold text-white uppercase rounded ${badgeStyles[item.type]}`}>
                    {item.type}
                </span>
                <h2 className="text-2xl font-semibold text-slate-900 mt-2 leading-tight tracking-tight">
                    {item.title}
                </h2>
                <p className="text-sm font-bold text-slate-800 mt-1">{item.date}</p>

                {(item.org || item.author) && (
                    <div className="mt-2 text-sm text-slate-600 font-medium">
                        <p>{item.org}</p>
                        <p>{item.author}</p>
                    </div>
                )}

                <p className="mt-4 text-slate-600 text-[15px] leading-relaxed line-clamp-3">
                    {item.description}
                </p>

                <button className="mt-2 text-sm font-bold underline text-slate-900 hover:text-blue-800">
                    More
                </button>

                <div className="mt-6 flex gap-4 text-xs font-bold items-baseline">
                    <span className="text-slate-400">Language:</span>
                    {item.languages.map(lang => (
                        <span key={lang} className="text-slate-900">{lang}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

export default function ResourceLibraryPage() {
    const [activeTab, setActiveTab] = useState<'added' | 'published'>('added');

    return (
        <div className="bg-[#f2f4f7] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Main Content Column */}
                    <main className="flex-1 order-2 lg:order-1">
                        {/* List */}
                        <div className="divide-gray-200">
                            {DATA.map((resource) => (
                                <ResourceItem key={resource.id} item={resource} />
                            ))}
                        </div>
                    </main>

                    {/* Sidebar Filters Column */}
                    <aside className="w-full lg:w-72 order-1 lg:order-2">
                        <div className='bg-white px-4 pt-4 pb-20'>
                            <h2 className="text-2xl font-bold text-slate-800 mb-10 tracking-wide uppercase">
                                Search Filters
                            </h2>

                            <FilterSection
                                title="Category"
                                items={['Report', 'Publication', 'Press', 'Blog', 'Video', 'Online', 'Social', 'Template', 'Audio']}
                            />

                            <FilterSection
                                title="Dates"
                                items={['2021-2026', '2015-2020', '2009-2014', '2003-2008', 'before 2003']}
                            />

                            <FilterSection
                                title="Working Groups"
                                items={[
                                    'Agriculture & Agro-Industry', 'Tourism', 'Manufacturing & SMEs',
                                    'Law, Tax & Governance', 'Banking & Financial Services',
                                    'Transportation & Infrastructure', 'Export Processing & Trade Facilitation',
                                    'Industrial Relations', 'Paddy-Rice', 'Energy & Mineral Resources',
                                    'Education', 'Health', 'Construction & Real Estate',
                                    'Non-Banking Financial Services', 'Digital Economy, Society & Telecommunications',
                                    'Land Administration, Security & Public Order'
                                ]}
                            />
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
}