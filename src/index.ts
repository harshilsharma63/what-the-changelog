#!/usr/bin/env node

import {run} from "./run";
import Conf from './config';

if (!process.env.GITHUB_ACCESS_TOKEN) {
    console.log('You need to provide a GITHUB_ACCESS_TOKEN environment variable');
    process.exit(1)
}

process.on('unhandledRejection', error => {
    console.error(error.message)
});

parseArgs();
run();

function parseArgs() {
    const args = process.argv.splice(2);
    Conf.previousVersion = args[0];
    Conf.officialOwner = args[1];
    Conf.repositoryName = args[2];
    Conf.projectDir = args[3];
    Conf.order = args[4].split(',');
    Conf.resolutionIconRoot = args[5];
}
