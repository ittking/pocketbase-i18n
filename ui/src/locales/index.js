// PocketBase UI Translations
// ============================================================
// Supported languages: en, zh (extensible)
// Usage: const _ = window.app.i18n; _("header.logout")
// ============================================================

const STORAGE_KEY = "pbLanguage";

// Translation dictionaries
const translations = {
    en: {
        "header.manageSuperusers": "Manage superusers",
        "header.logout": "Logout",
        "colorScheme.light": "Light",
        "colorScheme.dark": "Dark",
        "colorScheme.auto": "Auto",
        "colorScheme.title": "Color scheme",
        "language.title": "Language",
    },
    zh: {
        "header.manageSuperusers": "管理超级用户",
        "header.logout": "退出登录",
        "colorScheme.light": "浅色",
        "colorScheme.dark": "深色",
        "colorScheme.auto": "自动",
        "colorScheme.title": "主题模式",
        "language.title": "语言",
    },
    // Add more languages here...
};

// Current language
const currentLang = localStorage.getItem(STORAGE_KEY) || "en";

// i18n function - attached to window.app to prevent tree-shaking
window.app.i18n = function(key) {
    const dict = translations[currentLang] || translations.en;
    return dict[key] !== undefined ? dict[key] : key;
};

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
    if (!translations[langCode]) {
        console.warn(`[i18n] Unsupported language: ${langCode}`);
        return;
    }
    localStorage.setItem(STORAGE_KEY, langCode);
    window.location.reload();
};
