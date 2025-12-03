#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const devBuild = join(__dirname, '../lib/dev.js');
const prodBuild = join(__dirname, '../lib/prod.js');

if (process.argv[2] === 'dev') {
    spawn('node', [devBuild], {
        stdio: 'inherit'
    });
} else if (process.argv[2] === 'build') {
    spawn('node', [prodBuild], {
        stdio: 'inherit'
    });
} else {
    console.log('Error: Use phyre[dev|build]')
    process.exit(1);
};