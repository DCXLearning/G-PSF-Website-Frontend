"use client";
import React from 'react'
import BannerAbout from '../AboutPage/BannerAbout'
import AboutUs from '../AboutPage/About-Us';
import Works from '../AboutPage/Works';
import Flow from '../AboutPage/Flow';
import WorkingGroup from '../AboutPage/Working-group';
import History from '../AboutPage/History';
import Bannerpdf from '../AboutPage/downloadPdf';


function RouterAbout() {
    return (
        <>
            <BannerAbout />
            <AboutUs />
            <Works />
            <Flow />
            <WorkingGroup />
            <History />
            <Bannerpdf />
        </>
    )
}

export default RouterAbout