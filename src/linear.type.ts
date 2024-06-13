export interface Issue {
  id?: string
  title?: string
  identifier?: string
  url?: string
  priority?: Priority
  state?: State
  description?: string
  team?: Team
  labels?: Label[]
  assignee?: Member
  subscribers?: Member[]
  project?: Project
  cycle?: Cycle
}

export interface IssueCreate {
  id?: string
  title?: string
  description?: string
  assigneeId?: string
  priority?: number
  stateId?: string
  subscriberIds?: string[]
  teamId?: string
  cycleId?: string
  projectId?: string
  labelIds?: string[]
}

export interface IssueSuccess {
  id: string
  identifier: string
  url: string
  title: string
  branchName: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  defaultTeam?: string
}

export interface Label {
  id: string
  name: string
  color: string
  isGroup: boolean
}

export interface State {
  id: string
  name: string
  color: string
  position: number
  type: 'started' | 'unstarted' | 'backlog' | 'completed' | 'canceled'
}

export type States = Record<
'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled',
State[]
>

export interface Member {
  id: string
  name: string
  displayName: string
  email: string
  avatarUrl: string
  statusEmoji: string
  statusLabel: string
  active: boolean
  isMe: boolean
}

export interface Project {
  id: string
  name: string
  icon: string
  color: string
  state: string
  url: string
}

export interface Cycle {
  id: string
  number: string
  startsAt: string
  endsAt: string
}

export interface Team {
  id: string
  createdAt: string
  updatedAt: string
  archivedAt: string | null
  name: string
  key: string
  description: string | null
  icon: string | null
  color: string
  private: boolean
  issueCount: number
  templates?: Array<{
    id: string
    type: string
    name: string
    templateData: object
  }>
  labels?: Label[]
  states?: States
  members?: Member[]
  projects?: Project[]
  cycles?: Cycle[]
}

export interface UserData extends Omit<User, 'defaultTeam'> {
  teams: {
    nodes: Array<Team & {
      templates?: {
        nodes: Array<{
          id: string
          type: string
          name: string
          templateData: object
        }>
      }
      labels?: {
        nodes: Array<{
          id: string
          name: string
          color: string
          isGroup: boolean
        }>
      }
      states?: {
        nodes: Array<{
          id: string
          name: string
          color: string
          position: number
          type: string
        }>
      }
      members?: {
        nodes: Array<{
          id: string
          name: string
          displayName: string
          email: string
          avatarUrl: string
          statusEmoji: string
          statusLabel: string
          active: boolean
          isMe: boolean
        }>
      }
      projects?: {
        nodes: Array<{
          id: string
          name: string
          icon: string
          color: string
          state: string
          url: string
        }>
      }
    }>
  }
}

export interface Priority {
  priority: 0 | 1 | 2 | 3 | 4
  label: string
}

export type CycleNode = Cycle & {
  team: {
    id: string
  }
}
