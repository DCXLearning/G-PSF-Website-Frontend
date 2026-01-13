import React from 'react'
import ResourcesHero from '../ResourcesPage/ResourcesHero'
import Policy_Documents from '../ResourcesPage/Policy_Documents'
import WGOutputs from '../ResourcesPage/WG_Outputs'
import AnnualReports from '../ResourcesPage/AnnualReports'
import SemesterSlider from '../ResourcesPage/Semester'
import ToolsSection from '../ResourcesPage/ToolsSection'

function RouterResources() {
    return (
        <>
            <ResourcesHero />
            <Policy_Documents />
            <WGOutputs />
            <AnnualReports />
            <SemesterSlider />
            <ToolsSection />
        </>
    )
}

export default RouterResources