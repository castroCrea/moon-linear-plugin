import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription, type PluginMentionItem } from '@moonjot/moon';
interface ClickupPluginSettingsDescription extends PluginSettingsDescription {
    token: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
    };
    listId: {
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
interface ClickupPluginSettings extends MoonPluginSettings {
    token: string;
    template: string;
}
export default class extends MoonPlugin {
    name: string;
    logo: string;
    settingsDescription: ClickupPluginSettingsDescription;
    settings: ClickupPluginSettings;
    log: ((log: string) => void) | undefined;
    constructor(props?: MoonPluginConstructorProps<ClickupPluginSettings>);
    integration: {
        callback: ({ context, markdown }: {
            html: string;
            markdown: string;
            context: Context;
        }) => Promise<false | {
            url: any;
        }>;
        buttonIconUrl: string;
    };
    mention: () => PluginMentionItem[];
}
export {};
