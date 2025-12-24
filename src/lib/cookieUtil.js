// utils/cookies.js
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}


export const setCookie = (name, value, days) => {
    const expires = days
        ? "; expires=" + new Date(Date.now() + days * 864e5).toUTCString()
        : "";

    // Detect if we're on HTTPS (production) or HTTP (192.168.1.12)
    const isSecure = window.location.protocol === 'https:';

    // Set Secure flag only on HTTPS, use Lax for cross-site requests
    document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        expires +
        "; path=/" +
        (isSecure ? "; Secure" : "") +
        "; SameSite=Lax"; // Lax allows cookies to work across redirects but still provides CSRF protection
};
