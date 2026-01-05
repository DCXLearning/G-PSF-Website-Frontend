import React from 'react'
import ListWorkingGroups from '../ListWorking/List-WorkingGroups'
import Mandate from '../ListWorking/Mandate'
import View from '../ListWorking/View'
import Start from '../ListWorking/Start'

export default function Rout() {
    return (
        <>
            <ListWorkingGroups />
            <Mandate />
            <View />
            <Start />
        </>
    )
}
