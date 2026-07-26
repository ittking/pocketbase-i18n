import { settingsSidebar } from "../settingsSidebar";

export function pageStorageSettings() {
    app.store.title = i18n("settings.fileStorage");

    const data = store({
        isLoading: false,
        isSaving: false,
        formSettings: null,
        initSerialized: "null",
        originalFormSettings: null,
        get hasChanges() {
            return data.initSerialized != JSON.stringify(data.formSettings);
        },
    });

    loadSettings();

    async function loadSettings() {
        data.isLoading = true;

        try {
            init(await app.pb.settings.getAll());

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
            s3: settings?.s3 || {},
        };

        data.initSerialized = JSON.stringify(data.formSettings);
        data.originalFormSettings = JSON.parse(data.initSerialized);
    }

    function reset() {
        data.formSettings = JSON.parse(data.initSerialized);
    }

    return t.div(
        {
            pbEvent: "pageStorageSettings",
            className: "page page-storage-settings",
        },
        settingsSidebar(),
        t.div(
            { className: "page-content full-height" },
            t.header(
                { className: "page-header" },
                t.nav(
                    { className: "breadcrumbs" },
                    t.div({ className: "breadcrumb-item" }, () => i18n("settings.fileStorage")),
                    t.div({ className: "breadcrumb-item" }, () => i18n("settings.fileStorage")),
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
                            pbEvent: "storageSettingsForm",
                            className: "grid storage-settings-form",
                            inert: () => data.isSaving,
                            onsubmit: (e) => {
                                e.preventDefault();
                                save();
                            },
                        },
                        t.div(
                            { className: "col-lg-12 txt-lg" },
                            t.p(
                                null,
                                () => i18n("settings.fileStorageDescription"),
                            ),
                        ),
                        t.div(
                            { className: "col-lg-12" },
                            app.components.s3ConfigFields({
                                config: () => data.formSettings.s3,
                                before: () => {
                                    const originalEnabled = data.originalFormSettings.s3?.enabled;

                                    if (originalEnabled == data.formSettings.s3?.enabled) {
                                        return;
                                    }

                                    return t.div(
                                        { className: "alert info m-t-sm" },
                                        () => i18n("settings.migrateFilesManually"),
                                        t.strong(
                                            null,
                                            originalEnabled ? i18n("settings.s3") : i18n("settings.localFileSystem"),
                                        ),
                                        () => i18n("settings.migrateFilesManually"),
                                        t.strong(
                                            null,
                                            data.formSettings.s3?.enabled
                                                ? i18n("settings.s3")
                                                : i18n("settings.localFileSystem"),
                                        ),
                                        () => i18n("settings.migrateFilesManually"),
                                        t.a({
                                            href: "https://github.com/rclone/rclone",
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            className: "txt-bold",
                                            textContent: "rclone",
                                        }),
                                        ", ",
                                        t.a({
                                            href: "https://github.com/peak/s5cmd",
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            className: "txt-bold",
                                            textContent: "s5cmd",
                                        }),
                                        ", etc.",
                                    );
                                },
                            }),
                        ),
                        t.div({ className: "col-lg-12" }, t.hr()),
                        t.div(
                            { className: "col-lg-12" },
                            t.div(
                                { className: "flex" },
                                t.div({ className: "m-r-auto" }),
                                t.button(
                                    {
                                        hidden: () => !data.hasChanges,
                                        type: "button",
                                        className: "btn transparent secondary",
                                        onclick: reset,
                                    },
                                    t.span({ className: "txt" }, () => i18n("common.cancel")),
                                ),
                                t.button(
                                    {
                                        className: () => `btn expanded-lg ${data.isSaving ? "loading" : ""}`,
                                        disabled: () => !data.hasChanges || data.isSaving,
                                    },
                                    t.span({ className: "txt" }, () => i18n("settings.saveChanges")),
                                ),
                            ),
                        ),
                    );
                },
            ),
            t.footer({ className: "page-footer" }, app.components.credits()),
        ),
    );
}
