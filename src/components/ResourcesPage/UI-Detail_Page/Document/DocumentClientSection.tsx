"use client";

import React, { useState } from "react";
import Search from "./Search";
import ResourceLibraryPage from "./ResourceLibraryPage";
import FeaturedPublicationsClient, {
    type Publication,
} from "./FeaturedPublicationsClient";

type DocumentClientSectionProps = {
    featuredItems: Publication[];
};

export default function DocumentClientSection({
    featuredItems,
}: DocumentClientSectionProps) {
    const [query, setQuery] = useState("");
    const hasSearch = query.trim().length > 0;

    return (
        <>
            <Search value={query} onSearch={setQuery} />
            {!hasSearch ? (
                <FeaturedPublicationsClient items={featuredItems} query={query} />
            ) : null}
            <ResourceLibraryPage query={query} />
        </>
    );
}
