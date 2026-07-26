export function openBackupRestoreModal(key) {
    const modal = backupRestoreModal(key);

    document.body.appendChild(modal);

    app.modals.open(modal);
}

function backupRestoreModal(key) {
    const uniqueId = "backup_restore_" + app.utils.randomString();

    const data = store({
        key: key,
        keyConfirm: "",
        isSubmitting: false,
        get canSubmit() {
            return data.key && data.key == data.keyConfirm;
        },
    });

    let reloadTimeoutId;

    async function submit() {
        if (data.isSubmitting || !data.canSubmit) {
            return;
        }

        clearTimeout(reloadTimeoutId);

        data.isSubmitting = true;

        try {
            await app.pb.backups.restore(data.keyConfirm);

            // optimistic restore page reload
            reloadTimeoutId = setTimeout(() => {
                window.location.reload();
                data.isSubmitting = false;
            }, 2000);
        } catch (err) {
            clearTimeout(reloadTimeoutId);

            if (!err?.isAbort) {
                data.isSubmitting = false;
                app.checkApiError(err);
            }
        }
    }

    return t.div(
        {
            pbEvent: "backupRestoreModal",
            className: "modal popup backup-restore-modal",
            onbeforeclose: () => {
                return !data.isSubmitting;
            },
            onafterclose: (el) => {
                el?.remove();
            },
            onunmount: () => {
                clearTimeout(reloadTimeoutId);
            },
        },
        t.header(
            { className: "modal-header" },
            t.h5(
                { className: "m-auto txt-center" },
                () => i18n("settings.restoreBackup") + " ",
                t.strong(null, () => data.key),
            ),
        ),
        t.form(
            {
                id: uniqueId,
                className: "modal-content backup-restore-form",
                autocomplete: "off",
                onsubmit: (e) => {
                    e.preventDefault();
                    submit();
                },
            },
            t.div(
                { className: "grid" },
                t.div(
                    { className: "col-lg-12" },
                    t.div(
                        { className: "alert danger" },
                        t.div(
                            { className: "content" },
                            t.p(
                                { className: "txt-bold" },
                                () => i18n("settings.restoreWarning1"),
                            ),
                            t.p(null, () => i18n("settings.restoreWarning2")),
                            t.p(
                                null,
                                () => i18n("settings.restoreWarning3"),
                            ),
                            t.p(
                                null,
                                () => i18n("settings.restoreWarning4"),
                            ),
                            t.p(
                                null,
                                () => i18n("settings.restoreWarning5"),
                            ),
                            t.p(null, () => i18n("settings.restoreWarning6")),
                            t.ol(
                                null,
                                t.li(
                                    null,
                                    () => i18n("settings.restoreStep1"),
                                ),
                                t.li(null, () => i18n("settings.restoreStep2")),
                                t.li(
                                    null,
                                    () => i18n("settings.restoreStep3"),
                                ),
                                t.li(null, () => i18n("settings.restoreStep4")),
                            ),
                        ),
                    ),
                ),
                t.div(
                    { className: "col-lg-12" },
                    t.div(
                        { className: "confirm-key-label m-b-sm" },
                        () => i18n("settings.typeBackupNameToConfirm"),
                        t.div(
                            { className: "label" },
                            () => data.key,
                            app.components.copyButton(() => data.key),
                        ),
                    ),
                    t.div(
                        { className: "field" },
                        t.label({ htmlFor: uniqueId + "_key" }, () => i18n("settings.backupName")),
                        t.input({
                            id: uniqueId + "_key",
                            name: "key",
                            type: "text",
                            required: true,
                            value: () => data.keyConfirm,
                            oninput: (e) => (data.keyConfirm = e.target.value),
                        }),
                    ),
                ),
            ),
        ),
        t.footer(
            { className: "modal-footer" },
            t.button(
                {
                    type: "button",
                    className: "btn transparent m-r-auto",
                    onclick: () => app.modals.close(),
                    disabled: () => data.isSubmitting,
                },
                t.span({ className: "txt" }, () => i18n("common.cancel")),
            ),
            t.button(
                {
                    "html-form": uniqueId,
                    type: "submit",
                    className: () => `btn ${data.isSubmitting ? "loading" : ""}`,
                    disabled: () => data.isSubmitting || !data.canSubmit,
                },
                t.span({ className: "txt" }, () => i18n("settings.backupRestore")),
            ),
        ),
    );
}
