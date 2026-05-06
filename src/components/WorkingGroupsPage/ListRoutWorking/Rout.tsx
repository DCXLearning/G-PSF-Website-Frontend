import React from 'react'
import ListWorkingGroups from '../List-WorkingGroups/List-WorkingGroups'
import Mandate from '../List-WorkingGroups/Mandate'
import View from '../List-WorkingGroups/View'
import WorkingGroupListCards from '../List-WorkingGroups/WorkingGroupListCards'
import TeamSection from '../List-WorkingGroups/co-chair'

type RoutProps = {
    pageSlug?: string
}

export default function Rout({ pageSlug }: RoutProps) {
    return (
        <>
            <ListWorkingGroups pageSlug={pageSlug} />
            <Mandate pageSlug={pageSlug} />
            <TeamSection pageSlug={pageSlug} />
            <View pageSlug={pageSlug} />
            <WorkingGroupListCards currentSlug={pageSlug} />
        </>
    )
}
