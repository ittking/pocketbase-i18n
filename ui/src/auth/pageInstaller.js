import { getTokenPayload, isTokenExpired } from "pocketbase";

export function pageInstaller(route) {
    const token = route.params?.token || "";
    const tokenPayload = getTokenPayload(token);

    if (tokenPayload.type != "auth" || isTokenExpired(token)) {
        app.toasts.error(i18n("auth.invalidOrExpiredToken"));
        window.location.hash = "#/";
        return;
    }

    app.store.title = i18n("auth.setupPocketBase");

    const data = store({
        email: "",
        password: "",
        passwordConfirm: "",
        showPassword: false,
        showPasswordConfirm: false,
        isSubmitting: false,
        isUploading: false,
        get isBusy() {
            return data.isSubmitting || data.isUploading;
        },
    });

    async function submit() {
        if (data.isBusy) {
            return;
        }

        data.isSubmitting = true;

        try {
            await app.pb.collection("_superusers").create(
                {
                    email: data.email,
                    password: data.password,
                    passwordConfirm: data.passwordConfirm,
                },
                {
                    headers: { Authorization: token },
                },
            );

            await app.pb.collection("_superusers").authWithPassword(data.email, data.password);

            window.location.hash = "#/";
        } catch (err) {
            app.checkApiError(err);
        }

        data.isSubmitting = false;
    }

    const fileInputId = "backupFileInput";

    function resetSelectedBackupFile() {
        const input = document.getElementById(fileInputId);
        if (input) {
            input.value = "";
        }
    }

    function uploadBackupConfirm(file) {
        if (!file) {
            return;
        }

        app.modals.confirm(
            t.h6(
                null,
                `Note that we don't perform validations for the uploaded backup files. Proceed with caution and only if you trust the file source.\n\n`
                    + `Do you really want to upload and initialize "${file.name}"?`,
            ),
            () => {
                uploadBackup(file);
            },
            () => {
                resetSelectedBackupFile();
            },
        );
    }

    async function uploadBackup(file) {
        if (!file || data.isBusy) {
            return;
        }

        data.isUploading = true;

        try {
            await app.pb.backups.upload(
                { file: file },
                {
                    headers: { Authorization: token },
                },
            );

            await app.pb.backups.restore(file.name, {
                headers: { Authorization: token },
            });

            app.toasts.info(i18n("auth.pleaseCheckEmail"));

            // optimistic restore completion
            await new Promise((r) => setTimeout(r, 3000));

            window.location.href = "#/";
        } catch (err) {
            app.checkApiError(err);
        }

        resetSelectedBackupFile();

        data.isUploading = false;
    }

    return t.div(
        {
            pbEvent: "pageInstaller",
            className: "wrapper sm m-auto p-b-base",
        },
        t.header(
            { className: "txt-center m-b-base" },
            t.img({ className: "main-logo", src: () => app.store.mainLogo, ariaHidden: true, alt: "App logo" }),
            t.h5({ className: "m-t-10" }, () => app.store.title),
        ),
        t.form(
            {
                pbEvent: "installerForm",
                className: "grid installer-form",
                onsubmit: (e) => {
                    e.preventDefault();
                    submit(data);
                },
            },
            t.div({ className: "col-12 txt-center" }, () => i18n("auth.createFirstSuperuser") + ":"),
            t.div(
                { className: "col-12" },
                t.div(
                    { className: "field" },
                    t.label({ htmlFor: "superuser_email" }, () => i18n("auth.email")),
                    t.input({
                        id: "superuser_email",
                        name: "email",
                        type: "email",
                        required: true,
                        autofocus: true,
                        autocomplete: "off",
                        disabled: () => data.isBusy,
                        value: () => data.email,
                        oninput: (e) => (data.email = e.target.value),
                    }),
                ),
            ),
            t.div(
                { className: "col-12" },
                t.div(
                    { className: "fields" },
                    t.div(
                        { className: "field" },
                        t.label({ htmlFor: "superuser_password" }, () => i18n("auth.password")),
                        t.input({
                            id: "superuser_password",
                            name: "password",
                            min: 10,
                            required: true,
                            disabled: () => data.isBusy,
                            type: () => (data.showPassword ? "text" : "password"),
                            value: () => data.password,
                            oninput: (e) => (data.password = e.target.value),
                        }),
                    ),
                    t.div(
                        { className: "field addon" },
                        t.button(
                            {
                                type: "button",
                                tabIndex: -1,
                                className: "btn sm transparent secondary circle tooltip-right",
                                ariaLabel: app.attrs.tooltip(() =>
                                    data.showPassword ? i18n("auth.hidePassword") : i18n("auth.showPassword")
                                ),
                                onclick: () => (data.showPassword = !data.showPassword),
                            },
                            t.i({
                                className: () => (data.showPassword ? "ri-eye-off-line" : "ri-eye-line"),
                                ariaHidden: true,
                            }),
                        ),
                    ),
                ),
                t.div({ className: "field-help" }, () => i18n("auth.password") + " (10+ characters)"),
            ),
            t.div(
                { className: "col-12" },
                t.div(
                    { className: "fields" },
                    t.div(
                        { className: "field" },
                        t.label({ htmlFor: "superuser_password_confirm" }, () => i18n("auth.passwordConfirm")),
                        t.input({
                            id: "superuser_password_confirm",
                            name: "passwordConfirm",
                            required: true,
                            disabled: () => data.isBusy,
                            type: () => (data.showPasswordConfirm ? "text" : "password"),
                            value: () => data.passwordConfirm,
                            oninput: (e) => (data.passwordConfirm = e.target.value),
                        }),
                    ),
                    t.div(
                        { className: "field addon" },
                        t.button(
                            {
                                type: "button",
                                tabIndex: -1,
                                className: "btn sm transparent secondary circle tooltip-right",
                                ariaLabel: app.attrs.tooltip(() =>
                                    data.showPasswordConfirm ? i18n("auth.hidePassword") : i18n("auth.showPassword")
                                ),
                                onclick: () => (data.showPasswordConfirm = !data.showPasswordConfirm),
                            },
                            t.i({
                                className: () => (data.showPasswordConfirm ? "ri-eye-off-line" : "ri-eye-line"),
                                ariaHidden: true,
                            }),
                        ),
                    ),
                ),
            ),
            t.div(
                { className: "col-12" },
                t.button(
                    {
                        className: () => `btn lg next block ${data.isSubmitting ? "loading" : ""}`,
                        disabled: () => data.isBusy,
                    },
                    t.span({ className: "txt" }, () => i18n("auth.createSuperuserAndLogin")),
                    t.i({ className: "ri-arrow-right-line", ariaHidden: true }),
                ),
            ),
        ),
        t.hr(),
        t.label(
            {
                htmlFor: fileInputId,
                className: () =>
                    `btn secondary transparent lg block ${data.isBusy ? "disabled" : ""} ${
                        data.isUploading ? "loading" : ""
                    }`,
            },
            t.i({ className: "ri-upload-cloud-line", ariaHidden: true }),
            t.span({ className: "txt" }, () => i18n("auth.orInitializeFromBackup")),
        ),
        t.input({
            id: fileInputId,
            type: "file",
            className: "hidden",
            accept: ".zip",
            onchange: (e) => {
                uploadBackupConfirm(e.target?.files?.[0]);
            },
        }),
    );
}
