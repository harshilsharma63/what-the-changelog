import {spawn} from './spawn';
import {getLogLines} from './git';
import {convertToChangelog} from './parser';
import Config from "./config";
import { rsort } from 'semver';

export async function run(): Promise<void> {
    await ensureGit();
    await ensureGitRepository();
    const sortedTags = await getVersions();
    if (!Config.currentTag || Config.currentTag === undefined) {
        console.error('Please provide current tag');
        process.exit(1);
    }
    const currentIndex = await sortedTags.indexOf(Config.currentTag.substr(1));
    if(currentIndex === -1) {
        console.error('Invalid current tag');
        process.exit(1);
    }
    if (Config.previousTag) {
        const previousIndex = await sortedTags.indexOf(Config.previousTag.substr(1));
        if (previousIndex === -1) {
            console.error('Invalid previous tag');
            process.exit(1);
        } else if (previousIndex <= currentIndex) {
            console.error('Previous tag should be less than current tag');
            process.exit(1);
        }
    }
    if(!Config.previousTag) {
        if (currentIndex < (sortedTags.length-1)) {
            Config.previousTag = ('v' + sortedTags[currentIndex+1]);
        } else {
            Config.previousTag = Config.currentTag;
            Config.currentTag = '';
        }     
    }
    const lines = await getLogLines(Config.currentTag, Config.previousTag);
    const changelogEntries = await convertToChangelog(lines);

    console.log(changelogEntries);
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
