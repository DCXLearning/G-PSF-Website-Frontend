import React from 'react'
import Policy_Documents from '../PublicationPage/Policy_Documents'
import WGOutputs from '../PublicationPage/WG_Outputs'
import Semester from '../PublicationPage/Semester'
import ToolsSection from '../PublicationPage/ToolsSection'

function RouterResources() {
    return (
        <>
            <Semester />
            <Policy_Documents />
            <WGOutputs />
            <ToolsSection />
        </>
    )
}

export default RouterResources