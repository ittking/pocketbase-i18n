export function trustedProxyAccordion(pageData) {
    const commonProxyHeaders = ["X-Forwarded-For", "Fly-Client-IP", "CF-Connecting-IP"];

    const ipOptions = [
        { label: () => i18n("settings.useLeftmostIP"), value: true },
        { label: () => i18n("settings.useRightmostIP"), value: false },
    ];

    const proxyInfo = store({
        isLoading: false,
        realIP: "",
        possibleProxyHeader: "",
        get suggestedProxyHeaders() {
            if (!proxyInfo.possibleProxyHeader) {
                return commonProxyHeaders;
            }

            return [proxyInfo.possibleProxyHeader].concat(
                commonProxyHeaders.filter((h) => h != proxyInfo.possibleProxyHeader),
            );
        },
        get isEnabled() {
            return !app.utils.isEmpty(pageData.formSettings.trustedProxy?.headers);
        },
    });

    async function loadProxyInfo() {
        proxyInfo.isLoading = true;

        try {
            const health = await app.pb.health.check({ requestKey: "loadProxyInfo" });

            proxyInfo.realIP = health.data?.realIP || "";
            proxyInfo.possibleProxyHeader = health.data?.possibleProxyHeader || "";
            proxyInfo.isLoading = false;
        } catch (err) {
            if (!err.isAbort) {
                app.checkApiError(err);
                proxyInfo.isLoading = false;
            }
        }
    }

    return t.details(
        {
            pbEvent: "trustedProxyAccordion",
            className: "accordion trusted-proxy-accordion",
            name: "settingsAccordion",
            onmount: (el) => {
                el._infoWatcher?.unwatch();
                el._infoWatcher = watch(() => JSON.stringify(app.store.settings?.trustedProxy), (newHash, oldHash) => {
                    if (newHash != oldHash) {
                        loadProxyInfo();
                    }
                });
            },
            onunmount: (el) => {
                el._infoWatcher?.unwatch();
            },
        },
        t.summary(
            null,
            t.i({ className: "ri-route-line", ariaHidden: true }),
            t.span({ className: "txt" }, () => i18n("settings.ipProxyHeaders")),
            () => {
                if (proxyInfo.isLoading) {
                    return t.span({ className: "loader sm" });
                }

                if (!proxyInfo.isEnabled && proxyInfo.possibleProxyHeader) {
                    return t.i({
                        className: "ri-alert-line txt-warning",
                        ariaDescription: app.attrs.tooltip(
                            () => i18n("settings.detectedProxyHeaderRecommend"),
                            "right",
                        ),
                    });
                }

                if (
                    proxyInfo.isEnabled
                    && proxyInfo.possibleProxyHeader
                    && !pageData.formSettings.trustedProxy.headers.includes(proxyInfo.possibleProxyHeader)
                ) {
                    return t.i({
                        className: "ri-alert-line txt-hint",
                        ariaDescription: app.attrs.tooltip(
                            () => i18n("settings.detectedProxyHeaderMismatch"),
                            "right",
                        ),
                    });
                }
            },
            t.div({ className: "flex-fill" }),
            () => {
                if (proxyInfo.isEnabled) {
                    return t.span({ className: "label success" }, () => i18n("settings.enabled"));
                }
                return t.span({ className: "label" }, () => i18n("settings.disabled"));
            },
            () => {
                if (!app.utils.isEmpty(app.store.errors?.trustedProxy)) {
                    return t.i({
                        className: "ri-error-warning-fill txt-danger",
                        ariaDescription: app.attrs.tooltip(() => i18n("settings.hasErrors"), "left"),
                    });
                }
            },
        ),
        t.p(
            { className: "m-t-0" },
            () => i18n("settings.realIpBelowHint"),
        ),
        t.div(
            { className: "alert info m-b-sm" },
            t.div(
                { className: "flex gap-5" },
                t.span(null, () => i18n("settings.resolvedUserIp") + ":"),
                t.strong(null, () => proxyInfo.isLoading ? "..." : (proxyInfo.realIP || "N/A")),
            ),
            t.div(
                { className: "flex gap-5" },
                t.span(null, () => i18n("settings.detectedProxyHeader") + ":"),
                t.strong(null, () => proxyInfo.isLoading ? "..." : (proxyInfo.possibleProxyHeader || "N/A")),
            ),
        ),
        t.div(
            { className: "content m-b-sm" },
            t.p(
                null,
                () => i18n("settings.proxyDescription"),
            ),
            t.p(
                null,
                () => i18n("settings.proxyDescription2"),
            ),
            t.p({ className: "txt-bold" }, () => i18n("settings.proxySpoofingWarning")),
            t.ul(
                { className: "txt-bold" },
                t.li(
                    null,
                    () => i18n("settings.proxyWarning1"),
                ),
                t.li(null, () => i18n("settings.proxyWarning2")),
            ),
            t.p(null, () => i18n("settings.clearProxyHint")),
        ),
        t.div(
            { className: "grid sm" },
            t.div(
                { className: "col-lg-9" },
                t.div(
                    { className: "fields" },
                    t.div(
                        { className: "field" },
                        t.label({ htmlFor: "trustedProxy.headers" }, () => i18n("settings.trustedIpProxyHeaders")),
                        t.input({
                            type: "text",
                            id: "trustedProxy.headers",
                            name: "trustedProxy.headers",
                            placeholder: () => i18n("settings.leaveEmptyToDisable"),
                            value: () => app.utils.joinNonEmpty(pageData.formSettings.trustedProxy.headers),
                            oninput: (e) => {
                                const newValue = app.utils.splitNonEmpty(e.target.value, ",");
                                const newStr = app.utils.joinNonEmpty(newValue);
                                const oldStr = app.utils.joinNonEmpty(pageData.formSettings.trustedProxy.headers);

                                // has an actual change
                                if (oldStr != newStr) {
                                    pageData.formSettings.trustedProxy.headers = newValue;
                                }
                            },
                        }),
                    ),
                    t.div(
                        { className: "field addon" },
                        t.button(
                            {
                                type: "button",
                                class: () =>
                                    `btn sm secondary transparent ${
                                        app.utils.isEmpty(pageData.formSettings.trustedProxy.headers) ? "hidden" : ""
                                    }`,
                                onclick: () => {
                                    pageData.formSettings.trustedProxy.headers = [];
                                },
                            },
                            t.span({ className: "txt" }, () => i18n("settings.clear")),
                        ),
                    ),
                ),
                t.div(
                    { className: "field-help" },
                    () => i18n("settings.commaSeparatedHeadersHint"),
                    t.div({ className: "inline-flex gap-5" }, () => {
                        return proxyInfo.suggestedProxyHeaders.map((header) => {
                            return t.div({
                                role: "button",
                                className: "label sm link-primary",
                                onclick: () => {
                                    pageData.formSettings.trustedProxy.headers = [header];
                                },
                                textContent: header,
                            });
                        });
                    }),
                ),
            ),
            t.div(
                { className: "col-lg-3" },
                t.div(
                    { className: "field" },
                    t.label(
                        { htmlFor: "trustedProxy.useLeftmostIP" },
                        t.span({ className: "txt" }, () => i18n("settings.ipPriority")),
                        t.i({
                            className: "ri-information-line tooltip-right",
                            ariaDescription: app.attrs.tooltip(
                                () => i18n("settings.ipPriorityHint"),
                            ),
                        }),
                    ),
                    app.components.select({
                        id: "trustedProxy.useLeftmostIP",
                        name: "trustedProxy.useLeftmostIP",
                        options: ipOptions,
                        required: true,
                        value: () => pageData.formSettings.trustedProxy.useLeftmostIP || false,
                        onchange: (selected) => {
                            pageData.formSettings.trustedProxy.useLeftmostIP = selected?.[0]?.value;
                        },
                    }),
                ),
            ),
        ),
    );
}
