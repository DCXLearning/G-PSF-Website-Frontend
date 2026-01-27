import React from 'react'
// import HeroBanner from '../HomePage/Banner';
import Benefits from '../HomePage/Benefits';
import Update_News from '../HomePage/Update&News';
import DigitalReforms from '../HomePage/DigitalReforms';
import GrowthVision from '../HomePage/GrowthVision';
import StatsBar from '../HomePage/StatsBar';
import WorkGroupsCarousel from '../HomePage/WorkGroupsCarousel';
import MembersSaySwiperSlider from '../HomePage/MembersSay_Swiper';
import TrustedByCarousel from '../HomePage/TrustedBy';

function RouterHome() {
  return (
    <>
    {/* banner error */}
      {/* <HeroBanner /> */}
      <Benefits />
      <Update_News />
      <StatsBar />
      <GrowthVision />
      <DigitalReforms />
      <WorkGroupsCarousel />
      <MembersSaySwiperSlider />
      <TrustedByCarousel />
    </>
  )
}

export default RouterHome;