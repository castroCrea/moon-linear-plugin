import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription } from '@moonjot/moon';
interface CapacitiesPluginSettingsDescription extends PluginSettingsDescription {
    token: {
        type: 'string';
        required: boolean;
        label: string;
        description: string;
    };
    spaceId: {
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
interface CapacitiesPluginSettings extends MoonPluginSettings {
    token: string;
    template: string;
    spaceId: string;
}
export default class extends MoonPlugin {
    name: string;
    logo: string;
    settingsDescription: CapacitiesPluginSettingsDescription;
    settings: CapacitiesPluginSettings;
    log: ((log: string) => void) | undefined;
    constructor(props?: MoonPluginConstructorProps<CapacitiesPluginSettings>);
    integration: {
        callback: ({ context, markdown }: {
            html: string;
            markdown: string;
            context: Context;
        }) => Promise<boolean>;
        buttonIconUrl: string;
    };
}
export {};
