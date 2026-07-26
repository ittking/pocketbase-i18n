export function superuserAccordion(pageData) {
    const info = store({
        isLoading: false,
        realIP: "",
    });

    async function loadInfo() {
        info.isLoading = true;

        try {
            const health = await app.pb.health.check({ requestKey: "loadSuperuserIPsInfo" });

            info.realIP = health.data?.realIP || "";
            info.isLoading = false;
        } catch (err) {
            if (!err.isAbort) {
                app.checkApiError(err);
                info.isLoading = false;
            }
        }
    }

    return t.details(
        {
            pbEvent: "superuserAccordion",
            className: "accordion superuser-accordion",
            name: "settingsAccordion",
            onmount: (el) => {
                el._ipwatcher?.unwatch();
                el._ipwatcher = watch(
                    () => JSON.stringify(app.store.settings?.trustedProxy?.headers),
                    (newHash, oldHash) => {
                        if (newHash != oldHash) {
                            loadInfo();
                        }
                    },
                );
            },
            onunmount: (el) => {
                el._ipwatcher?.unwatch();
            },
        },
        t.summary(
            null,
            t.i({ className: "ri-fingerprint-2-line", ariaHidden: true }),
            t.span({ className: "txt" }, () => i18n("settings.superuserIps")),
            t.div({ className: "flex-fill" }),
            () => {
                if (pageData.formSettings?.superuserIPs?.length) {
                    return t.span({ className: "label success" }, () => i18n("settings.enabled"));
                }
                return t.span({ className: "label" }, () => i18n("settings.disabled"));
            },
            () => {
                if (!app.utils.isEmpty(app.store.errors?.batch)) {
                    return t.i({
                        className: "ri-error-warning-fill txt-danger",
                        ariaDescription: app.attrs.tooltip(() => i18n("settings.hasErrors"), "left"),
                    });
                }
            },
        ),
        t.div(
            { className: "content m-b-sm" },
            t.p(null, () => i18n("settings.superuserIpsDescription")),
            t.p(
                null,
                () => i18n("settings.superuserIpsSecurityNote"),
            ),
            t.p(
                null,
                () => i18n("settings.ipChangeResetHint") + " ",
                t.a(
                    {
                        href: import.meta.env.PB_SUPERUSER_IPS_RESET_DOCS,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "link-primary txt-bold txt-sm",
                    },
                    t.code(
                        null,
                        () => i18n("settings.superuserIpsConsoleCommand"),
                        t.i({ ariaHidden: true, className: "ri-arrow-right-up-line txt-sm" }),
                    ),
                ),
                " " + i18n("settings.consoleCommandHint"),
            ),
        ),
        t.div(
            { className: "fields" },
            t.div(
                { className: "field" },
                t.label(
                    { htmlFor: "superuserIPs" },
                    t.span({ className: "txt" }, () => i18n("settings.superuserIpsAndSubnets")),
                ),
                t.input({
                    id: "superuserIPs",
                    name: "superuserIPs",
                    type: "text",
                    placeholder: () => i18n("settings.leaveEmptyNoRestriction"),
                    value: () => app.utils.joinNonEmpty(pageData.formSettings.superuserIPs),
                    oninput: (e) => {
                        const newValue = app.utils.splitNonEmpty(e.target.value, ",");
                        const newStr = app.utils.joinNonEmpty(newValue);
                        const oldStr = app.utils.joinNonEmpty(pageData.formSettings.superuserIPs);

                        // has an actual change
                        if (oldStr != newStr) {
                            pageData.formSettings.superuserIPs = newValue;
                        }
                    },
                }),
            ),
            t.div(
                { className: "field addon" },
                t.button(
                    {
                        type: "button",
                        className: () =>
                            `btn sm secondary transparent ${
                                app.utils.isEmpty(pageData.formSettings.superuserIPs) ? "hidden" : ""
                            }`,
                        onclick: () => {
                            pageData.formSettings.superuserIPs = [];

                            if (app.store.errors?.superuserIPs) {
                                delete app.store.errors.superuserIPs;
                            }
                        },
                    },
                    t.span({ className: "txt" }, () => i18n("settings.clear")),
                ),
            ),
        ),
        t.div(
            { className: "field-help" },
            () => i18n("settings.ipsAndSubnetsHint"),
            t.div(
                { className: "inline-flex gap-5" },
                t.div({
                    role: "button",
                    className: "label sm link-primary",
                    onclick: () => {
                        if (info.isLoading) {
                            return;
                        }

                        const ips = app.utils.toArray(pageData.formSettings.superuserIPs);
                        app.utils.pushUnique(ips, info.realIP);
                        pageData.formSettings.superuserIPs = ips;
                    },
                    textContent: () => info.isLoading ? "..." : (info.realIP + " " + i18n("settings.you")),
                }),
            ),
        ),
    );
}
