import {fetchIssue, fetchPR} from './api';
import {capitalized} from './util';
import {Change, IAPIPR, IParsedCommit} from './interfaces';
import Conf from './config';

// E.g.: Merge pull request #2424 from desktop/fix-shrinkwrap-file
const mergeCommitRegex = /^Merge pull request #(\d+) from (.+?)\/.*$/;

export const prTitleIssueRegex = /#.+-.+/;

const resolutionLabelPrefix = 'resolution:';

export async function convertToChangelog(lines: ReadonlyArray<string>): Promise<string> {
    const entries = [];
    for (const line of lines) {
        const commit = parseCommitTitle(line);
        const pr = await fetchPR(commit);
        if (!pr) {
            throw new Error(`Unable to get PR from API: ${commit.prID}`);
        }

        const entry = await getChangelogEntry(commit, pr);
        entries.push(entry);
    }

    return getReleaseNotes(entries);
}

function getReleaseNotes(changes: ReadonlyArray<Change>): string {
    const taskGroups: { [id: string]: Change[] } = {};
    changes.forEach(c => {
        if (taskGroups[c.resolution] === undefined) {
            taskGroups[c.resolution] = [];
        }

        taskGroups[c.resolution].push(c);
    });

    let releaseNotes = '# Changelog\n\n';

    for (let i = 0; i < Conf.order.length; ++i) {
        const section = Conf.order[i];

        if (!taskGroups.hasOwnProperty(section)) {
            continue;
        }

        if (i !== 0) {
            releaseNotes += '###\n';
        }

        for (const change of taskGroups[section]) {
            // tslint:disable-next-line
            releaseNotes += `<img src="${Conf.resolutionIconRoot}/${section}.png?raw=true" width="70px"> ${change.description} -${change.issueRef}${change.attribution}\n`;
        }

        releaseNotes += '\n';
    }

    return releaseNotes;
}

async function getChangelogEntry(commit: IParsedCommit, pr: IAPIPR): Promise<Change> {
    const resolution = await getResolution(pr.issueID);
    const description = capitalized(pr.description);
    const issueRef = `#${pr.issueID}`;
    const attribution = getAttribution(commit);

    return {
        resolution,
        description,
        issueRef,
        attribution
    } as Change;
}

function getAttribution(commit: IParsedCommit): string {
    let attribution = '';
    if (commit.owner !== Conf.officialOwner) {
        attribution = `. Thanks @${commit.owner}!`;
    }
    return attribution;
}

function parseCommitTitle(line: string): IParsedCommit {
    const matches = line.match(mergeCommitRegex);
    if (!matches || matches.length !== 3) {
        throw new Error(`Unable to parse '${line}'`);
    }

    const id = parseInt(matches[1], 10);
    if (isNaN(id)) {
        throw new Error(`Unable to parse PR number from '${line}': ${matches[1]}`);
    }

    return {
        prID: id,
        owner: matches[2],
    };
}

async function getResolution(issueId: string): Promise<string> {
    const issue = await fetchIssue(issueId);
    if (!issue) {
        throw Error(`Couldn't fetch issue ${issueId}`);
    }

    let resolution = '';
    for (const label of issue.labels.nodes) {
        if (label.name.startsWith(resolutionLabelPrefix)) {
            resolution = label.name.substr(resolutionLabelPrefix.length);
            break;
        }
    }

    if (resolution === '') {
        throw Error(`No resolution found for issue #GH-${issueId}`);
    }

    return resolution;
}
