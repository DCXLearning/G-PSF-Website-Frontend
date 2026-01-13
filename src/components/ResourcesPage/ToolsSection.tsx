import React from 'react';
import { FileText, ClipboardList, BookOpen } from 'lucide-react';

interface ToolItem {
    type: 'Template' | 'Form';
    title: string;
    description: string;
    icon: React.ReactNode;
}

const tools: ToolItem[] = [
    {
        type: 'Template',
        title: 'WG Meeting Agenda',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        icon: <FileText className="w-12 h-12 text-white" />,
    },
    {
        type: 'Template',
        title: 'Meeting Minutes',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        icon: <ClipboardList className="w-12 h-12 text-white" />,
    },
    {
        type: 'Form',
        title: 'Sign-in Sheet',
        description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
        icon: <BookOpen className="w-12 h-12 text-white" />,
    },
];

export default function ToolsSection() {
    return (
        <section className="bg-white py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">
                {/* Header Section */}
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e1e4b] uppercase tracking-tight">
                    Standard Templates & Forms
                </h2>
                <h1 className="text-5xl md:text-6xl font-bold text-[#1e1e4b] mt-2 mb-6">
                    Tools
                </h1>
                <p className="max-w-3xl mx-auto text-[#1e1e4b] text-xl leading-relaxed mb-16">
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh
                    euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
                </p>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {tools.map((tool, index) => (
                        <div key={index} className="flex flex-col items-center group">
                            {/* Icon Circle */}
                            <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center mb-6 shadow-lg">
                                {tool.icon}
                            </div>

                            {/* Content */}
                            <span className="text-slate-900 font-bold mb-2">{tool.type}</span>
                            <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                                {tool.title}
                            </h3>
                            <p className="text-[#1e1e4b] text-sm leading-6 mb-8 px-4">
                                {tool.description}
                            </p>

                            {/* Download Button */}
                            <button className="hover:underline flex items-center cursor-pointer gap-2 px-8 py-2 border border-orange-400 text-slate-800 text-sm font-bold rounded-lg hover:bg-orange-50 transition-colors">
                                Download
                                <span className="text-xs">›</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}