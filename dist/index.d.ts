import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription, type PluginMentionItem, type EndpointCallbackItem } from '@moonjot/moon';
interface LinearPluginSettingsDescription extends PluginSettingsDescription {
    token: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
    };
    defaultTeamId: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
    };
    template: {
        type: 'text';
        required: boolean;
        label: string;
        description: string;
        default: string;
    };
}
interface LinearPluginSettings extends MoonPluginSettings {
    token: string;
    defaultTeamId: string;
    template: string;
}
export default class extends MoonPlugin {
    name: string;
    logo: string;
    settingsDescription: LinearPluginSettingsDescription;
    settings: LinearPluginSettings;
    log: ((log: string) => void) | undefined;
    teamId: string | undefined;
    constructor(props?: MoonPluginConstructorProps<LinearPluginSettings>);
    endpointCallbacks: EndpointCallbackItem[];
    integration: {
        callback: ({ context, markdown }: {
            html: string;
            markdown: string;
            context: Context;
        }) => Promise<false | {
            url: string;
            body: string;
        }>;
        buttonIconUrl: string;
    };
    mention: () => PluginMentionItem[];
}
export {};
