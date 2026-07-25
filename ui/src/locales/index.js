// PocketBase UI Translations
// ============================================================
// Supported languages: en, zh (extensible)
// Usage:
//   i18n("header.logout")  // global function, no import needed
// ============================================================

const STORAGE_KEY = "pbLanguage";

// Translation dictionaries
const translations = {
    en: {
        "header.manageSuperusers": "Manage superusers",
        "header.logout": "Logout",
        "nav.collections": "Collections",
        "nav.logs": "Logs",
        "nav.settings": "Settings",
        "colorScheme.light": "Light",
        "colorScheme.dark": "Dark",
        "colorScheme.auto": "Auto",
        "colorScheme.title": "Color scheme",
        "language.title": "Language",
        "search.search": "Search",
        "search.clear": "Clear",
        "search.loading": "Loading...",
        "search.termOrFilter": "Search term or filter...",
        "sidebar.searchCollections": "Search collections...",
        "sidebar.noCollectionsFound": "No collections found.",
        "sidebar.clearSearch": "Clear search",
        "sidebar.pinned": "Pinned",
        "sidebar.others": "Others",
        "sidebar.collections": "Collections",
        "sidebar.system": "System",
        "sidebar.newCollection": "New collection",
        "tooltip.clear": "Clear",
        "tooltip.collectionsOverview": "Collections overview",
        "tooltip.pin": "Pin",
        "tooltip.unpin": "Unpin",
    },
    zh: {
        "header.manageSuperusers": "管理超级用户",
        "header.logout": "退出登录",
        "nav.collections": "集合",
        "nav.logs": "日志",
        "nav.settings": "设置",
        "colorScheme.light": "浅色",
        "colorScheme.dark": "深色",
        "colorScheme.auto": "自动",
        "colorScheme.title": "主题模式",
        "language.title": "语言",
        "search.search": "搜索",
        "search.clear": "清除",
        "search.loading": "加载中...",
        "search.termOrFilter": "搜索关键词或筛选条件...",
        "sidebar.searchCollections": "搜索集合...",
        "sidebar.noCollectionsFound": "未找到集合",
        "sidebar.clearSearch": "清除搜索",
        "sidebar.pinned": "已固定",
        "sidebar.others": "其他",
        "sidebar.collections": "集合",
        "sidebar.system": "系统",
        "sidebar.newCollection": "新建集合",
        "tooltip.clear": "清除",
        "tooltip.collectionsOverview": "集合概览",
        "tooltip.pin": "固定",
        "tooltip.unpin": "取消固定",
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
    if (!translations[langCode]) {
        console.warn(`[i18n] Unsupported language: ${langCode}`);
        return;
    }
    localStorage.setItem(STORAGE_KEY, langCode);
    window.location.reload();
};
