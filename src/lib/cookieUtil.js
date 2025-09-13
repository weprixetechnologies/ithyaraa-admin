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
    document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        expires +
        "; path=/" +
        // "; Secure" +      // only send over HTTPS
        "; SameSite=Strict"; // prevent CSRF, adjust if needed
};
