import {spawn} from './spawn'
import {getLogLines} from './git'
import {convertToChangelog} from './parser'
import Config from "./config";
import { rsort } from 'semver'

export async function run(): Promise<void> {
    await ensureGit();
    await ensureGitRepository();

    const lines = await getLogLines(Config.sourceTag);
    const changelogEntries = await convertToChangelog(lines);

    console.log(changelogEntries)
}

async function getVersions(): Promise<Array<string>> {
    const allTags = await spawn('git', ['tag'])
    const releaseTags = allTags
        .split('\n')
        .filter(tag => tag.startsWith('v'))
        .map(tag => tag.substr(1));

    return rsort(releaseTags);
}

async function ensureGit() {
    try {
        await spawn('git', ['--version'])
    } catch {
        throw new Error('Unable to find Git on your PATH, aborting...')
    }
}

async function ensureGitRepository() {
    try {
        await spawn('git', ['rev-parse', '--show-cdup'])
    } catch {
        throw new Error(
            `The current directory '${process.cwd()}' is not a Git repository, aborting...`
        )
    }
}

async function ensureVersion(version: string) {
    try {
        await spawn('git', ['rev-parse', version])
    } catch {
        throw new Error(
            `Unable to find ref '${version}' in your repository, aborting...`
        )
    }
}
