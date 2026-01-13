import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react'; // Optional: using lucide-react for the icons

const ResourcesHero = () => {
  return (
    <section className="w-full bg-white px-6 py-12 md:px-16 md:py-24">
      <div className="max-w-7xl px-4 mx-auto flex flex-col md:flex-row items-center gap-12">
        
        {/* Left Content Side */}
        <div className="flex-1 space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold text-[#1e2756] tracking-tight">
              Resources
            </h1>
            <p className="text-2xl md:text-4xl font-medium text-[#1e2756]">
              Streamlining the Reform Process
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mt-25">
            {/* Primary Button */}
            <button className="flex items-center justify-between gap-4 bg-[#f39c32] hover:bg-[#e68a1e] text-white font-medium py-3 px-6 rounded-lg transition-colors min-w-[160px]">
              Templates
              <ChevronRight size={18} />
            </button>

            {/* Secondary Button */}
            <button className="flex items-center justify-between gap-4 bg-[#e9ecef] hover:bg-[#dee2e6] text-[#1e2756] font-medium py-3 px-6 rounded-lg transition-colors min-w-[160px]">
              MIS Portal
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Image Side */}
        <div className="flex-1 w-full">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm shadow-sm">
            <img 
              src="/image/resources_top.bmp" 
              alt="Team collaborating around a laptop"
              className="object-cover w-full h-full"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default ResourcesHero;