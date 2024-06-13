import { type Context, MoonPlugin, type MoonPluginConstructorProps, type MoonPluginSettings, type PluginSettingsDescription, type PluginMentionItem, type EndpointCallbackItem } from '@moonjot/moon'
import { extractTitleFromMarkdown, handleConditions, handleReplacingProperties, turnDate } from '@moonjot/moon-utils'
import { DEFAULT_TEMPLATE } from './template'
import { createIssue, getCycles, getTeams } from './linear'
import { type IssueCreate } from './linear.type'

interface LinearPluginSettingsDescription extends PluginSettingsDescription {
  token: {
    type: 'string'
    required: boolean
    label: string
    description: string
  }
  defaultTeamId: {
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

interface LinearPluginSettings extends MoonPluginSettings {
  token: string
  defaultTeamId: string
  template: string
}

const ENDPOINT: EndpointCallbackItem = {
  endpoint: 'auth/linear',
  callback: ({ url, saveSettings, doNotification }) => {
    const queries = url.split('?').pop()?.split('&').reduce((acc: Record<string, string>, query: string) => {
      const queryString = query.split('=')
      const key = queryString[0]
      const value = queryString[1]
      if (!key || !value) return acc
      return { ...acc, [key]: value }
    }, {})
    if (!queries?.token) return
    getTeams({ token: queries.token }).then(teams => {
      const teamId = teams.nodes?.[0].id
      if (teamId) saveSettings({ key: 'defaultTeamId', value: teamId })
    }).catch(() => {
      doNotification({ body: 'Error on fetch Liner Teams', width: 400 })
    })

    saveSettings({ key: 'token', value: queries.token })
    doNotification({ body: 'Linear settings as been saved', width: 400 })
  }
}

export default class extends MoonPlugin {
  name: string = 'Linear'
  logo: string = 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/82d07241-84b3-4cdf-33b5-a09b8d169300/f=auto,q=95,fit=scale-down,metadata=none'

  settingsDescription: LinearPluginSettingsDescription = {
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
      default: DEFAULT_TEMPLATE
    }
  }

  settings: LinearPluginSettings = {
    token: '',
    defaultTeamId: '',
    template: DEFAULT_TEMPLATE
  }

  log: ((log: string) => void) | undefined

  teamId: string | undefined

  // https://linear.app/oauth/authorize?client_id=11672c0b84224c2a2a5fb10d7e3898a1&redirect_uri=http://localhost:3000/auth/linear&response_type=code&scope=read,write
  constructor (props?: MoonPluginConstructorProps<LinearPluginSettings>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(props)
    if (!props) return
    if (props.settings) this.settings = { ...this.settings, ...props.settings }
    this.log = props.helpers.moonLog

    this.settingsButtons = [
      {
        type: 'button',
        callback: () => {
          window.open('https://linear.app/oauth/authorize?client_id=11672c0b84224c2a2a5fb10d7e3898a1&redirect_uri=https://moonjot.com/auth/linear&response_type=code&scope=read,write', '_blank')
        },
        label: 'Auth with Linear',
        description: 'Get my access.'
      }
    ]
  }

  endpointCallbacks = [ENDPOINT]

  integration = {
    callback: async ({ context, markdown }: {
      html: string
      markdown: string
      context: Context
    }
    ) => {
      if (!this.settings.defaultTeamId) return false
      const handleDateContent = turnDate({ content: this.settings.template })

      const searchObj = {
        content: markdown,
        ...context
      }

      const handlePropertiesContent = handleReplacingProperties({ content: handleDateContent, searchObj }) ?? ''

      let handleConditionContent = handleConditions({ content: handlePropertiesContent, searchObj })?.trim() ?? ''

      const titleFromMarkdown = extractTitleFromMarkdown(handleConditionContent)

      if (titleFromMarkdown) handleConditionContent = handleConditionContent.split('\n').slice(1).join('\n')
      const title = titleFromMarkdown ?? handleConditionContent.split('\n').pop() ?? context.source.title

      const getTeamId = async () => {
        if (context.pluginPlayground?.linear?.teams?.value) {
          return context.pluginPlayground?.linear?.teams?.value[0]
        } else {
          const teams = await getTeams({ token: this.settings.token })
          const team = teams?.nodes?.[0]
          this.teamId = team?.id
          return team?.id
        }
      }

      const teamId = await getTeamId()

      if (!teamId) return false

      const payload: IssueCreate = {
        title,
        description: handleConditionContent,
        teamId
      }

      if (context.pluginPlayground?.linear?.cycles?.value) {
        payload.cycleId = context.pluginPlayground?.linear?.cycles?.value[0]
      }

      const issue = await createIssue(payload, this.settings.token)

      if (!issue) return false

      return { url: issue.url, body: issue.identifier }
    },
    buttonIconUrl: 'https://linear.app/cdn-cgi/imagedelivery/fO02fVwohEs9s9UHFwon6A/82d07241-84b3-4cdf-33b5-a09b8d169300/f=auto,q=95,fit=scale-down,metadata=none'
  }

  mention = (): PluginMentionItem[] => {
    if (!this.settings.token) return []
    return [
      {
        name: 'linear_teams_and_cycles',
        char: '#',
        htmlClass: 'mention_collections',
        allowSpaces: true,
        getListItem: async () => {
          const teams = await getTeams({ token: this.settings.token })
          const teamId = this.teamId ?? this.settings.defaultTeamId ?? teams?.nodes?.[0].id

          const mentionTeams = teams?.nodes?.map(team => ({
            title: team.name,
            linear_type: 'teams',
            color: team.color,
            linear_value: team.id
          })) ?? []

          if (!teamId) return mentionTeams
          const cycles = await getCycles({ token: this.settings.token, teamId })

          const cycleTeams = cycles?.map(cycle => ({
            title: `Cycle ${cycle.number}`,
            linear_type: 'cycles',
            linear_value: cycle.id
          })) ?? []

          this.log?.(JSON.stringify([...mentionTeams, ...cycleTeams]))

          return [...mentionTeams, ...cycleTeams]
        },
        onSelectItem: (
          { item, setContext, context, deleteMentionPlaceholder }) => {
          deleteMentionPlaceholder()

          if (item.linear_type === 'teams') {
            setContext({
              ...context,
              pluginPlayground: {
                ...(context.pluginPlayground ?? {}),
                linear: {
                  ...(context?.pluginPlayground?.linear ?? {}),
                  teams: {
                    value: [item.linear_value as string],
                    render: [{ title: item.title, color: item.color, background: item.background }]
                  }
                }
              }
            })
          } if (item.linear_type === 'cycles') {
            setContext({
              ...context,
              pluginPlayground: {
                ...(context.pluginPlayground ?? {}),
                linear: {
                  ...(context?.pluginPlayground?.linear ?? {}),
                  cycles: {
                    value: [item.linear_value as string],
                    render: [{ title: item.title, color: item.color, background: item.background }]
                  }
                }
              }
            })
          }
        }
      }
    ]
  }
}
