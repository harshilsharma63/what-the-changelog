import {spawn} from './spawn'
import {getLogLines} from './git'
import {convertToChangelog} from './parser'
import Config from "./config";

export async function run(): Promise<void> {
    await ensureGit();
    await ensureGitRepository();
    await ensureVersion(Config.previousVersion);

    const lines = await getLogLines(Config.previousVersion);
    const changelogEntries = await convertToChangelog(lines);
    console.log(changelogEntries)
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
