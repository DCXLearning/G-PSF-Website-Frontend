//RouterNewUpdate.tsx
import React from 'react'
import NewUpdate from '../News&Updates/Banner'
import Select from '../News&Updates/Select'
import NewUpdateSection from '../News&Updates/NewUpdate'
import EventsAndAnnouncements from '../News&Updates/EventAndAnnouncements'
import Achievements from '../News&Updates/Achievements'
import CaseStudies from '../News&Updates/CaseStudies'
import SubmissionForm from '../News&Updates/SubmissionForm'
import type { NewUpdateSectionProps } from '../News&Updates/NewUpdate'

type RouterNewUpdateProps = {
    newUpdateSectionData: NewUpdateSectionProps['data']
    allData?: unknown
    eventsAndAnnouncementsData?: unknown
    achievementsData?: unknown
    caseStudiesData?: unknown
}

export default function RouterNewUpdate({
    newUpdateSectionData,
    allData,
    eventsAndAnnouncementsData,
    achievementsData,
    caseStudiesData,
}: RouterNewUpdateProps) {
    // Keep these for future API wiring per component.
    void allData
    void eventsAndAnnouncementsData
    void achievementsData
    void caseStudiesData

    return (
        <>
            <NewUpdate />
            <Select />
            <NewUpdateSection data={newUpdateSectionData} />
            <EventsAndAnnouncements />
            <Achievements />
            <CaseStudies />
            <SubmissionForm />
        </>
    )
}
