import * as ChildProcess from 'child_process';
import Conf from './config';

export function spawn(cmd: string, args: Array<string>): Promise<string> {
    return new Promise((resolve, reject) => {
        args.unshift(`-C ${Conf.projectDir}`);

        const child = ChildProcess.spawn(cmd, args as string[], {shell: true});
        child.on('error', reject);

        let receivedData = '';
        child.stdout.on('data', data => {
            receivedData += data;
        });

        child.on('close', (code, signal) => {
            if (code === 0) {
                resolve(receivedData);
            } else {
                reject(new Error(`'${cmd} ${args.join(' ')}' exited with code ${code}, signal ${signal}`));
            }
        });
    });
}
