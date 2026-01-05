import React from 'react'
import BannerWorkingGroups from '../WorkingGroupsPage/BannerWorking'
import WorkingGroups16 from '../WorkingGroupsPage/TitleWorkingGroups'
import WorkGroupsGrid from '../WorkingGroupsPage/WorkingGroupsCard'
import Date from '../WorkingGroupsPage/Date'
import SubmissionForm from '../WorkingGroupsPage/SubmissionForm'
import Engage from '../WorkingGroupsPage/Engage'
import SlideWorking from '../WorkingGroupsPage/SlideWorking'
import Achievements from '../WorkingGroupsPage/Achievements'
import Participates from '../WorkingGroupsPage/Participates'

export default function RouterWorkingGroups() {
    return (
        <>
            <BannerWorkingGroups />
            <WorkingGroups16 />
            <WorkGroupsGrid />
            <Date />
            <Engage />
            <SubmissionForm />
            <SlideWorking />
            <Achievements />
            <Participates />
        </>
    )
}
