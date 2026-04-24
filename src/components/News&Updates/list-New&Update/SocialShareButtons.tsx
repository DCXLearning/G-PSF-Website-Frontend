"use client";

import { FaFacebookF, FaTelegramPlane } from "react-icons/fa";
import {
  buildFacebookShareUrl,
  buildTelegramShareUrl,
} from "@/utils/socialShare";

type SocialShareButtonsProps = {
  shareUrl: string;
  title: string;
  label?: string;
  className?: string;
  labelClassName?: string;
  buttonClassName?: string;
  iconClassName?: string;
};

function joinClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export default function SocialShareButtons({
  shareUrl,
  title,
  label = "Share:",
  className,
  labelClassName,
  buttonClassName,
  iconClassName,
}: SocialShareButtonsProps) {
  const facebookShareUrl = buildFacebookShareUrl(shareUrl);
  const telegramShareUrl = buildTelegramShareUrl(shareUrl, title);

  const wrapperClassName = joinClasses(
    "flex flex-wrap items-center gap-3",
    className,
  );
  const labelClasses = joinClasses(
    "text-[16px] font-medium text-[#2f2f2f]",
    labelClassName,
  );
  const buttonClasses = joinClasses(
    "grid h-8 w-8 place-items-center rounded-full text-white transition hover:scale-105",
    buttonClassName,
  );
  const iconClasses = joinClasses("h-3.5 w-3.5", iconClassName);

  return (
    <div className={wrapperClassName}>
      <span className={labelClasses}>{label}</span>

      <a
        href={facebookShareUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Share ${title} on Facebook`}
        className={joinClasses("bg-[#1877F2]", buttonClasses)}
      >
        <FaFacebookF className={iconClasses} />
      </a>

      <a
        href={telegramShareUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Share ${title} on Telegram`}
        className={joinClasses("bg-[#27A7E7]", buttonClasses)}
      >
        <FaTelegramPlane className={iconClasses} />
      </a>
    </div>
  );
}
