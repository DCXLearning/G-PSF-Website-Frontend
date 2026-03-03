import React from 'react'
import DetailPage, { type DetailPageData } from './Detail_top'
import Slider from './Slider'

type RoutProps = {
  detailData: DetailPageData
}

export default function Rout({ detailData }: RoutProps) {
  return (
    <div>
      <DetailPage data={detailData} />
      <Slider />
    </div>
  )
}
