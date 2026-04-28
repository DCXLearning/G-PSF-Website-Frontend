export type UiLanguage = "en" | "kh" | "km";

function isKhmerUi(language: UiLanguage) {
    return language === "kh" || language === "km";
}

export function getContentLanguageLabel(
    languageCode: string,
    uiLanguage: UiLanguage
) {
    const normalized = languageCode.trim().toLowerCase();

    if (normalized === "km" || normalized === "kh" || normalized === "khmer") {
        return isKhmerUi(uiLanguage) ? "ខ្មែរ" : "Khmer";
    }

    if (normalized === "en" || normalized === "english") {
        return isKhmerUi(uiLanguage) ? "អង់គ្លេស" : "English";
    }

    return languageCode;
}
