#!/usr/bin/env node

import {run} from './run';
import Conf from './config';

if (!process.env.GITHUB_ACCESS_TOKEN) {
    console.log('You need to provide a GITHUB_ACCESS_TOKEN environment variable');
    process.exit(1);
}

process.on('unhandledRejection', (error) => {
    console.error(error.message);
});

parseArgs();
run();

function parseArgs() {
    const args = process.argv.splice(2);
    Conf.officialOwner = args[0];
    Conf.repositoryName = args[1];
    Conf.projectDir = args[2];
    Conf.order = args[3].split(',');
    Conf.resolutionIconRoot = args[4];
    Conf.currentTag = args[5];
    Conf.previousTag = args[6];
}
