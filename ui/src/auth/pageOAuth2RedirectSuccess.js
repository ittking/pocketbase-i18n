export function pageOAuth2RedirectSuccess(route) {
    app.store.title = i18n("auth.oauth2AuthCompleted");

    window.close();

    return t.div(
        { pbEvent: "pageOAuth2RedirectSuccess", className: "page" },
        t.div(
            { className: "page-content" },
            t.header(
                { className: "txt-center p-base" },
                t.h3({ className: "primary-heading m-b-sm" }, () => i18n("auth.authCompleted")),
                t.h6({ className: "secondary-heading" }, () => i18n("auth.closeThisWindow")),
            ),
        ),
    );
}
