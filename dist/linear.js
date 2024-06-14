"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCycles = exports.createAttachments = exports.getPriorityValues = exports.getTeamsTemplate = exports.getTeams = exports.getMe = exports.updateAnIssue = exports.createIssue = exports.createALabel = exports.searchAnIssue = void 0;
const url = 'https://api.linear.app/graphql';
const searchAnIssue = ({ query }, token) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield fetch(url, {
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
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.issues.nodes;
    }
    return [];
});
exports.searchAnIssue = searchAnIssue;
const createALabel = (variables, token) => __awaiter(void 0, void 0, void 0, function* () {
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
`;
    const result = yield fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token
        },
        body: JSON.stringify({
            query,
            variables
        })
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.issueLabelCreate.issueLabel;
    }
    return false;
});
exports.createALabel = createALabel;
const createIssue = (variables, token) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
    mutation CreateIssue($title: String!, $teamId: String!, $descriptionData: JSON, $assigneeId: String, $priority: Int, $stateId: String, $subscriberIds: [String!],  $cycleId: String, $projectId: String, $labelIds: [String!])  {
      issueCreate(input: {
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
  `;
    const result = yield fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token
        },
        body: JSON.stringify({
            query,
            variables
        })
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.issueCreate.issue;
    }
    return false;
});
exports.createIssue = createIssue;
const updateAnIssue = (variables, token) => __awaiter(void 0, void 0, void 0, function* () {
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
  `;
    const result = yield fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token
        },
        body: JSON.stringify({
            query,
            variables
        })
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.issueUpdate.success;
    }
    return false;
});
exports.updateAnIssue = updateAnIssue;
const getMe = ({ token }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield fetch(url, {
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
    });
    const json = yield result.json();
    if ((_a = json.data) === null || _a === void 0 ? void 0 : _a.viewer) {
        return json.data.viewer;
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {};
});
exports.getMe = getMe;
const getTeams = ({ token }) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const result = yield fetch(url, {
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
                labels(orderBy: updatedAt) {
                    nodes {
                        id
                        name
                        color
                        isGroup
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
}`
        })
    });
    const json = yield result.json();
    if ((_c = (_b = json.data) === null || _b === void 0 ? void 0 : _b.teams) === null || _c === void 0 ? void 0 : _c.nodes) {
        return json.data.teams;
    }
    return {};
});
exports.getTeams = getTeams;
const getTeamsTemplate = ({ token }) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield fetch(url, {
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
            }
        }
}`
        })
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.teams;
    }
    return {};
});
exports.getTeamsTemplate = getTeamsTemplate;
const getPriorityValues = ({ token }) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield fetch(url, {
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
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.issuePriorityValues;
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {};
});
exports.getPriorityValues = getPriorityValues;
const createAttachments = (variables, token) => __awaiter(void 0, void 0, void 0, function* () {
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
  `;
    const result = yield fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: token
        },
        body: JSON.stringify({
            query,
            variables
        })
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.attachmentCreate.success;
    }
    return false;
});
exports.createAttachments = createAttachments;
const getCycles = ({ token, teamId }) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield fetch(url, {
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
    });
    const json = yield result.json();
    if (json.data) {
        return json.data.cycles.nodes;
    }
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {};
});
exports.getCycles = getCycles;
//# sourceMappingURL=linear.js.map