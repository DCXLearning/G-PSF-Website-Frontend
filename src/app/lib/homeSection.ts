// app/lib/homeSection.ts
import { API_URL } from "@/config/api";

export async function fetchHomeSection() {
    const res = await fetch(`${API_URL}/pages/home/section`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch home sections");

    return res.json();
}
