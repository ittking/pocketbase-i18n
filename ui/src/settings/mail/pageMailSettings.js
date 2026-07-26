import { settingsSidebar } from "../settingsSidebar";

export function pageMailSettings(route) {
    app.store.title = i18n("settings.mailSettings");

    const tlsOptions = [
        { label: () => i18n("settings.autoStarttls"), value: false },
        { label: () => i18n("settings.always"), value: true },
    ];

    const authMethods = [
        { label: () => i18n("settings.plainDefault"), value: "PLAIN" },
        { label: () => i18n("settings.login"), value: "LOGIN" },
    ];

    const data = store({
        isLoading: false,
        isSaving: false,
        formSettings: null,
        initSerialized: "null",
        showMoreOptions: false,
        get hasChanges() {
            return data.initSerialized != JSON.stringify(data.formSettings);
        },
    });

    loadSettings();

    async function loadSettings() {
        data.isLoading = true;

        try {
            const settings = await app.pb.settings.getAll();
            init(settings);

            data.isLoading = false;
        } catch (err) {
            if (!err.isAbort) {
                app.checkApiError(err);
                // data.isLoading = false; don't reset in case of a server error
            }
        }
    }

    async function save() {
        if (data.isSaving || !data.hasChanges) {
            return;
        }

        data.isSaving = true;

        try {
            const redacted = app.utils.filterRedactedProps(data.formSettings);
            const settings = await app.pb.settings.update(redacted);
            init(settings);

            app.toasts.success(() => i18n("settings.success"));
        } catch (err) {
            app.checkApiError(err);
        }

        data.isSaving = false;
    }

    function init(settings = {}) {
        // refresh local app settings
        app.store.settings = JSON.parse(JSON.stringify(settings));

        data.formSettings = {
            meta: settings?.meta || {},
            smtp: settings?.smtp || {},
        };

        if (!data.formSettings.smtp.authMethod) {
            data.formSettings.smtp.authMethod = authMethods[0].value;
        }

        data.initSerialized = JSON.stringify(data.formSettings);
    }

    function reset() {
        data.formSettings = JSON.parse(data.initSerialized);
    }

    return t.div(
        { pbEvent: "pageMailSettings", className: "page page-mail-settings" },
        settingsSidebar(),
        t.div(
            { className: "page-content full-height" },
            t.header(
                { className: "page-header" },
                t.nav(
                    { className: "breadcrumbs" },
                    t.div({ className: "breadcrumb-item" }, () => i18n("settings.mailSettings")),
                    t.div({ className: "breadcrumb-item" }, () => i18n("settings.mailSettings")),
                ),
            ),
            t.div(
                { className: "wrapper m-b-base" },
                () => {
                    if (data.isLoading) {
                        return t.div({ className: "block txt-center" }, t.span({ className: "loader lg" }));
                    }

                    return t.form(
                        {
                            pbEvent: "mailSettingsForm",
                            className: "grid mail-settings-form",
                            inert: () => data.isSaving,
                            onsubmit: (e) => {
                                e.preventDefault();
                                save();
                            },
                        },
                        t.div(
                            { className: "col-lg-12 txt-lg" },
                            t.p(null, () => i18n("settings.mailSettingsDescription")),
                        ),
                        t.div(
                            { className: "col-lg-6" },
                            t.div(
                                { className: "field" },
                                t.label({ htmlFor: "meta.senderName" }, () => i18n("settings.senderName")),
                                t.input({
                                    id: "meta.senderName",
                                    name: "meta.senderName",
                                    type: "text",
                                    required: true,
                                    value: () => data.formSettings.meta.senderName || "",
                                    oninput: (e) => (data.formSettings.meta.senderName = e.target.value),
                                }),
                            ),
                        ),
                        t.div(
                            { className: "col-lg-6" },
                            t.div(
                                { className: "field" },
                                t.label({ htmlFor: "meta.senderAddress" }, () => i18n("settings.senderAddress")),
                                t.input({
                                    id: "meta.senderAddress",
                                    name: "meta.senderAddress",
                                    type: "email",
                                    required: true,
                                    value: () => data.formSettings.meta.senderAddress || "",
                                    oninput: (e) => (data.formSettings.meta.senderAddress = e.target.value),
                                }),
                            ),
                        ),
                        t.div(
                            { className: "col-lg-12" },
                            t.div(
                                { className: "field" },
                                t.input({
                                    id: "smtp.enabled",
                                    name: "smtp.enabled",
                                    type: "checkbox",
                                    className: "switch",
                                    checked: () => !!data.formSettings.smtp.enabled,
                                    onchange: (e) => (data.formSettings.smtp.enabled = e.target.checked),
                                }),
                                t.label(
                                    { htmlFor: "smtp.enabled" },
                                    t.span(
                                        { className: "txt" },
                                        () => i18n("settings.useSmtpMailServer"),
                                        t.strong(null, () => i18n("settings.recommended")),
                                    ),
                                    t.i({
                                        className: "ri-information-line link-faded",
                                        ariaDescription: app.attrs.tooltip(
                                            () => i18n("settings.useSmtpMailServer"),
                                        ),
                                    }),
                                ),
                            ),
                            // SMTP
                            app.components.slide(
                                () => data.formSettings.smtp.enabled,
                                t.div(
                                    { className: "grid m-t-sm" },
                                    t.div(
                                        { className: "col-lg-4" },
                                        t.div(
                                            { className: "field" },
                                            t.label({ htmlFor: "smtp.host" }, () => i18n("settings.smtpServerHost")),
                                            t.input({
                                                id: "smtp.host",
                                                name: "smtp.host",
                                                type: "text",
                                                required: () => data.formSettings.smtp.enabled,
                                                value: () => data.formSettings.smtp.host || "",
                                                oninput: (e) => data.formSettings.smtp.host = e.target.value,
                                            }),
                                        ),
                                    ),
                                    t.div(
                                        { className: "col-lg-2" },
                                        t.div(
                                            { className: "field" },
                                            t.label({ htmlFor: "smtp.port" }, () => i18n("settings.port")),
                                            t.input({
                                                id: "smtp.port",
                                                name: "smtp.port",
                                                type: "number",
                                                min: 0,
                                                step: 1,
                                                required: () => data.formSettings.smtp.enabled,
                                                value: () => data.formSettings.smtp.port || "",
                                                oninput: (e) =>
                                                    data.formSettings.smtp.port = parseInt(e.target.value, 10),
                                            }),
                                        ),
                                    ),
                                    t.div(
                                        { className: "col-lg-3" },
                                        t.div(
                                            { className: "field" },
                                            t.label({ htmlFor: "smtp.username" }, () => i18n("settings.username")),
                                            t.input({
                                                id: "smtp.username",
                                                name: "smtp.username",
                                                type: "text",
                                                autocomplete: "off",
                                                value: () => data.formSettings.smtp.username || "",
                                                oninput: (e) => data.formSettings.smtp.username = e.target.value,
                                            }),
                                        ),
                                    ),
                                    t.div(
                                        { className: "col-lg-3" },
                                        t.div(
                                            { className: "field" },
                                            t.label({ htmlFor: "smtp.password" }, () => i18n("settings.password")),
                                            t.input({
                                                id: "smtp.password",
                                                name: "smtp.password",
                                                type: "password",
                                                autocomplete: "new-password",
                                                value: () => data.formSettings.smtp.password || "",
                                                oninput: (e) => data.formSettings.smtp.password = e.target.value,
                                                onkeyup: (e) => {
                                                    if (
                                                        e.key == "Backspace"
                                                        && typeof data.formSettings.smtp.password === "undefined"
                                                    ) {
                                                        data.formSettings.smtp.password = "";
                                                    }
                                                },
                                                placeholder: () =>
                                                    typeof data.formSettings.smtp.password !== "undefined"
                                                        ? ""
                                                        : "* * * * * *",
                                            }),
                                        ),
                                    ),
                                ),
                                // additional options
                                t.button(
                                    {
                                        type: "button",
                                        className: "btn secondary sm m-t-sm",
                                        onclick: () => data.showMoreOptions = !data.showMoreOptions,
                                    },
                                    t.span(
                                        { className: "txt" },
                                        () =>
                                            data.showMoreOptions
                                                ? i18n("settings.hideMoreOptions")
                                                : i18n("settings.showMoreOptions"),
                                    ),
                                    t.i({
                                        className: () =>
                                            data.showMoreOptions ? "ri-arrow-drop-up-line" : "ri-arrow-drop-down-line",
                                    }),
                                ),
                                app.components.slide(
                                    () => data.showMoreOptions,
                                    t.div(
                                        { className: "grid m-t-sm" },
                                        t.div(
                                            { className: "col-lg-3" },
                                            t.div(
                                                { className: "field" },
                                                t.label({ htmlFor: "smtp.tls" }, () => i18n("settings.tlsEncryption")),
                                                app.components.select({
                                                    id: "smtp.tls",
                                                    name: "smtp.tls",
                                                    required: true,
                                                    options: tlsOptions,
                                                    value: () => data.formSettings.smtp.tls || false,
                                                    onchange: (selected) => {
                                                        data.formSettings.smtp.tls = selected?.[0]?.value;
                                                    },
                                                }),
                                            ),
                                        ),
                                        t.div(
                                            { className: "col-lg-3" },
                                            t.div(
                                                { className: "field" },
                                                t.label(
                                                    { htmlFor: "smtp.authMethod" },
                                                    () => i18n("settings.authMethod"),
                                                ),
                                                app.components.select({
                                                    id: "smtp.authMethod",
                                                    name: "smtp.authMethod",
                                                    required: true,
                                                    options: authMethods,
                                                    value: () =>
                                                        data.formSettings.smtp.authMethod || authMethods[0].value,
                                                    onchange: (selected) => {
                                                        data.formSettings.smtp.authMethod = selected?.[0]?.value;
                                                    },
                                                }),
                                            ),
                                        ),
                                        t.div(
                                            { className: "col-lg-6" },
                                            t.div(
                                                { className: "field" },
                                                t.label(
                                                    { htmlFor: "smtp.localName" },
                                                    t.span({ className: "txt" }, () => i18n("settings.ehloDomain")),
                                                    t.i({
                                                        className: "ri-information-line link-hint tooltip-top",
                                                        ariaDescription: app.attrs.tooltip(
                                                            () => i18n("settings.ehloDomain"),
                                                        ),
                                                    }),
                                                ),
                                                t.input({
                                                    id: "smtp.localName",
                                                    name: "smtp.localName",
                                                    type: "text",
                                                    placeholder: () => i18n("settings.defaultToLocalhost"),
                                                    value: () => data.formSettings.smtp.localName || "",
                                                    oninput: (e) => data.formSettings.smtp.localName = e.target.value,
                                                }),
                                            ),
                                        ),
                                    ),
                                ),
                            ),
                        ),
                        t.div({ className: "col-lg-12" }, t.hr()),
                        t.div(
                            { className: "col-lg-12" },
                            t.div(
                                { className: "flex" },
                                t.div({ className: "m-r-auto" }),
                                () => {
                                    if (data.hasChanges) {
                                        return [
                                            t.button(
                                                {
                                                    type: "button",
                                                    className: "btn transparent secondary",
                                                    onclick: reset,
                                                },
                                                t.span({ className: "txt" }, () => i18n("common.cancel")),
                                            ),
                                            t.button(
                                                {
                                                    className: () =>
                                                        `btn expanded-lg ${data.isSaving ? "loading" : ""}`,
                                                    disabled: () => !data.hasChanges || data.isSaving,
                                                },
                                                t.span({ className: "txt" }, () => i18n("settings.saveChanges")),
                                            ),
                                        ];
                                    }

                                    return t.button(
                                        {
                                            type: "button",
                                            className: () => `btn expanded-lg outline`,
                                            onclick: () => app.modals.openMailTest(),
                                        },
                                        t.i({ className: "ri-mail-check-line", ariaHidden: true }),
                                        t.span({ className: "txt" }, () => i18n("settings.sendTestEmail")),
                                    );
                                },
                            ),
                        ),
                    );
                },
            ),
            t.footer({ className: "page-footer" }, app.components.credits()),
        ),
    );
}
