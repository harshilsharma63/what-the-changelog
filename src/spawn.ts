import * as ChildProcess from 'child_process'

const Config = require('./config.json');

export function spawn(cmd: string, args: Array<string>): Promise<string> {
    return new Promise((resolve, reject) => {
        args.unshift(`-C ${Config.projectDir}`);

        const child = ChildProcess.spawn(cmd, args as string[], {shell: true});
        child.on('error', reject);

        let receivedData = '';
        child.stdout.on('data', data => {
            receivedData += data
        });

        child.on('close', (code, signal) => {
            if (code === 0) {
                resolve(receivedData)
            } else {
                reject(new Error(`'${cmd} ${args.join(' ')}' exited with code ${code}, signal ${signal}`))
            }
        })
    })
}
