import { type CycleNode, type Issue, type IssueCreate, type IssueSuccess, type UserData } from './linear.type'

const url = 'https://api.linear.app/graphql'

export const searchAnIssue = async ({
  query
}: {
  query: string
}, token: string): Promise<Issue[]> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
    issues(
        filter: {
          title: {containsIgnoreCase: "${query}"}
        }
    ) {
        nodes {
            id
            title
            identifier
            url
            priority
            state {
                id
                name
                type
                color
            }
            description
            descriptionData
            team {
                id
                key
            }
        }
    }
}
`
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.issues.nodes as Issue[]
  }
  return [] as Issue[]
}

export const createALabel = async (variables: {
  name: string
  teamId: string
  color?: string
}, token: string): Promise<false | {
  id: string
  name: string
  color: string
  isGroup: boolean
}> => {
  const query = `
  mutation IssueLabelCreate($name: String!, $teamId: String!, $color: String)  {
    issueLabelCreate(input: { name: $name, teamId: $teamId, color: $color }) {
        lastSyncId
        success
        issueLabel {
            id
            name
            color
        }
    }
  }
`

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query,
      variables
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.issueLabelCreate.issueLabel
  }
  return false
}

export const createIssue = async (
  variables: IssueCreate, token: string
): Promise<false | IssueSuccess> => {
  const query = `
    mutation CreateIssue($title: String!, $teamId: String!, $description: String, $assigneeId: String, $priority: Int, $stateId: String, $subscriberIds: [String!],  $cycleId: String, $projectId: String, $labelIds: [String!])  {
      issueCreate(input: {
        title: $title,
        teamId: $teamId
        description: $description
        assigneeId: $assigneeId
        priority: $priority
        stateId: $stateId
        subscriberIds: $subscriberIds
        cycleId: $cycleId
        projectId: $projectId
        labelIds: $labelIds
      }) {
        lastSyncId
        success
        issue {
            id
            identifier
            url
            title
            branchName
        }
      }
    }
  `

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query,
      variables
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.issueCreate.issue as IssueSuccess
  }
  return false
}
export const updateAnIssue = async (
  variables: IssueCreate, token: string
): Promise<false | IssueSuccess> => {
  const query = `
    mutation UpdateIssue($id: String!, $title: String!, $teamId: String!, $descriptionData: JSON, $assigneeId: String, $priority: Int, $stateId: String, $subscriberIds: [String!],  $cycleId: String, $projectId: String, $labelIds: [String!]) {
      issueUpdate(
        input: {
          title: $title,
          teamId: $teamId
          descriptionData: $descriptionData
          assigneeId: $assigneeId
          priority: $priority
          stateId: $stateId
          subscriberIds: $subscriberIds
          cycleId: $cycleId
          projectId: $projectId
          labelIds: $labelIds
        }
        id: $id
      ) {
        lastSyncId
        success
        issue {
            id
            identifier
            url
            title
            branchName
        }
      }
    }
  `

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query,
      variables
    })
  })

  const json = await result.json()
  if (json.data) {
    return json.data.issueUpdate.success as IssueSuccess
  }
  return false
}

export const getMe = async ({ token }: { token: string }): Promise<UserData> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
    viewer {
        id
        name
        email
        avatarUrl
        teams {
            nodes {
                id
                name
                key
                description
                icon
                color
                private
                issueCount
                members(filter: { active: { eq: true } }) {
                    nodes {
                        id
                        name
                        displayName
                        email
                        avatarUrl
                        statusEmoji
                        statusLabel
                        active
                        isMe
                    }
                }
                projects(orderBy: updatedAt) {
                    nodes {
                        id
                        name
                        icon
                        color
                        state
                        url
                    }
                }
            }
        }
    }
}`
    })
  })
  const json = await result.json()
  if (json.data?.viewer) {
    return json.data.viewer
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {} as UserData
}

