"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, A11y } from "swiper/modules";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type GalleryImage = { src?: string; alt?: string };

/**
 * Read-only carousel for the `imageGallery` Tiptap node on the public site.
 * One image per view, blue prev/next arrows on the sides, clickable dot
 * pagination at the bottom — matching the rest of the site's Swiper sliders.
 */
export default function ImageGalleryCarousel({ node }: NodeViewProps) {
  const images: GalleryImage[] = Array.isArray(node.attrs.images)
    ? node.attrs.images
    : [];

  const validImages = images.filter(
    (image): image is { src: string; alt?: string } =>
      typeof image?.src === "string" && image.src.trim().length > 0
  );

  if (validImages.length === 0) {
    return <NodeViewWrapper />;
  }

  // A single image doesn't need carousel chrome.
  if (validImages.length === 1) {
    return (
      <NodeViewWrapper className="my-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={validImages[0].src}
          alt={validImages[0].alt ?? ""}
          className="h-auto w-full rounded-md object-contain"
          loading="lazy"
        />
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="gpsf-gallery my-8" contentEditable={false}>
      <Swiper
        modules={[Navigation, Pagination, Keyboard, A11y]}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        slidesPerView={1}
        spaceBetween={0}
        loop={validImages.length > 1}
        className="gpsf-gallery-swiper"
      >
        {validImages.map((image, index) => (
          <SwiperSlide key={`${index}-${image.src}`}>
            <div className="relative flex w-full items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt ?? ""}
                className="max-h-[70vh] w-full object-contain"
                loading="lazy"
                draggable={false}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </NodeViewWrapper>
  );
}
