"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IoIosArrowDown } from "react-icons/io";
import { useRouter } from "next/navigation";

type Menu = "plenary" | "working" | "media" | null;

const Navbar = () => {
    const [openMenu, setOpenMenu] = useState<Menu>(null);
    const [searchValue, setSearchValue] = useState("");
    const navRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const toggleMenu = (menu: Menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const handleSearch = () => {
        const keyword = searchValue.trim();
        router.push(
            `/search-news-updates${keyword ? `?q=${encodeURIComponent(keyword)}` : ""}`
        );
    };

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
            <div className="max-w-7xl mx-auto px-4 pt-16">
                {/* md:justify-between */}
                <div className="flex flex-col md:flex-wrap md:flex-row md:items-center gap-4">
                    <button className="bg-orange-500 text-white px-6 py-2 rounded-md font-semibold w-fit">
                        All
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                        <Link
                            href="/featured"
                            className="text-lg text-gray-800 hover:text-orange-500"
                        >
                            Featured
                        </Link>

                        <MenuItem
                            title="Plenary"
                            isOpen={openMenu === "plenary"}
                            onClick={() => toggleMenu("plenary")}
                        >
                            <DropdownItem href="/publication/detail" label="Laws & Regulations" />
                            <DropdownItem href="/publication/detail" label="Decisions" />
                            <DropdownItem href="/publication/detail" label="Reform Tracker" />
                        </MenuItem>

                        <MenuItem
                            title="Working Groups"
                            isOpen={openMenu === "working"}
                            onClick={() => toggleMenu("working")}
                        >
                            <DropdownItem href="/publication/detail" label="Reports" />
                            <DropdownItem href="/publication/detail" label="Co-Chairs" />
                            <DropdownItem href="/publication/detail" label="WG Profiles" />
                        </MenuItem>

                        <MenuItem
                            title="Media"
                            isOpen={openMenu === "media"}
                            onClick={() => toggleMenu("media")}
                        >
                            <DropdownItem href="/publication/detail" label="Press" />
                            <DropdownItem href="/publication/detail" label="Photos" />
                            <DropdownItem href="/publication/detail" label="Video" />
                        </MenuItem>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;

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
                className={`transition-transform ${
                    isOpen ? "rotate-180 text-orange-500" : ""
                }`}
            />
        </button>

        {isOpen && <Dropdown>{children}</Dropdown>}
    </div>
);

const Dropdown = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-2 w-full md:absolute md:left-0 md:mt-3 md:w-48 bg-white shadow-lg rounded-md z-50">
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
