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
        this.name = 'Capacities';
        this.logo = 'https://capacities.io/capacities-logo.png';
        this.settingsDescription = {
            token: {
                type: 'string',
                required: true,
                label: 'Token',
                description: 'Capacities API token.'
            },
            spaceId: {
                type: 'string',
                required: true,
                label: 'Space Id',
                description: 'Capacities Space Id.'
            },
            template: {
                type: 'text',
                required: true,
                label: 'Template of capture',
                description: 'Format your note result inside Capacities. [Documentation](https://github.com/castroCrea/moon-capacities-plugin/blob/main/README.md)',
                default: template_1.DEFAULT_TEMPLATE
            }
        };
        this.settings = {
            token: '',
            spaceId: '',
            template: template_1.DEFAULT_TEMPLATE
        };
        this.integration = {
            callback: ({ context, markdown }) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                if (!this.settings.spaceId)
                    return false;
                const handleDateContent = (0, moon_utils_1.turnDate)({ content: this.settings.template });
                const searchObj = Object.assign({ content: markdown }, context);
                const handlePropertiesContent = (_a = (0, moon_utils_1.handleReplacingProperties)({ content: handleDateContent, searchObj })) !== null && _a !== void 0 ? _a : '';
                const handleConditionContent = (_c = (_b = (0, moon_utils_1.handleConditions)({ content: handlePropertiesContent, searchObj })) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : '';
                const payload = {
                    mdText: handleConditionContent,
                    spaceId: this.settings.spaceId,
                    origin: 'commandPalette'
                };
                const response = yield fetch('https://api.capacities.io/save-to-daily-note', {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + this.settings.token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                const jsonResponse = yield response.json();
                return jsonResponse[0].success === true;
            }),
            buttonIconUrl: 'https://capacities.io/capacities-logo.png'
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