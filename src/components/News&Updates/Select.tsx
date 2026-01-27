"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";

type Menu = "plenary" | "working" | "media" | null;

const Navbar = () => {
    const [openMenu, setOpenMenu] = useState<Menu>(null);
    const navRef = useRef<HTMLDivElement>(null);

    const toggleMenu = (menu: Menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav ref={navRef} className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex flex-col md:flex-wrap md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left */}
                    <button className="bg-orange-500 text-white px-6 py-2 rounded-md font-semibold w-fit">
                        All
                    </button>

                    {/* Center Menu */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">

                        <Link
                            href="/featured"
                            className="text-lg text-gray-800 hover:text-orange-500"
                        >
                            Featured
                        </Link>

                        {/* Plenary */}
                        <MenuItem
                            title="Plenary"
                            isOpen={openMenu === "plenary"}
                            onClick={() => toggleMenu("plenary")}
                        >
                            <DropdownItem href="/laws-regulations" label="Laws & Regulations" />
                            <DropdownItem href="/decisions" label="Decisions" />
                            <DropdownItem href="/reform-tracker" label="Reform Tracker" />
                        </MenuItem>

                        {/* Working Groups */}
                        <MenuItem
                            title="Working Groups"
                            isOpen={openMenu === "working"}
                            onClick={() => toggleMenu("working")}
                        >
                            <DropdownItem href="/reports" label="Reports" />
                            <DropdownItem href="/co-chairs" label="Co-Chairs" />
                            <DropdownItem href="/wg-profiles" label="WG Profiles" />
                        </MenuItem>

                        {/* Media */}
                        <MenuItem
                            title="Media"
                            isOpen={openMenu === "media"}
                            onClick={() => toggleMenu("media")}
                        >
                            <DropdownItem href="/press" label="Press" />
                            <DropdownItem href="/photos" label="Photos" />
                            <DropdownItem href="/video" label="Video" />
                        </MenuItem>
                    </div>

                    {/* Search */}
                    <div className="w-full md:w-auto">
                        <div className="relative w-full md:w-75 bg-gray-100 shadow-md rounded-full">
                            <input
                                type="text"
                                placeholder="Search Updates"
                                className="w-full pr-12 pl-4 py-2 bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            {/* Search Button */}
                            <button className="absolute right-0 cursor-pointer top-1/2 -translate-y-1/2 bg-white pt-[9.95px] pb-[9.95px] px-4 rounded-br-full rounded-tr-full shadow hover:bg-gray-100 transition">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;

/* ---------- Components ---------- */

const MenuItem = ({
    title,
    isOpen,
    onClick,
    children,
}: {
    title: string;
    isOpen: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <div className="relative">
        <button
            onClick={onClick}
            className="flex w-full md:w-auto items-center justify-between gap-2 text-lg text-gray-800 hover:text-orange-500"
        >
            {title}
            <IoIosArrowDown
                className={`transition-transform ${isOpen ? "rotate-180 text-orange-500" : ""
                    }`}
            />
        </button>

        {isOpen && <Dropdown>{children}</Dropdown>}
    </div>
);

const Dropdown = ({ children }: { children: React.ReactNode }) => (
    <div
        className="
            mt-2
            w-full
            md:absolute md:left-0 md:mt-3 md:w-48
            bg-white shadow-lg rounded-md z-50
        "
    >
        <ul>{children}</ul>
    </div>
);

const DropdownItem = ({ href, label }: { href: string; label: string }) => (
    <li>
        <Link
            href={href}
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
            {label}
        </Link>
    </li>
);
