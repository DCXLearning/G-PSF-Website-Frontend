"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Search() {
    const router = useRouter();
    const [q, setQ] = useState("");

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const query = q.trim();
        // go to /documents?q=...
        router.push(query ? `/documents?q=${encodeURIComponent(query)}` : "/documents");
    }

    return (
        <main className="bg-[#d9d9d9] py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-4">
                <h1 className="text-[#1a2b4b] text-3xl md:text-4xl font-extrabold">
                    Search the documents page
                </h1>

                <form onSubmit={onSubmit} className="mt-5">
                    <div className="flex w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-sm">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search related public documents …"
                            className="h-11 flex-1 px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                        />

                        <button
                            type="submit"
                            className="h-11 shrink-0 bg-[#2f3b86] px-8 text-sm font-extrabold uppercase tracking-wide text-white hover:opacity-90"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}