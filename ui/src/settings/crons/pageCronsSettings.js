import { settingsSidebar } from "../settingsSidebar";
import { cronsList } from "./cronsList";

export function pageCronsSettings(route) {
    app.store.title = i18n("settings.crons");

    const data = store({
        resetList: null,
    });

    function resetCronsList() {
        data.resetList = Date.now();
    }

    return t.div(
        { pbEvent: "pageCronsSettings", className: "page" },
        settingsSidebar(),
        t.div(
            { className: "page-content full-height" },
            t.header(
                { className: "page-header" },
                t.nav(
                    { className: "breadcrumbs" },
                    t.div({ className: "breadcrumb-item" }, () => i18n("settings.crons")),
                    t.div({ className: "breadcrumb-item" }, () => i18n("settings.crons")),
                ),
            ),
            t.div(
                { className: "wrapper m-b-base" },
                t.div(
                    { className: "flex gap-10 m-b-sm" },
                    t.div({ className: "txt-lg" }, () => i18n("settings.registeredAppCronJobs")),
                    app.components.refreshButton({
                        className: "btn sm transparent secondary circle",
                        onclick: resetCronsList,
                    }),
                ),
                cronsList({
                    reset: () => data.resetList,
                }),
                t.div(
                    { className: "txt-sm txt-hint m-t-sm" },
                    () => i18n("settings.cronsDescription"),
                    t.a({
                        href: `${import.meta.env.PB_DOCS_URL}/go-jobs-scheduling/`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        textContent: "Go",
                    }),
                    " or ",
                    t.a({
                        href: `${import.meta.env.PB_DOCS_URL}/js-jobs-scheduling/`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        textContent: "JavaScript",
                    }),
                    ".",
                ),
            ),
            t.footer({ className: "page-footer" }, app.components.credits()),
        ),
    );
}