export const getTeams = async ({ token }: { token: string }): Promise<Partial<UserData['teams']>> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
        teams {
            nodes {
                id
                name
                color
            }
        }
}`
    })
  })
  const json = await result.json()
  if (json.data?.teams?.nodes) {
    return json.data.teams as Partial<UserData['teams']>
  }
  return {} satisfies Partial<UserData['teams']>
}
export const getTeamsMembers = async ({ token }: { token: string }): Promise<Partial<UserData['teams']>> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
        teams {
            nodes {
                id
                members(filter: { active: { eq: true } }) {
                    nodes {
                        id
                        name
                        displayName
                        email
                        avatarUrl
                        statusEmoji
                        statusLabel
                        active
                        isMe
                    }
                }
            }
        }
}`
    })
  })
  const json = await result.json()
  if (json.data?.teams?.nodes) {
    return json.data.teams as Partial<UserData['teams']>
  }
  return {} satisfies Partial<UserData['teams']>
}

export const getTeamsTemplatesAndStates = async ({ token }: { token: string }): Promise<
Partial<UserData['teams']>
> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
        teams {
            nodes {
                id
                templates {
                    nodes {
                        id
                        type
                        name
                        templateData
                    }
                }
                states {
                    nodes {
                        id
                        name
                        color
                        position
                        type
                    }
                }
            }
        }
}`
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.teams as Partial<UserData['teams']>
  }
  return {} satisfies Partial<UserData['teams']>
}

export const getTeamsProjectsAndLabels = async ({ token }: { token: string }): Promise<
Partial<UserData['teams']>
> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
        teams {
            nodes {
                id
                projects(orderBy: updatedAt) {
                    nodes {
                        id
                        name
                        icon
                        color
                        state
                        url
                    }
                }
                labels(orderBy: updatedAt) {
                    nodes {
                        id
                        name
                        color
                        isGroup
                    }
                }
            }
        }
}`
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.teams as Partial<UserData['teams']>
  }
  return {} satisfies Partial<UserData['teams']>
}

export const getTeamsAndCycles = async ({ token }: { token: string }): Promise<
Partial<UserData['teams']>
> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
        teams {
            nodes {
                id
                name
                key
                description
                icon
                color
                private
                issueCount
                cycles(orderBy: createdAt, filter: { isPast: { eq: false } }) {
                    nodes {
                        id
                        number
                        startsAt
                        endsAt
                    }
                }
            }
        }
}`
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.teams as Partial<UserData['teams']>
  }
  return {} satisfies Partial<UserData['teams']>
}

export interface Priority {
  priority: 0 | 1 | 2 | 3 | 4
  label: string
}

export const getPriorityValues = async ({ token }: { token: string }): Promise<Priority[]> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `{
        issuePriorityValues {
          priority
          label
    }
}`
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.issuePriorityValues as Priority[]
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {} as Priority[]
}

export const createAttachments = async (variables: {
  title: string
  url: string
  issueId: string
}, token: string): Promise<boolean> => {
  const query = `
    mutation AttachmentCreate($title: String!, $url: String!, $issueId: String!)  {
      attachmentCreate(input: {
        title: $title,
        url: $url
        issueId: $issueId
      }) {
        lastSyncId
        success
        attachment {
          url
        }
      }
    }
  `

  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query,
      variables
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.attachmentCreate.success as boolean
  }
  return false
}

export const getCycles = async ({ token, teamId }: { token: string, teamId: string }): Promise<CycleNode[]> => {
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    },
    body: JSON.stringify({
      query: `
        query($teamId: ID!) {
          cycles(orderBy: createdAt, filter: { isPast: { eq: false }, team: { id: { eq: $teamId } } }) {
          nodes {
              id
              number
              startsAt
              team {
                  id
              }
              endsAt
          }
        }
    }`,
      variables: {
        teamId // Pass teamId as a variable
      }
    })
  })
  const json = await result.json()
  if (json.data) {
    return json.data.cycles.nodes as CycleNode[]
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return {} as CycleNode[]
}
