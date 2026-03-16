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

    return (
        <>
            <Search value={query} onSearch={setQuery} />
            <FeaturedPublicationsClient items={featuredItems} query={query} />
            <ResourceLibraryPage query={query} />
        </>
    );
}