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
        tags: context.pluginPlayground?.clickup?.tags,
        priority: context.pluginPlayground?.clickup?.priority
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
          const mentionTags = tags.map((tag: { name: string, tag_fg: string, tag_bg: string }) => ({
            title: tag.name,
            clickup_type: 'tag',
            background: tag.tag_fg
          }))

          const mentionPriority = [
            { title: 'none', clickup_type: 'priority', clickup_value: null },
            { title: 'Low', clickup_type: 'priority', clickup_value: 4, color: 'rgb(135, 144, 158)' },
            { title: 'Normal', clickup_type: 'priority', clickup_value: 3, color: 'rgb(68, 102, 255)' },
            { title: 'High', clickup_type: 'priority', clickup_value: 2, color: 'rgb(207, 148, 10)' },
            { title: 'Urgent', clickup_type: 'priority', clickup_value: 1, color: '#b13a41' }
          ]

          return [...mentionTags, ...mentionPriority]
        },
        onSelectItem: (
          { item, setContext, context, deleteMentionPlaceholder }) => {
          deleteMentionPlaceholder()
          if (item.clickup_type === 'tag') {
            const tags = context.pluginPlayground?.clickup?.tags ?? []
            const tag = item.title
            const index = tags.indexOf(tag)

            if (index === -1) {
              tags.push(tag)
            } else {
              tags.splice(index, 1)
            }
            setContext({ ...context, pluginPlayground: { ...(context.pluginPlayground ?? {}), clickup: { ...(context?.pluginPlayground?.clickup ?? {}), tags } } })
          } else if (item.clickup_type === 'priority') {
            setContext({ ...context, pluginPlayground: { ...(context.pluginPlayground ?? {}), clickup: { ...(context?.pluginPlayground?.clickup ?? {}), priority: item.clickup_value } } })
          }
        }
      }
    ]
  }
}
