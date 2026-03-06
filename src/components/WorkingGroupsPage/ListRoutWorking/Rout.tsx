import React from 'react'
import ListWorkingGroups from '../ListWorking/List-WorkingGroups'
import Mandate from '../ListWorking/Mandate'
import View from '../ListWorking/View'
import Start from '../ListWorking/Start'

type RoutProps = {
    pageSlug?: string
}

export default function Rout({ pageSlug }: RoutProps) {
    return (
        <>
            <ListWorkingGroups pageSlug={pageSlug} />
            <Mandate pageSlug={pageSlug} />
            <View pageSlug={pageSlug} />
            <Start pageSlug={pageSlug} />
        </>
    )
}
