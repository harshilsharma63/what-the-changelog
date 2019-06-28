import {spawn} from './spawn';

export async function getLogLines(currentTag: string, previousTag: string): Promise<ReadonlyArray<string>> {
    currentTag = currentTag ? '..' + currentTag : '';
    const log = await spawn('git', [
        'log',
        '--merges',
        '--grep="Merge pull request"',
        '--format=format:%s',
        `${previousTag}${currentTag}`,
        '-z',
        '--',
    ]);
    return log.length === 0 ? [] : log.split('\0');
}
