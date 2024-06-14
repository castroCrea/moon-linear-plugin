import { type CycleNode, type Issue, type IssueCreate, type IssueSuccess, type UserData } from './linear.type';
declare const url = "https://api.linear.app/graphql";
export declare const searchAnIssue: ({ query }: {
    query: string;
}, token: string) => Promise<Issue[]>;
export declare const createALabel: (variables: {
    name: string;
    teamId: string;
    color?: string;
}, token: string) => Promise<false | {
    id: string;
    name: string;
    color: string;
    isGroup: boolean;
}>;
export declare const createIssue: (variables: IssueCreate, token: string) => Promise<false | IssueSuccess>;
export declare const updateAnIssue: (variables: IssueCreate, token: string) => Promise<false | IssueSuccess>;
export declare const getMe: ({ token }: {
    token: string;
}) => Promise<UserData>;
export declare const getTeams: ({ token }: {
    token: string;
}) => Promise<Partial<UserData['teams']>>;
export declare const getTeamsMembers: ({ token }: {
    token: string;
}) => Promise<Partial<UserData['teams']>>;
export declare const getTeamsTemplatesAndStates: ({ token }: {
    token: string;
}) => Promise<Partial<UserData['teams']>>;
export declare const getTeamsProjectsAndLabels: ({ token }: {
    token: string;
}) => Promise<Partial<UserData['teams']>>;
export declare const getTeamsAndCycles: ({ token }: {
    token: string;
}) => Promise<Partial<UserData['teams']>>;
export interface Priority {
    priority: 0 | 1 | 2 | 3 | 4;
    label: string;
}
export declare const getPriorityValues: ({ token }: {
    token: string;
}) => Promise<Priority[]>;
export declare const createAttachments: (variables: {
    title: string;
    url: string;
    issueId: string;
}, token: string) => Promise<boolean>;
export declare const getCycles: ({ token, teamId }: {
    token: string;
    teamId: string;
}) => Promise<CycleNode[]>;
export {};
