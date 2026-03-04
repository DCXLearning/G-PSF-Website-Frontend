// src/Components/DigitalReforms.tsx
'use client';  // Mark this as a Client Component for Next.js

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


// Define the type for each content item in the Swiper
interface ContentItem {
    title: string;
    content: string;
    icon: string;  // Icon can be a string or React component
}

// Sample data for the carousel
const contentItems: ContentItem[] = [
    { title: 'G-PSF Brings Significant Progress to Drive Cambodia’s Economic Growth.', content: 'The G-PSF provides the private sector with an opportunity to voice their challenges and', icon: '📊' },
    { title: 'អ្នកឧកញ៉ា គិត ម៉េង កោតសរសើរវឌ្ឍនភាពវេទិការាជរដ្ឋាភិបាល-ឯកជន លើកទី១៩', content: 'អ្នកឧកញ៉ា គិត ម៉េង កោតសរសើរបំពោះវឌ្ឍនភាព ដែលវេទិការាជរដ្ឋាភិបាល-ផ្នែកឯកជន លើកទី១៩ សម្រេច', icon: '💡' },
    { title: 'Neak Oknha Kith Meng praises the progress of the 19th Government-Private Sector Forum.', content: 'Cambodia offers incentives for investment across a vast range of sectors — including high tech industries and R&D, innovation or manufac-', icon: '💼' },
    { title: 'Work Group Meetings', content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.', icon: '🤝' },
    { title: 'News & Updates', content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore.', icon: '📰' },
];

// Define a custom dark blue color (similar to the image background)
const DARK_BLUE = '#1A1D42';
const TEXT_COLOR = '#A3A5B8'; // Lighter text color for main content

const Slider: React.FC = () => {
    return (
        <>
            {/* Header Section */}
            <div className="text-center mb-90 mt-32">
                <p className="text-xl font-medium text-indigo-600 uppercase tracking-wider">
                    More G-PSF News
                </p>
                <h1 className="text-6xl font-extrabold text-indigo-900 mt-2">
                    Related content
                </h1>
            </div>

            <div
                className="bg-darkBlue h-[220px] flex flex-col justify-end relative"
                style={{ backgroundColor: DARK_BLUE }}
            >
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        slidesPerView={1}
                        spaceBetween={20}
                        navigation={false}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                        className="custom-swiper-pagination-white"
                    >
                        {contentItems.map((item, index) => (
                            <SwiperSlide key={index} className="pb-15 pt-16 px-[10px]">
                                <div className="rounded-tl-[120px] bg-white overflow-hidden rounded-bl-[25px] rounded-br-[25px] relative pt-12 h-[390px] pb-95 flex flex-col" style={{ boxShadow: '0 7px 15px rgba(0,0,0,0.4)' }}>
                                    <div
                                        className="absolute bg-blue-950 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-70"
                                        style={{ borderColor: 'white' }}
                                    >
                                        <div className="flex items-center justify-center w-full h-[160px] text-white text-4xl">
                                            {/* Display the icon dynamically */}
                                            {item.icon}
                                        </div>
                                    </div>
                                    <div className="w-25 h-25 relative rounded-[200px] ml-10 top-8 mb-6">
                                        <div className="bg-blue-950 w-25 h-25 border-white border-3 rounded-[200px] flex items-center justify-center text-white text-4xl">
                                            {item.icon}
                                        </div>
                                    </div>

                                    <div className="p-6 pt-10">
                                        <h3 className="text-xl font-bold khmer-font text-gray-800 mb-4">{item.title}</h3>
                                        <p className="text-gray-600 khmer-font leading-relaxed text-base">{item.content}</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

        </>
    );
};

export default Slider;
