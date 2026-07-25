// PocketBase UI Translations
// ============================================================
// Supported languages: en, zh (extensible)
// Usage:
//   i18n("header.logout")        // global function, no import needed
//   window.app.i18n("nav.logs")  // same as above
// ============================================================
// Add new language: create locales/xx.js and import it below

import "./en.js";
import "./zh.js";

const STORAGE_KEY = "pbLanguage";
const currentLang = localStorage.getItem(STORAGE_KEY) || "en";

// Flatten nested locale object to dot-notation key-value pairs
// { search: { termOrFilter: "..." } } => { "search.termOrFilter": "..." }
const flattenLocale = (obj, prefix = "") => {
    let result = {};
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            Object.assign(result, flattenLocale(obj[key], fullKey));
        } else {
            result[fullKey] = obj[key];
        }
    }
    return result;
};

// Pre-flatten current language dict for fast lookup
let currentDict = {};
const rebuildDict = () => {
    const raw = window.app.i18nLocales?.[currentLang] || window.app.i18nLocales?.en || {};
    currentDict = flattenLocale(raw);
};
rebuildDict();

// i18n function - attached to window.app to prevent tree-shaking
window.app.i18n = function(key) {
    return currentDict[key] !== undefined ? currentDict[key] : key;
};

// Expose as global i18n function for convenience
window.i18n = window.app.i18n;

// Language utilities - also attached to window.app
window.app.i18nLangs = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
    // Add more languages here...
];

window.app.i18nGetLang = function() {
    return currentLang;
};

window.app.i18nSetLang = function(langCode) {
    if (!window.app.i18nLocales?.[langCode]) {
        console.warn(`[i18n] Unsupported language: ${langCode}`);
        return;
    }
    localStorage.setItem(STORAGE_KEY, langCode);
    window.location.reload();
};
