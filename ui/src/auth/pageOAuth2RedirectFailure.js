export function pageOAuth2RedirectFailure(route) {
    app.store.title = i18n("auth.oauth2AuthFailed");

    window.close();

    return t.div(
        { pbEvent: "pageOAuth2RedirectFailure", className: "page" },
        t.div(
            { className: "page-content" },
            t.header(
                { className: "txt-center p-base" },
                t.h3({ className: "primary-heading m-b-sm" }, () => i18n("auth.authFailed")),
                t.h6(
                    { className: "secondary-heading" },
                    () => i18n("auth.closeThisWindow") + " " + i18n("auth.goBackToSignIn"),
                ),
            ),
        ),
    );
}
