import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(...inputs));
}

// Minimal HTML sanitizer to prevent script injection in previews
export function sanitizeHtml(html) {
    if (!html || typeof html !== "string") return "";
    let safe = html;
    safe = safe.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    safe = safe.replace(/\son\w+="[^"]*"/gi, "");
    safe = safe.replace(/\son\w+='[^']*'/gi, "");
    return safe;
}

