import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription } from '@moonjot/moon'
import { handleConditions, handleReplacingProperties, turnDate } from '@moonjot/moon-utils'
import { DEFAULT_TEMPLATE } from './template'

interface CapacitiesPluginSettingsDescription extends PluginSettingsDescription {
  token: {
    type: 'string'
    required: boolean
    label: string
    description: string
  }
  spaceId: {
    type: 'string'
    required: boolean
    label: string
    description: string
  }
  template: {
    type: 'text'
    required: boolean
    label: string
    description: string
    default: string
  }
}

interface CapacitiesPluginSettings extends MoonPluginSettings {
  token: string
  template: string
  spaceId: string
}

export default class extends MoonPlugin {
  name: string = 'Capacities'
  logo: string = 'https://capacities.io/capacities-logo.png'

  settingsDescription: CapacitiesPluginSettingsDescription = {
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
      default: DEFAULT_TEMPLATE
    }
  }

  settings: CapacitiesPluginSettings = {
    token: '',
    spaceId: '',
    template: DEFAULT_TEMPLATE
  }

  log: ((log: string) => void) | undefined

  constructor (props?: MoonPluginConstructorProps<CapacitiesPluginSettings>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(props)
    if (!props) return
    if (props.settings) this.settings = { ...this.settings, ...props.settings }
    this.log = props.helpers.moonLog
  }

  integration = {
    callback: async ({ context, markdown }: {
      html: string
      markdown: string
      context: Context
    }
    ) => {
      if (!this.settings.spaceId) return false
      const handleDateContent = turnDate({ content: this.settings.template })

      const searchObj = {
        content: markdown,
        ...context
      }

      const handlePropertiesContent = handleReplacingProperties({ content: handleDateContent, searchObj }) ?? ''

      const handleConditionContent = handleConditions({ content: handlePropertiesContent, searchObj })?.trim() ?? ''

      const payload = {
        mdText: handleConditionContent,
        spaceId: this.settings.spaceId,
        origin: 'commandPalette'
      }

      const response = await fetch('https://api.capacities.io/save-to-daily-note', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + this.settings.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      const jsonResponse = await response.json()
      return jsonResponse[0].success === true
    },
    buttonIconUrl: 'https://capacities.io/capacities-logo.png'
  }
}
