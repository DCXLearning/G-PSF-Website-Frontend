import localFont from "next/font/local";

export const kantumruyPro = localFont({
  src: [
    { path: "../public/fonts/KantumruyPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/KantumruyPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/KantumruyPro-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/KantumruyPro-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-kantumruy-pro", // ✅ this creates the CSS var
  display: "swap",
});