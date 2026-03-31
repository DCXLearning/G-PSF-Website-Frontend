import React from 'react'
import ListWorkingGroups from '../List-WorkingGroups/List-WorkingGroups'
import Mandate from '../List-WorkingGroups/Mandate'
import View from '../List-WorkingGroups/View'
import Start from '../List-WorkingGroups/Start'

type RoutProps = {
    pageSlug?: string
}

export default function Rout({ pageSlug }: RoutProps) {
    return (
        <>
            <ListWorkingGroups pageSlug={pageSlug} />
            <Mandate pageSlug={pageSlug} />
            <View pageSlug={pageSlug} />
            {/*<Start pageSlug={pageSlug} />*/}
        </>
    )
}
