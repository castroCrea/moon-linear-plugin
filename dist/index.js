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
class default_1 extends moon_1.MoonPlugin {
    constructor(props) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        super(props);
        this.name = 'Clickup';
        this.logo = 'https://app-cdn.clickup.com/fr-FR/clickup-symbol_color.6c3fc778987344003164b4b4c9826eb8.svg';
        this.settingsDescription = {
            token: {
                type: 'string',
                required: true,
                label: 'Token',
                description: 'Clickup API token.'
            },
            listId: {
                type: 'string',
                required: true,
                label: 'Space Id',
                description: 'Clickup Space Id.'
            },
            template: {
                type: 'text',
                required: true,
                label: 'Template of capture',
                description: 'Format your note result inside Clickup. [Documentation](https://github.com/castroCrea/moon-clickup-plugin/blob/main/README.md)',
                default: template_1.DEFAULT_TEMPLATE
            }
        };
        this.settings = {
            token: '',
            listId: '',
            template: template_1.DEFAULT_TEMPLATE
        };
        this.integration = {
            callback: ({ context, markdown }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                if (!this.settings.listId)
                    return false;
                const handleDateContent = (0, moon_utils_1.turnDate)({ content: this.settings.template });
                const searchObj = Object.assign({ content: markdown }, context);
                const handlePropertiesContent = (_a = (0, moon_utils_1.handleReplacingProperties)({ content: handleDateContent, searchObj })) !== null && _a !== void 0 ? _a : '';
                let handleConditionContent = (_c = (_b = (0, moon_utils_1.handleConditions)({ content: handlePropertiesContent, searchObj })) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                const title = (0, moon_utils_1.extractTitleFromMarkdown)(handleConditionContent);
                if (title)
                    handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n');
                const payload = {
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    name: title || context.source.title || (0, moon_utils_1.turnDate)({ content: '{{DATE}}YYYY-MM-DD HH:mm{{END_DATE}}' }),
                    markdown_description: handleConditionContent,
                    tags: (_e = (_d = context.pluginPlayground) === null || _d === void 0 ? void 0 : _d.clickup) === null || _e === void 0 ? void 0 : _e.tags
                };
                const response = yield fetch(`https://api.clickup.com/api/v2/list/${this.settings.listId}/task`, {
                    method: 'POST',
                    headers: {
                        Authorization: this.settings.token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const jsonResponse = yield response.json();
                return jsonResponse.id ? { url: jsonResponse.url } : false;
            }),
            buttonIconUrl: 'https://app-cdn.clickup.com/fr-FR/clickup-symbol_color.6c3fc778987344003164b4b4c9826eb8.svg'
        };
        this.mention = () => {
            if (!this.settings.token || !this.settings.listId)
                return [];
            return [
                {
                    name: 'clickup_keywords',
                    char: '#',
                    htmlClass: 'mention_collections',
                    allowSpaces: true,
                    getListItem: () => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const list = yield fetch(`https://api.clickup.com/api/v2/list/${this.settings.listId}`, {
                            method: 'GET',
                            headers: {
                                Authorization: this.settings.token,
                                'Content-Type': 'application/jso#n'
                            }
                        }).then((r) => __awaiter(this, void 0, void 0, function* () { return yield r.json(); }));
                        // this.log?.(JSON.stringify({ list }))
                        const spaceId = (_a = list === null || list === void 0 ? void 0 : list.space) === null || _a === void 0 ? void 0 : _a.id;
                        if (!spaceId)
                            return [];
                        const tagsResponse = yield fetch(`https://api.clickup.com/api/v2/space/${spaceId}/tag`, {
                            method: 'GET',
                            headers: {
                                Authorization: this.settings.token,
                                'Content-Type': 'application/json'
                            }
                        }).then((r) => __awaiter(this, void 0, void 0, function* () { return yield r.json(); }));
                        // this.log?.(JSON.stringify({ tagsResponse }))
                        const tags = tagsResponse.tags;
                        if (!tags)
                            return [];
                        return tags.map((tag) => ({ title: tag.name }));
                    }),
                    onSelectItem: ({ item, setContext, context, deleteMentionPlaceholder }) => {
                        var _a, _b, _c, _d;
                        deleteMentionPlaceholder();
                        const tags = (_c = (_b = (_a = context.pluginPlayground) === null || _a === void 0 ? void 0 : _a.clickup) === null || _b === void 0 ? void 0 : _b.tags) !== null && _c !== void 0 ? _c : [];
                        const tag = item.title;
                        const index = tags.indexOf(tag);
                        if (index === -1) {
                            tags.push(tag);
                        }
                        else {
                            tags.splice(index, 1);
                        }
                        setContext(Object.assign(Object.assign({}, context), { pluginPlayground: Object.assign(Object.assign({}, ((_d = context.pluginPlayground) !== null && _d !== void 0 ? _d : {})), { clickup: { tags } }) }));
                    }
                }
            ];
        };
        if (!props)
            return;
        if (props.settings)
            this.settings = Object.assign(Object.assign({}, this.settings), props.settings);
        this.log = props.helpers.moonLog;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map