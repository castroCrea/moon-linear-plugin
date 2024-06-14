"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const moon_1 = require("@moonjot/moon");
const moon_utils_1 = require("@moonjot/moon-utils");
const template_1 = require("./template");
const linear_1 = require("./linear");
const ENDPOINT = {
    endpoint: 'auth/linear',
    callback: ({ url, saveSettings, doNotification }) => {
        var _a;
        const queries = (_a = url.split('?').pop()) === null || _a === void 0 ? void 0 : _a.split('&').reduce((acc, query) => {
            const queryString = query.split('=');
            const key = queryString[0];
            const value = queryString[1];
            if (!key || !value)
                return acc;
            return Object.assign(Object.assign({}, acc), { [key]: value });
        }, {});
        if (!(queries === null || queries === void 0 ? void 0 : queries.token))
            return;
        (0, linear_1.getTeams)({ token: queries.token }).then(teams => {
            var _a;
            const teamId = (_a = teams.nodes) === null || _a === void 0 ? void 0 : _a[0].id;
            if (teamId)
                saveSettings({ key: 'defaultTeamId', value: teamId });
        }).catch(() => {
            doNotification({ body: 'Error on fetch Liner Teams', width: 400 });
        });
        saveSettings({ key: 'token', value: queries.token });
        doNotification({ body: 'Linear settings as been saved', width: 400 });
    }
};
class default_1 extends moon_1.MoonPlugin {
    // https://linear.app/oauth/authorize?client_id=11672c0b84224c2a2a5fb10d7e3898a1&redirect_uri=http://localhost:3000/auth/linear&response_type=code&scope=read,write
    constructor(props) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(props);
        this.name = 'Linear';
        this.logo = 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/82d07241-84b3-4cdf-33b5-a09b8d169300/f=auto,q=95,fit=scale-down,metadata=none';
        this.settingsDescription = {
            token: {
                type: 'string',
                required: true,
                label: 'Token',
                description: 'Linear API token.'
            },
            defaultTeamId: {
                type: 'string',
                required: true,
                label: 'Default Team Id',
                description: 'Default team to use.'
            },
            template: {
                type: 'text',
                required: true,
                label: 'Template of capture',
                description: 'Format your note result inside Linear. [Documentation](https://github.com/castroCrea/moon-linear-plugin/blob/main/README.md)',
                default: template_1.DEFAULT_TEMPLATE
            }
        };
        this.settings = {
            token: '',
            defaultTeamId: '',
            template: template_1.DEFAULT_TEMPLATE
        };
        this.endpointCallbacks = [ENDPOINT];
        this.integration = {
            callback: ({ context, markdown }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15;
                if (!this.settings.defaultTeamId)
                    return false;
                const handleDateContent = (0, moon_utils_1.turnDate)({ content: this.settings.template });
                const searchObj = Object.assign({ content: markdown }, context);
                const handlePropertiesContent = (_a = (0, moon_utils_1.handleReplacingProperties)({ content: handleDateContent, searchObj })) !== null && _a !== void 0 ? _a : '';
                let handleConditionContent = (_c = (_b = (0, moon_utils_1.handleConditions)({ content: handlePropertiesContent, searchObj })) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                const titleFromMarkdown = (0, moon_utils_1.extractTitleFromMarkdown)(handleConditionContent);
                if (titleFromMarkdown)
                    handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n');
                const title = (_d = titleFromMarkdown !== null && titleFromMarkdown !== void 0 ? titleFromMarkdown : handleConditionContent.split('\n')[0]) !== null && _d !== void 0 ? _d : context.source.title;
                const getTeamId = () => __awaiter(this, void 0, void 0, function* () {
                    var _16, _17, _18, _19, _20, _21, _22;
                    if ((_18 = (_17 = (_16 = context.pluginPlayground) === null || _16 === void 0 ? void 0 : _16.linear) === null || _17 === void 0 ? void 0 : _17.teams) === null || _18 === void 0 ? void 0 : _18.value) {
                        return (_21 = (_20 = (_19 = context.pluginPlayground) === null || _19 === void 0 ? void 0 : _19.linear) === null || _20 === void 0 ? void 0 : _20.teams) === null || _21 === void 0 ? void 0 : _21.value[0];
                    }
                    else {
                        const teams = yield (0, linear_1.getTeams)({ token: this.settings.token });
                        const team = (_22 = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _22 === void 0 ? void 0 : _22[0];
                        this.teamId = team === null || team === void 0 ? void 0 : team.id;
                        return team === null || team === void 0 ? void 0 : team.id;
                    }
                });
                const teamId = yield getTeamId();
                if (!teamId)
                    return false;
                const payload = {
                    title,
                    description: handleConditionContent,
                    teamId
                };
                if ((_g = (_f = (_e = context.pluginPlayground) === null || _e === void 0 ? void 0 : _e.linear) === null || _f === void 0 ? void 0 : _f.cycles) === null || _g === void 0 ? void 0 : _g.value) {
                    payload.cycleId = (_k = (_j = (_h = context.pluginPlayground) === null || _h === void 0 ? void 0 : _h.linear) === null || _j === void 0 ? void 0 : _j.cycles) === null || _k === void 0 ? void 0 : _k.value[0];
                }
                if ((_o = (_m = (_l = context.pluginPlayground) === null || _l === void 0 ? void 0 : _l.linear) === null || _m === void 0 ? void 0 : _m.projects) === null || _o === void 0 ? void 0 : _o.value) {
                    payload.projectId = (_r = (_q = (_p = context.pluginPlayground) === null || _p === void 0 ? void 0 : _p.linear) === null || _q === void 0 ? void 0 : _q.projects) === null || _r === void 0 ? void 0 : _r.value[0];
                }
                if ((_u = (_t = (_s = context.pluginPlayground) === null || _s === void 0 ? void 0 : _s.linear) === null || _t === void 0 ? void 0 : _t.labels) === null || _u === void 0 ? void 0 : _u.value) {
                    payload.labelIds = (_x = (_w = (_v = context.pluginPlayground) === null || _v === void 0 ? void 0 : _v.linear) === null || _w === void 0 ? void 0 : _w.labels) === null || _x === void 0 ? void 0 : _x.value;
                }
                if ((_0 = (_z = (_y = context.pluginPlayground) === null || _y === void 0 ? void 0 : _y.linear) === null || _z === void 0 ? void 0 : _z.assignees) === null || _0 === void 0 ? void 0 : _0.value) {
                    payload.assigneeId = (_3 = (_2 = (_1 = context.pluginPlayground) === null || _1 === void 0 ? void 0 : _1.linear) === null || _2 === void 0 ? void 0 : _2.assignees) === null || _3 === void 0 ? void 0 : _3.value[0];
                }
                if ((_6 = (_5 = (_4 = context.pluginPlayground) === null || _4 === void 0 ? void 0 : _4.linear) === null || _5 === void 0 ? void 0 : _5.subscribers) === null || _6 === void 0 ? void 0 : _6.value) {
                    payload.subscriberIds = (_9 = (_8 = (_7 = context.pluginPlayground) === null || _7 === void 0 ? void 0 : _7.linear) === null || _8 === void 0 ? void 0 : _8.subscribers) === null || _9 === void 0 ? void 0 : _9.value;
                }
                if ((_12 = (_11 = (_10 = context.pluginPlayground) === null || _10 === void 0 ? void 0 : _10.linear) === null || _11 === void 0 ? void 0 : _11.states) === null || _12 === void 0 ? void 0 : _12.value) {
                    payload.stateId = (_15 = (_14 = (_13 = context.pluginPlayground) === null || _13 === void 0 ? void 0 : _13.linear) === null || _14 === void 0 ? void 0 : _14.states) === null || _15 === void 0 ? void 0 : _15.value[0];
                }
                payload.description = handleConditionContent;
                const issue = yield (0, linear_1.createIssue)(payload, this.settings.token);
                if (!issue)
                    return false;
                return { url: issue.url, body: issue.identifier };
            }),
            buttonIconUrl: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/82d07241-84b3-4cdf-33b5-a09b8d169300/f=auto,q=95,fit=scale-down,metadata=none'
        };
        this.mention = () => {
            if (!this.settings.token)
                return [];
            return [
                {
                    name: 'linear_teams_and_cycles',
                    char: '>>',
                    htmlClass: 'mention_collections',
                    allowSpaces: true,
                    getListItem: () => __awaiter(this, void 0, void 0, function* () {
                        var _a, _b, _c, _d, _e, _f, _g;
                        const teams = yield (0, linear_1.getTeamsAndCycles)({ token: this.settings.token });
                        const teamId = (_b = (_a = this.teamId) !== null && _a !== void 0 ? _a : this.settings.defaultTeamId) !== null && _b !== void 0 ? _b : (_c = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _c === void 0 ? void 0 : _c[0].id;
                        const mentionTeams = (_e = (_d = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _d === void 0 ? void 0 : _d.map(team => ({
                            title: team.name,
                            linear_type: 'teams',
                            color: team.color,
                            linear_value: team.id
                        }))) !== null && _e !== void 0 ? _e : [];
                        if (!teamId)
                            return mentionTeams;
                        const cycles = yield (0, linear_1.getCycles)({ token: this.settings.token, teamId });
                        const mentionCycles = (_f = cycles === null || cycles === void 0 ? void 0 : cycles.map(cycle => ({
                            title: `Cycle ${cycle.number}`,
                            linear_type: 'cycles',
                            linear_value: cycle.id
                        }))) !== null && _f !== void 0 ? _f : [];
                        (_g = this.log) === null || _g === void 0 ? void 0 : _g.call(this, JSON.stringify([...mentionTeams, ...mentionCycles]));
                        return [...mentionTeams, ...mentionCycles];
                    }),
                    onSelectItem: ({ item, setContext, context, deleteMentionPlaceholder }) => {
                        var _a, _b, _c, _d, _e, _f;
                        deleteMentionPlaceholder();
                        if (item.linear_type === 'teams') {
                            setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_a = context.pluginPlayground) !== null && _a !== void 0 ? _a : {})), { linear: Object.assign(Object.assign({}, ((_c = (_b = context === null || context === void 0 ? void 0 : context.pluginPlayground) === null || _b === void 0 ? void 0 : _b.linear) !== null && _c !== void 0 ? _c : {})), { teams: {
                                            value: [item.linear_value],
                                            render: [{ title: item.title, color: item.color, background: item.background }]
                                        } }) }) }));
                        }
                        if (item.linear_type === 'cycles') {
                            setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_d = context.pluginPlayground) !== null && _d !== void 0 ? _d : {})), { linear: Object.assign(Object.assign({}, ((_f = (_e = context === null || context === void 0 ? void 0 : context.pluginPlayground) === null || _e === void 0 ? void 0 : _e.linear) !== null && _f !== void 0 ? _f : {})), { cycles: {
                                            value: [item.linear_value],
                                            render: [{ title: item.title, color: item.color, background: item.background }]
                                        } }) }) }));
                        }
                    }
                },
                {
                    name: 'linear_project_label',
                    char: '#',
                    htmlClass: 'mention_collections',
                    allowSpaces: true,
                    getListItem: () => __awaiter(this, void 0, void 0, function* () {
                        var _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                        const teams = yield (0, linear_1.getTeamsProjectsAndLabels)({ token: this.settings.token });
                        const teamId = (_j = (_h = this.teamId) !== null && _h !== void 0 ? _h : this.settings.defaultTeamId) !== null && _j !== void 0 ? _j : (_k = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _k === void 0 ? void 0 : _k[0].id;
                        if (!teamId)
                            return [];
                        const team = (_l = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _l === void 0 ? void 0 : _l.find(team => team.id === teamId);
                        const mentionLabels = (_p = (_o = (_m = team === null || team === void 0 ? void 0 : team.labels) === null || _m === void 0 ? void 0 : _m.nodes) === null || _o === void 0 ? void 0 : _o.map(label => ({
                            title: label.name,
                            linear_type: 'label',
                            background: label.color,
                            linear_value: label.id
                        }))) !== null && _p !== void 0 ? _p : [];
                        const mentionProject = (_s = (_r = (_q = team === null || team === void 0 ? void 0 : team.projects) === null || _q === void 0 ? void 0 : _q.nodes) === null || _r === void 0 ? void 0 : _r.map(project => ({
                            title: project.name,
                            linear_type: 'projects',
                            background: project.color,
                            linear_value: project.id
                        }))) !== null && _s !== void 0 ? _s : [];
                        return [...mentionProject, ...mentionLabels];
                    }),
                    onSelectItem: ({ item, setContext, context, deleteMentionPlaceholder }) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        deleteMentionPlaceholder();
                        if (item.linear_type === 'projects') {
                            setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_a = context.pluginPlayground) !== null && _a !== void 0 ? _a : {})), { linear: Object.assign(Object.assign({}, ((_c = (_b = context === null || context === void 0 ? void 0 : context.pluginPlayground) === null || _b === void 0 ? void 0 : _b.linear) !== null && _c !== void 0 ? _c : {})), { project: {
                                            value: [item.linear_value],
                                            render: [{ title: item.title, color: item.color, background: item.background }]
                                        } }) }) }));
                        }
                        if (item.linear_type === 'label') {
                            const labels = (_g = (_f = (_e = (_d = context.pluginPlayground) === null || _d === void 0 ? void 0 : _d.linear) === null || _e === void 0 ? void 0 : _e.labels) === null || _f === void 0 ? void 0 : _f.value) !== null && _g !== void 0 ? _g : [];
                            const label = item.linear_value;
                            const newLabels = labels.includes(label) ? labels.filter(l => l !== label) : [...labels, label];
                            setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_h = context.pluginPlayground) !== null && _h !== void 0 ? _h : {})), { linear: Object.assign(Object.assign({}, ((_k = (_j = context === null || context === void 0 ? void 0 : context.pluginPlayground) === null || _j === void 0 ? void 0 : _j.linear) !== null && _k !== void 0 ? _k : {})), { labels: {
                                            value: newLabels,
                                            render: [{ title: item.title, color: item.color, background: item.background }]
                                        } }) }) }));
                        }
                    }
                },
                {
                    name: 'linear_subscriber_label',
                    char: '@',
                    htmlClass: 'mention_collections',
                    allowSpaces: true,
                    getListItem: () => __awaiter(this, void 0, void 0, function* () {
                        var _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
                        const teams = yield (0, linear_1.getTeamsMembers)({ token: this.settings.token });
                        const teamId = (_u = (_t = this.teamId) !== null && _t !== void 0 ? _t : this.settings.defaultTeamId) !== null && _u !== void 0 ? _u : (_v = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _v === void 0 ? void 0 : _v[0].id;
                        if (!teamId)
                            return [];
                        const team = (_w = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _w === void 0 ? void 0 : _w.find(team => team.id === teamId);
                        const mentionAssignee = (_z = (_y = (_x = team === null || team === void 0 ? void 0 : team.members) === null || _x === void 0 ? void 0 : _x.nodes) === null || _y === void 0 ? void 0 : _y.map(person => ({
                            title: `${person.displayName} - Assignee`,
                            linear_type: 'assignees',
                            linear_value: person.id,
                            logoProps: {
                                logo: person.avatarUrl,
                                name: person.displayName
                            }
                        }))) !== null && _z !== void 0 ? _z : [];
                        const mentionSubscriber = (_2 = (_1 = (_0 = team === null || team === void 0 ? void 0 : team.members) === null || _0 === void 0 ? void 0 : _0.nodes) === null || _1 === void 0 ? void 0 : _1.map(person => ({
                            title: `${person.displayName} - Subscriber`,
                            linear_type: 'subscribers',
                            linear_value: person.id,
                            logoProps: {
                                logo: person.avatarUrl,
                                name: person.displayName
                            }
                        }))) !== null && _2 !== void 0 ? _2 : [];
                        return [...mentionAssignee, ...mentionSubscriber];
                    }),
                    onSelectItem: ({ item, setContext, context, deleteMentionPlaceholder }) => {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        deleteMentionPlaceholder();
                        if (item.linear_type === 'assignees') {
                            setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_a = context.pluginPlayground) !== null && _a !== void 0 ? _a : {})), { linear: Object.assign(Object.assign({}, ((_c = (_b = context === null || context === void 0 ? void 0 : context.pluginPlayground) === null || _b === void 0 ? void 0 : _b.linear) !== null && _c !== void 0 ? _c : {})), { assignees: {
                                            value: [item.linear_value],
                                            render: [{ title: item.title, color: item.color, background: item.background, logoProps: item.logoProps }]
                                        } }) }) }));
                        }
                        if (item.linear_type === 'subscribers') {
                            const labels = (_g = (_f = (_e = (_d = context.pluginPlayground) === null || _d === void 0 ? void 0 : _d.linear) === null || _e === void 0 ? void 0 : _e.labels) === null || _f === void 0 ? void 0 : _f.value) !== null && _g !== void 0 ? _g : [];
                            const label = item.linear_value;
                            const newLabels = labels.includes(label) ? labels.filter(l => l !== label) : [...labels, label];
                            setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_h = context.pluginPlayground) !== null && _h !== void 0 ? _h : {})), { linear: Object.assign(Object.assign({}, ((_k = (_j = context === null || context === void 0 ? void 0 : context.pluginPlayground) === null || _j === void 0 ? void 0 : _j.linear) !== null && _k !== void 0 ? _k : {})), { subscribers: {
                                            value: newLabels,
                                            render: [{ title: item.title, color: item.color, background: item.background, logoProps: item.logoProps }]
                                        } }) }) }));
                        }
                    }
                },
                {
                    name: 'linear_template_label',
                    char: '$',
                    htmlClass: 'mention_collections',
                    allowSpaces: true,
                    getListItem: () => __awaiter(this, void 0, void 0, function* () {
                        var _3, _4, _5, _6, _7, _8, _9, _10, _11, _12;
                        const teams = yield (0, linear_1.getTeamsTemplatesAndStates)({ token: this.settings.token });
                        const teamId = (_4 = (_3 = this.teamId) !== null && _3 !== void 0 ? _3 : this.settings.defaultTeamId) !== null && _4 !== void 0 ? _4 : (_5 = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _5 === void 0 ? void 0 : _5[0].id;
                        if (!teamId)
                            return [];
                        const team = (_6 = teams === null || teams === void 0 ? void 0 : teams.nodes) === null || _6 === void 0 ? void 0 : _6.find(team => team.id === teamId);
                        const mentionTemplates = (_9 = (_8 = (_7 = team === null || team === void 0 ? void 0 : team.templates) === null || _7 === void 0 ? void 0 : _7.nodes) === null || _8 === void 0 ? void 0 : _8.map(template => ({
                            title: template.name,
                            linear_type: 'templates',
                            linear_value: template.templateData
                        }))) !== null && _9 !== void 0 ? _9 : [];
                        const mentionStates = (_12 = (_11 = (_10 = team === null || team === void 0 ? void 0 : team.states) === null || _10 === void 0 ? void 0 : _10.nodes) === null || _11 === void 0 ? void 0 : _11.map(state => ({
                            title: state.name,
                            linear_type: 'states',
                            color: state.color,
                            linear_value: state.id
                        }))) !== null && _12 !== void 0 ? _12 : [];
                        return [...mentionTemplates, ...mentionStates];
                    }),
                    onSelectItem: ({ item, setContext, context, deleteMentionPlaceholder, editor }) => {
                        var _a, _b, _c;
                        deleteMentionPlaceholder();
                        if (item.linear_type === 'templates') {
                            editor.commands.insertContent({ value: item.linear_value });
                            return;
                        }
                        if (item.linear_type === 'states') {
                            setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_a = context.pluginPlayground) !== null && _a !== void 0 ? _a : {})), { linear: Object.assign(Object.assign({}, ((_c = (_b = context === null || context === void 0 ? void 0 : context.pluginPlayground) === null || _b === void 0 ? void 0 : _b.linear) !== null && _c !== void 0 ? _c : {})), { states: {
                                            value: [item.linear_value],
                                            render: [{ title: item.title, color: item.color, background: item.background }]
                                        } }) }) }));
                        }
                    }
                }
            ];
        };
        if (!props)
            return;
        if (props.settings)
            this.settings = Object.assign(Object.assign({}, this.settings), props.settings);
        this.log = props.helpers.moonLog;
        this.settingsButtons = [
            {
                type: 'button',
                callback: () => {
                    window.open('https://linear.app/oauth/authorize?client_id=11672c0b84224c2a2a5fb10d7e3898a1&redirect_uri=https://moonjot.com/auth/linear&response_type=code&scope=read,write', '_blank');
                },
                label: 'Auth with Linear',
                description: `Get my access.\n
Use >> to set Team and Cycle\n
Use # to set Project and Labels\n
Use @ to set Assignee and Subscriber\n
Use $ to set Assignee and Subscriber\n`
            }
        ];
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map