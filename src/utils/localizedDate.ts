//helper format date to khmer
type DateLanguage = "en" | "kh" | "km";

const KHMER_MONTHS = [
    "មករា",
    "កុម្ភៈ",
    "មីនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
];

const ENGLISH_MONTHS: Record<string, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
};

const KHMER_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

function cleanText(value?: string | null) {
    return value?.trim() ?? "";
}

function toKhmerDigits(value: number | string) {
    return String(value).replace(/\d/g, (digit) => KHMER_DIGITS[Number(digit)]);
}

function parseEnglishDate(value: string) {
    const match = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);

    if (!match) {
        return null;
    }

    const day = Number(match[1]);
    const month = ENGLISH_MONTHS[match[2].toLowerCase()];
    const year = Number(match[3]);

    if (!day || month === undefined || !year) {
        return null;
    }

    return new Date(year, month, day);
}

function parseDate(value: string) {
    const englishDate = parseEnglishDate(value);

    if (englishDate) {
        return englishDate;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLocalizedDate(value?: string | null, language: DateLanguage = "en") {
    const raw = cleanText(value);

    if (!raw) {
        return "";
    }

    const date = parseDate(raw);

    if (!date) {
        return raw;
    }

    if (language === "kh" || language === "km") {
        const day = toKhmerDigits(String(date.getDate()).padStart(2, "0"));
        const month = KHMER_MONTHS[date.getMonth()];
        const year = toKhmerDigits(date.getFullYear());

        return `${day} ${month} ${year}`;
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date);
}

export function formatLocalizedMonthYear(value?: string | null, language: DateLanguage = "en") {
    const raw = cleanText(value);

    if (!raw) {
        return "";
    }

    const date = parseDate(raw);

    if (!date) {
        return raw;
    }

    if (language === "kh" || language === "km") {
        const month = KHMER_MONTHS[date.getMonth()];
        const year = toKhmerDigits(date.getFullYear());

        return `${month} ${year}`;
    }

    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
    }).format(date);
}

export function formatLocalizedMonthName(
    year: number,
    month: number,
    language: DateLanguage = "en",
    uppercaseEnglish = false
) {
    if (language === "kh" || language === "km") {
        return KHMER_MONTHS[month] ?? "";
    }

    const label = new Intl.DateTimeFormat("en-US", {
        month: "long",
    }).format(new Date(year, month, 1));

    return uppercaseEnglish ? label.toUpperCase() : label;
}
