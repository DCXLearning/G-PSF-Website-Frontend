import React from 'react'
import NewUpdate from '../News&Updates/Banner'
import Select from '../News&Updates/Select'
import NewUpdateSection from '../News&Updates/NewUpdate'
import EventsAndAnnouncements from '../News&Updates/EventAndAnnouncements'
import Achievements from '../News&Updates/Achievements'
import CaseStudies from '../News&Updates/CaseStudies'
import SubmissionForm from '../News&Updates/SubmissionForm'

export default function RouterNewUpdate() {
    return (
        <>
            <NewUpdate />
            <Select />
            <NewUpdateSection />
            <EventsAndAnnouncements />
            <Achievements />
            <CaseStudies />
            <SubmissionForm />
        </>
    )
}
