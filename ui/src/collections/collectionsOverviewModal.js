window.app = window.app || {};
window.app.modals = window.app.modals || {};

window.app.modals.openCollectionsOverview = function(settings = {
    onbeforeopen: null,
    onafteropen: null,
    onbeforeclose: null,
    onafterclose: null,
}) {
    const modal = collectionsOverviewModal(settings);
    if (!modal) {
        return;
    }

    document.body.appendChild(modal);
    app.modals.open(modal);
};

function collectionsOverviewModal(settings = {}) {
    const uniqueId = "overview_modal_" + app.utils.randomString();

    const tabs = {
        fieldsAndRelations: { label: () => i18n("records.fieldsAndRelations"), panel: erd },
        rules: { label: () => i18n("records.rules"), panel: rules },
    };

    const data = store({
        showSystemCollections: false,
        activeTab: Object.keys(tabs)[0],
        get collections() {
            if (data.showSystemCollections) {
                return app.store.collections;
            }

            return app.store.collections.filter((c) => !c.system);
        },
    });

    const modal = t.div(
        {
            pbEvent: "collectionsOverviewModal",
            className: "modal popup collections-overview-modal",
            onbeforeopen: (el) => {
                return settings.onbeforeopen?.(el);
            },
            onafteropen: (el) => {
                settings.onafteropen?.(el);
            },
            onbeforeclose: (el) => {
                return settings.onbeforeclose?.(el);
            },
            onafterclose: (el) => {
                settings.onafterclose?.(el);
                el?.remove();
            },
        },
        t.header(
            { className: "modal-header isolated" },
            t.div(
                { className: "grid sm" },
                t.div(
                    { className: "col-12" },
                    t.div(
                        { className: "flex" },
                        t.h6({ className: "modal-title" }, () => i18n("collections.collectionsOverview")),
                        t.div({ className: "flex-fill" }),
                        t.div(
                            { className: "field" },
                            t.input({
                                id: uniqueId + ".showSystemCollections",
                                type: "checkbox",
                                className: "sm switch",
                                checked: () => data.showSystemCollections,
                                onchange: (e) => data.showSystemCollections = e.target.checked,
                            }),
                            t.label(
                                { htmlFor: uniqueId + ".showSystemCollections" },
                                () => i18n("collections.systemCollections"),
                            ),
                        ),
                        t.button(
                            {
                                type: "button",
                                className: "btn sm secondary transparent circle modal-close-btn",
                                title: () => i18n("common.close"),
                                onclick: () => app.modals.close(modal),
                            },
                            t.i({ className: "ri-close-line", ariaHidden: true }),
                        ),
                    ),
                ),
                t.div(
                    { className: "col-12" },
                    t.div(
                        { className: "tabs-header equal-width" },
                        () => {
                            const items = [];

                            for (let key in tabs) {
                                items.push(t.button({
                                    type: "button",
                                    className: () => `tab-item ${data.activeTab == key ? "active" : ""}`,
                                    onclick: () => data.activeTab = key,
                                    textContent: tabs[key].label(),
                                }));
                            }

                            return items;
                        },
                    ),
                ),
            ),
        ),
        () => {
            return tabs[data.activeTab]?.panel(data);
        },
    );

    return modal;
}

function erd(data) {
    return t.div(
        { className: "modal-content erd-tab" },
        app.components.erd({
            collections: () => {
                let underscoreA, underscoreB;
                function sortSystemUnderscoredLast(a, b) {
                    underscoreA = a.name.startsWith("_");
                    underscoreB = b.name.startsWith("_");
                    if (
                        (a.system && !b.system)
                        || (underscoreA && !underscoreB)
                    ) {
                        return 1;
                    }

                    if (
                        (!a.system && b.system)
                        || (!underscoreA && underscoreB)
                    ) {
                        return -1;
                    }

                    return 0;
                }

                return data.collections.slice().sort(sortSystemUnderscoredLast);
            },
        }),
    );
}

