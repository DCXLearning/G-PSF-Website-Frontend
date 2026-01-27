import React from 'react';
import { Megaphone } from 'lucide-react'; // Using lucide-react for the icon

const EventsAndAnnouncements = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="max-w-7xl px-4 mx-auto p-8 bg-white font-sans text-[#1a2b4b]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Events & Meetings Schedule */}
                <div className="lg:col-span-6">
                    <h2 className="text-3xl font-bold mb-6">Events & Meetings Schedule</h2>

                    <div className="bg-[#e9ecef] p-6 rounded-sm">
                        {/* Month Selector Tabs */}
                        <div className="flex items-center gap-1 bg-white/50 p-1 rounded-full mb-6 border border-gray-200">
                            <button className="flex-1 py-2 px-4 bg-white rounded-full shadow-sm font-bold text-gray-700">May</button>
                            <button className="flex-1 py-2 px-4 text-gray-400 font-bold">June</button>
                            <button className="flex-1 py-2 px-4 text-gray-400 font-bold">July</button>
                            <button className="px-3 text-gray-600 font-bold">›</button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="grid grid-cols-7 mb-4">
                                {weekDays.map((day, i) => (
                                    <div key={i} className="text-center text-gray-400 font-bold text-xl">{day}</div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-y-4">
                                {days.map((day) => (
                                    <div key={day} className="relative flex justify-center items-center">
                                        {day === 10 ? (
                                            <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-gray-800 font-bold text-xl shadow-inner">
                                                {day}
                                            </div>
                                        ) : (
                                            <span className="text-xl font-medium text-gray-800">{day}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Announcements */}
                <div className="lg:col-span-6">
                    <h2 className="text-3xl font-bold mb-6">Announcements</h2>

                    <div className="space-y-6">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="border border-gray-200 p-8 flex gap-6 hover:shadow-md transition-shadow items-start"
                            >
                                {/* Icon Image */}
                                <div className="flex-shrink-0 mt-2">
                                    <img
                                        src="/icon_NewUpdate_page/icon1.svg"
                                        alt="icon"
                                        className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                                        Lorem ipsum dolor sit amet
                                    </span>

                                    <h3 className="text-2xl font-bold mb-3 leading-tight">
                                        Lorem ipsum dolor sit amet
                                    </h3>

                                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
                                    </p>

                                    <button className="text-[10px] font-bold flex items-center mt-auto uppercase tracking-tighter">
                                        Download <span className="ml-1 text-lg">›</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventsAndAnnouncements;