export interface IParsedCommit {
    readonly prID: number;
    readonly owner: string;
}

export interface IAPIPR {
    title: string;
    body: string;
    description: string;
    issueID: string;
}

export interface IAPIIssue {
    labels: {
        nodes: {
            name: string
        }[]
    };
}

export interface IPRDescComp {
    description: string;
    issueID: string;
}

export interface GraphQLResponse {
    readonly data: {
        readonly repository: {
            readonly pullRequest: IAPIPR
        },
    };
    readonly errors: {
        type: string
        path: string
        locations: string
        message: string
    }[];
}

export interface Change {
    resolution: string;
    description: string;
    issueRef: string;
    attribution: string;
}

export interface Config {
    officialOwner: string;
    repositoryName: string;
    projectDir: string;
    order: Array<string>;
    resolutionIconRoot: string;
    currentTag: string;
    previousTag: string;
}
