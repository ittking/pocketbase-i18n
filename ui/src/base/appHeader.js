// Inline translations - completely static to prevent tree-shaking
const _lang = localStorage.getItem("pbLanguage") || "en";
const _isZh = _lang === "zh";

export function appHeader() {
    return () => {
        if (!app.store._ready || !app.store.showHeader || !app.store.superuser?.id) {
            return;
        }

        return t.header(
            {
                pbEvent: "appHeader",
                rid: "appHeader",
                className: "app-header accent-surface",
                onmount: async (el) => {
                    await new Promise((r) => setTimeout(r, 0));

                    el._scrollToActiveMenuItem = function() {
                        el?.querySelector(".app-main-nav .header-link.active")?.scrollIntoView();
                    };
                    el._scrollToActiveMenuItem();
                    window.addEventListener("hashchange", el._scrollToActiveMenuItem);
                },
                onunmount: (el) => {
                    window.removeEventListener("hashchange", el?._scrollToActiveMenuItem);
                },
            },
            t.a(
                { href: "#/", className: "logo" },
                t.img({ src: () => app.store.headerLogo, alt: "App logo" }),
            ),
            t.nav(
                {
                    pbEvent: "mainNav",
                    className: "app-main-nav",
                },
                () => {
                    return app.store.headerLinks.map((link) => {
                        const isLocal = link.href.startsWith("#/");

                        return t.a(
                            {
                                href: () => link.href,
                                target: () => !isLocal ? "_blank" : undefined,
                                rel: () => !isLocal ? "noopener noreferrer" : undefined,
                                className: (el) => {
                                    const isActive = link.isActive?.(el) || app.utils.isActivePath(link.href);
                                    return `header-link ${isActive ? "active" : ""}`;
                                },
                            },
                            () => {
                                if (link.icon) {
                                    return t.i({ className: link.icon, ariaHidden: true });
                                }
                            },
                            t.span({ className: "txt" }, () => link.label),
                        );
                    });
                },
            ),
            t.div({ className: "flex-fill app-header-separator" }),
            languageButton(),
            colorSchemeButton(),
            t.button(
                {
                    type: "button",
                    className: "header-link logged-user txt-normal",
                    "html-popovertarget": "logged-user-dropdown",
                },
                t.span({ className: "superuser-name txt-ellipsis" }, () => app.store.superuser?.email),
                t.i({ className: "ri-arrow-drop-down-line", ariaHidden: true }),
            ),
            t.div(
                {
                    pbEvent: "loggedUserDropdown",
                    id: "logged-user-dropdown",
                    className: "dropdown sm nowrap logged-user-dropdown",
                    popover: "auto",
                },
                t.a(
                    {
                        className: "dropdown-item dropdown-item-manage",
                        href: "#/collections?collection=_superusers",
                        onclick: (e) => {
                            e.target.closest(".dropdown").hidePopover();
                        },
                    },
                    t.i({ className: "ri-group-line", ariaHidden: true }),
                    t.span({ className: "txt" }, _isZh ? "管理超级用户" : "Manage superusers"),
                ),
                t.hr(),
                t.button(
                    {
                        type: "button",
                        className: "dropdown-item txt-danger dropdown-item-logout",
                        onclick: () => app.pb.authStore.clear(),
                    },
                    t.i({ className: "ri-logout-circle-line", ariaHidden: true }),
                    t.span({ className: "txt" }, _isZh ? "退出登录" : "Logout"),
                ),
            ),
        );
    };
}

function colorSchemeButton() {
    const options = [
        { value: "light", icon: "ri-sun-line", label: _isZh ? "浅色" : "Light" },
        { value: "dark", icon: "ri-moon-line", label: _isZh ? "深色" : "Dark" },
        { value: "", icon: "ri-subtract-line", label: _isZh ? "自动" : "Auto" },
    ];

    return [
        t.button(
            {
                type: "button",
                className: "header-link color-scheme-picker",
                "html-popovertarget": "color-scheme-dropdown",
                title: _isZh ? "主题模式" : "Color scheme",
            },
            t.i({
                className: () => app.store.activeColorScheme == "dark" ? "ri-moon-line" : "ri-sun-line",
                ariaHidden: true,
            }),
        ),
        t.div(
            {
                pbEvent: "colorSchemeDropdown",
                id: "color-scheme-dropdown",
                className: "dropdown sm nowrap color-scheme-dropdown",
                popover: "auto",
            },
            () => {
                return options.map((opt) => {
                    return t.button(
                        {
                            type: "button",
                            className: () =>
                                `dropdown-item dropdown-item-light ${
                                    app.store.userColorScheme == opt.value ? "active" : ""
                                }`,
                            onclick: (e) => {
                                e.target.closest(".dropdown").hidePopover();
                                app.store.userColorScheme = opt.value;
                            },
                        },
                        t.i({ className: opt.icon, ariaHidden: true }),
                        t.span({ className: "txt" }, opt.label),
                    );
                });
            },
        ),
    ];
}

function languageButton() {
    const langs = [
        { code: "en", name: "English" },
        { code: "zh", name: "中文" },
    ];

    return [
        t.button(
            {
                type: "button",
                className: "header-link language-picker",
                "html-popovertarget": "language-dropdown",
                title: _isZh ? "语言" : "Language",
            },
            t.i({ className: "ri-translate", ariaHidden: true }),
        ),
        t.div(
            {
                pbEvent: "languageDropdown",
                id: "language-dropdown",
                className: "dropdown sm nowrap language-dropdown",
                popover: "auto",
            },
            () => {
                return langs.map((lang) => {
                    return t.button(
                        {
                            type: "button",
                            className: () => `dropdown-item dropdown-item-lang ${_lang === lang.code ? "active" : ""}`,
                            onclick: (e) => {
                                e.target.closest(".dropdown").hidePopover();
                                localStorage.setItem("pbLanguage", lang.code);
                                window.location.reload();
                            },
                        },
                        t.span({ className: "txt" }, lang.name),
                    );
                });
            },
        ),
    ];
}
