"use client";

import React from "react";

type PaginationProps = {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
};

function getVisiblePageNumbers(
    currentPage: number,
    totalPages: number,
    maxVisiblePages: number
): number[] {
    const safeMaxVisiblePages = Math.max(1, maxVisiblePages);
    const half = Math.floor(safeMaxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - half);
    const endPage = Math.min(totalPages, startPage + safeMaxVisiblePages - 1);

    startPage = Math.max(1, endPage - safeMaxVisiblePages + 1);

    return Array.from(
        { length: endPage - startPage + 1 },
        (_, index) => startPage + index
    );
}

export default function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    maxVisiblePages = 5,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null;
    }

    const pageNumbers = getVisiblePageNumbers(
        currentPage,
        totalPages,
        maxVisiblePages
    );
    const firstVisiblePage = pageNumbers[0];
    const lastVisiblePage = pageNumbers[pageNumbers.length - 1];

    function goToPage(page: number) {
        if (page < 1 || page > totalPages || page === currentPage) {
            return;
        }

        onPageChange(page);
    }

    return (
        <div className="mt-10 flex flex-col gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600">
                Page {currentPage} of {totalPages}
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                {firstVisiblePage > 1 ? (
                    <>
                        <button
                            type="button"
                            onClick={() => goToPage(1)}
                            className="min-w-10 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                        >
                            1
                        </button>
                        {firstVisiblePage > 2 ? (
                            <span className="px-1 text-sm font-semibold text-slate-500">
                                ...
                            </span>
                        ) : null}
                    </>
                ) : null}

                {pageNumbers.map((pageNumber) => {
                    const isActive = pageNumber === currentPage;

                    return (
                        <button
                            key={pageNumber}
                            type="button"
                            onClick={() => goToPage(pageNumber)}
                            aria-current={isActive ? "page" : undefined}
                            className={`min-w-10 rounded border px-3 py-2 text-sm font-semibold transition ${
                                isActive
                                    ? "border-[#1a2b4b] bg-[#1a2b4b] text-white"
                                    : "border-slate-300 text-slate-700 hover:border-slate-500 hover:text-slate-900"
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}

                {lastVisiblePage < totalPages ? (
                    <>
                        {lastVisiblePage < totalPages - 1 ? (
                            <span className="px-1 text-sm font-semibold text-slate-500">
                                ...
                            </span>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => goToPage(totalPages)}
                            className="min-w-10 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                        >
                            {totalPages}
                        </button>
                    </>
                ) : null}

                <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
