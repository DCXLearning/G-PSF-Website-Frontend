import React from 'react'
import HeroBanner from './HeroBanner'
import FeaturedPublications from './FeaturedPublications'
import Search from './Search'
import ResourceLibraryPage from './ResourceLibraryPage'

export default function Rout() {
  return (
    <div>
        <HeroBanner />
        <Search />
        <FeaturedPublications />
        <ResourceLibraryPage />
    </div>
  )
}
