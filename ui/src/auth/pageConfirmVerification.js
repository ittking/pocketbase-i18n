import PocketBase, { getTokenPayload } from "pocketbase";

export function pageConfirmVerification(route) {
    const token = route.params?.token || "";
    const tokenPayload = getTokenPayload(token);

    if (!tokenPayload.email || !tokenPayload.collectionId) {
        app.toasts.error(i18n("auth.invalidOrExpiredToken"));
        window.location.hash = "#/";
        return;
    }

    app.store.title = i18n("auth.confirmVerification");

    const data = store({
        isConfirming: false,
        isConfirmSuccess: false,
        // ---
        isResending: false,
        isResendSuccess: false,
    });

    confirm();

    async function confirm() {
        if (data.isConfirming) {
            return;
        }

        data.isConfirming = true;

        // init a custom client to avoid interfering with the superuser state
        const client = new PocketBase(app.pb.baseURL);

        try {
            await client.collection(tokenPayload.collectionId).confirmVerification(token);
            data.isConfirmSuccess = true;
        } catch (err) {
            data.isConfirmSuccess = false;
        }

        data.isConfirming = false;
    }

    async function resend() {
        if (data.isResending) {
            return;
        }

        data.isResending = true;

        // init a custom client to avoid interfering with the superuser state
        const client = new PocketBase(import.meta.env.PB_BACKEND_URL);

        try {
            await client.collection(tokenPayload.collectionId).requestVerification(tokenPayload.email);
            data.isResendSuccess = true;
        } catch (err) {
            app.checkApiError(err);
            data.isResendSuccess = false;
        }

        data.isResending = false;
    }

    return t.div(
        {
            pbEvent: "pageConfirmVerification",
            className: "wrapper sm m-auto p-b-base",
        },
        t.header(
            { className: "txt-center m-b-base" },
            t.img({ className: "main-logo", src: () => app.store.mainLogo, ariaHidden: true, alt: "App logo" }),
            t.h5({ className: "m-t-10" }, () => app.store.title),
        ),
        () => {
            if (data.isConfirming) {
                return t.div(
                    { className: "block txt-center" },
                    t.span({ className: "loader" }, () => i18n("auth.pleaseCheckEmail")),
                );
            }

            if (data.isConfirmSuccess) {
                return t.div(
                    { pbEvent: "confirmVerificationSuccessAlert", className: "alert success txt-center" },
                    t.p(null, () => i18n("auth.successfullyVerified") + " ", t.strong(null, tokenPayload.email), "."),
                );
            }

            if (data.isResendSuccess) {
                return t.div(
                    { pbEvent: "confirmVerificationResendAlert", className: "alert success txt-center" },
                    t.p(null, () => i18n("auth.pleaseCheckEmail")),
                );
            }

            return [
                t.div(
                    { pbEvent: "confirmVerificationErrorAlert", className: "alert danger txt-center m-b-base" },
                    t.p(null, () => i18n("auth.invalidOrExpiredToken")),
                ),
                t.button(
                    {
                        type: "button",
                        className: () => `btn transparent lg block ${data.isResending ? "loading" : ""}`,
                        disabled: () => data.isResending,
                        onclick: () => resend(),
                    },
                    t.span({ className: "txt" }, () => i18n("auth.resend")),
                ),
            ];
        },
    );
}
