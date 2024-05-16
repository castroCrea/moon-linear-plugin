import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription, type PluginMentionItem } from '@moonjot/moon'
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
        markdown_description: handleConditionContent,
        tags: context.pluginPlayground?.clickup?.tags
      }

      const response = await fetch(`https://api.clickup.com/api/v2/list/${this.settings.listId}/task`, {
        method: 'POST',
        headers: {
          Authorization: this.settings.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const jsonResponse = await response.json()
      return jsonResponse.id ? { url: jsonResponse.url } : false
    },
    buttonIconUrl: 'https://app-cdn.clickup.com/fr-FR/clickup-symbol_color.6c3fc778987344003164b4b4c9826eb8.svg'
  }

  mention = (): PluginMentionItem[] => {
    if (!this.settings.token || !this.settings.listId) return []
    return [
      {
        name: 'clickup_keywords',
        char: '#',
        htmlClass: 'mention_collections',
        allowSpaces: true,
        getListItem: async () => {
          const list = await fetch(
            `https://api.clickup.com/api/v2/list/${this.settings.listId}`,
            {
              method: 'GET',
              headers: {
                Authorization: this.settings.token,
                'Content-Type': 'application/jso#n'
              }
            }
          ).then(async r => await r.json())

          // this.log?.(JSON.stringify({ list }))
          const spaceId = list?.space?.id
          if (!spaceId) return []

          const tagsResponse = await fetch(
          `https://api.clickup.com/api/v2/space/${spaceId}/tag`,
          {
            method: 'GET',
            headers: {
              Authorization: this.settings.token,
              'Content-Type': 'application/json'
            }
          }
          ).then(async r => await r.json())
          // this.log?.(JSON.stringify({ tagsResponse }))

          const tags = tagsResponse.tags
          if (!tags) return []
          return tags.map((tag: { name: string, tag_fg: string, tag_bg: string }) => ({ title: tag.name }))
        },
        onSelectItem: (
          { item, setContext, context, deleteMentionPlaceholder }) => {
          deleteMentionPlaceholder()
          const tags = context.pluginPlayground?.clickup?.tags ?? []
          const tag = item.title
          const index = tags.indexOf(tag)

          if (index === -1) {
            tags.push(tag)
          } else {
            tags.splice(index, 1)
          }
          setContext({ ...context, pluginPlayground: { ...(context.pluginPlayground ?? {}), clickup: { tags } } })
        }
      }
    ]
  }
}
