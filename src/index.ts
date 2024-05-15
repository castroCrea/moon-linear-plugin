import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription } from '@moonjot/moon'
import { extractTitleFromMarkdown, handleConditions, handleReplacingProperties, turnDate } from '@moonjot/moon-utils'
import { DEFAULT_TEMPLATE } from './template'

interface ClickupPluginSettingsDescription extends PluginSettingsDescription {
  token: {
    type: 'string'
    required: boolean
    label: string
    description: string
  }
  listId: {
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

interface ClickupPluginSettings extends MoonPluginSettings {
  token: string
  template: string
}

export default class extends MoonPlugin {
  name: string = 'Clickup'
  logo: string = 'https://app-cdn.clickup.com/fr-FR/clickup-symbol_color.6c3fc778987344003164b4b4c9826eb8.svg'

  settingsDescription: ClickupPluginSettingsDescription = {
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
      default: DEFAULT_TEMPLATE
    }
  }

  settings: ClickupPluginSettings = {
    token: '',
    listId: '',
    template: DEFAULT_TEMPLATE
  }

  log: ((log: string) => void) | undefined

  constructor (props?: MoonPluginConstructorProps<ClickupPluginSettings>) {
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
      if (!this.settings.listId) return false
      const handleDateContent = turnDate({ content: this.settings.template })

      const searchObj = {
        content: markdown,
        ...context
      }

      const handlePropertiesContent = handleReplacingProperties({ content: handleDateContent, searchObj }) ?? ''

      let handleConditionContent = handleConditions({ content: handlePropertiesContent, searchObj })?.trim() ?? ''

      const title = extractTitleFromMarkdown(handleConditionContent)

      if (title) handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n')

      const payload = {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        name: title || context.source.title || turnDate({ content: '{{DATE}}YYYY-MM-DD HH:mm{{END_DATE}}' }),
        markdown_description: handleConditionContent
      }

      const response = await fetch(`https://api.clickup.com/api/v2/list/${this.settings.listId}/task`, {
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
    buttonIconUrl: 'https://app-cdn.clickup.com/fr-FR/clickup-symbol_color.6c3fc778987344003164b4b4c9826eb8.svg'
  }

  // TODO: mention for tags
}
