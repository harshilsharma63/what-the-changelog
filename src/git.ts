import {spawn} from './spawn'

export async function getLogLines(version: string): Promise<ReadonlyArray<string>> {
    const log = await spawn('git', [
        'log',
        `...${version}`,
        '--merges',
        '--grep="Merge pull request"',
        '--format=format:%s',
        '-z',
        '--',
    ]);

    return log.length === 0 ? [] : log.split('\0')
}