function rules(data) {
    const ruleOptions = [
        { value: "listRule", label: () => i18n("records.listSearchRule") },
        { value: "viewRule", label: () => i18n("records.viewRule") },
        { value: "createRule", label: () => i18n("records.createRule"), filter: (c) => c.type != "view" },
        { value: "updateRule", label: () => i18n("records.updateRule"), filter: (c) => c.type != "view" },
        { value: "deleteRule", label: () => i18n("records.deleteRule"), filter: (c) => c.type != "view" },
        { value: "authRule", label: () => i18n("records.authRule"), filter: (c) => c.type == "auth" },
        { value: "manageRule", label: () => i18n("records.manageRule"), filter: (c) => c.type == "auth" },
        {
            value: "mfaRule",
            label: () => i18n("collections.mfaRule"),
            emptyLabel: t.span({ className: "label info" }, () => i18n("records.no")),
            rule: (c) => c.mfa?.rule,
            filter: (c) => c.mfa?.enabled && c.type == "auth",
        },
    ];

    const local = store({
        activeRuleOption: ruleOptions[0],
        get activeCollections() {
            if (!local.activeRuleOption.filter) {
                return data.collections;
            }

            return data.collections.filter((c) => local.activeRuleOption.filter(c));
        },
    });

    return t.div(
        { className: "modal-content rules-tab" },
        t.table(
            { className: "rules-table" },
            t.thead(
                { className: "sticky" },
                t.tr(
                    null,
                    t.td(
                        { colSpan: 99, className: "col-rule-btns" },
                        t.div(
                            { className: "rule-btns" },
                            () => {
                                return ruleOptions.map((opt) => {
                                    return t.button({
                                        type: "button",
                                        className: () =>
                                            `btn sm ${
                                                local.activeRuleOption?.value == opt.value
                                                    ? "outline"
                                                    : "transparent secondary"
                                            }`,
                                        textContent: () => opt.label(),
                                        onclick: () => local.activeRuleOption = opt,
                                    });
                                });
                            },
                        ),
                    ),
                ),
            ),
            t.tbody(
                null,
                () => {
                    if (!local.activeCollections.length) {
                        return t.tr(
                            null,
                            t.td(
                                { colSpan: 99, className: "txt-hint" },
                                t.p(null, () => i18n("records.noCollectionsWithRule")),
                            ),
                        );
                    }

                    return local.activeCollections.map((collection) => {
                        return t.tr(
                            null,
                            t.th(
                                { className: "min-width" },
                                t.div(
                                    { className: "inline-flex gap-10" },
                                    t.i({
                                        ariaHidden: true,
                                        className: () =>
                                            app.collectionTypes[collection.type]?.icon
                                            || app.utils.fallbackCollectionIcon,
                                    }),
                                    t.span({
                                        className: "txt collection-name",
                                        title: () => collection.name,
                                        textContent: () => collection.name,
                                    }),
                                ),
                            ),
                            () => {
                                let rule;
                                if (local.activeRuleOption.rule) {
                                    rule = local.activeRuleOption.rule(collection);
                                } else {
                                    rule = collection[local.activeRuleOption.value];
                                }

                                return t.td(
                                    { style: "vertical-align: top" },
                                    () => {
                                        if (rule === null) {
                                            if (local.activeRuleOption.nullLabel) {
                                                return local.activeRuleOption.nullLabel;
                                            }

                                            return t.span(
                                                { className: "label success" },
                                                () => i18n("collections.superusersOnly"),
                                            );
                                        }

                                        if (rule === "") {
                                            if (local.activeRuleOption.emptyLabel) {
                                                return local.activeRuleOption.emptyLabel;
                                            }

                                            return t.span(
                                                { className: "label info" },
                                                () => i18n("collections.public"),
                                            );
                                        }

                                        return app.components.codeBlock({
                                            language: "pbrule",
                                            value: rule,
                                        });
                                    },
                                );
                            },
                        );
                    });
                },
            ),
        ),
    );
}
