import {spawn} from './spawn'
import {getLogLines} from './git'
import {convertToChangelog} from './parser'

export async function run(args: ReadonlyArray<string>): Promise<void> {
    await ensureGit();
    await ensureGitRepository();
    ensureArgs(args);

    const previousVersion = args[0];
    await ensureVersion(previousVersion);

    const lines = await getLogLines(previousVersion);
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

function ensureArgs(args: ReadonlyArray<string>) {
    if (args.length === 0) {
        throw new Error('No tag specified to use as a starting point.')
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
