import React from 'react'
// import ResourcesHero from '../ResourcesPage/ResourcesHero'
import Policy_Documents from '../PublicationPage/Policy_Documents'
import WGOutputs from '../PublicationPage/WG_Outputs'
// import AnnualReports from '../ResourcesPage/AnnualReports'
import Semester from '../PublicationPage/Semester'
import ToolsSection from '../PublicationPage/ToolsSection'

function RouterResources() {
    return (
        <>
            {/* <AnnualReports /> */}
            <Semester />
            {/* <ResourcesHero /> */}
            <Policy_Documents />
            <WGOutputs />
            <ToolsSection />
        </>
    )
}

export default RouterResources