#!/usr/bin/env node

import { execSync } from 'node:child_process';

// Download and install the binary
try {
    execSync('curl -fsSL https://github.com/levibostian/decaf-script-github-releases/blob/HEAD/install?raw=true | bash -s "0.2.0" > /dev/null', {
        stdio: 'inherit',
        cwd: process.cwd()
    });
} catch (error) {
    console.error('Failed to download binary:', error.message);
    process.exit(1);
}

// Run the binary
const binaryPath = './decaf-script-github-releases';
try {
    execSync(binaryPath, {
        stdio: 'inherit',
        cwd: process.cwd()
    });
} catch (error) {
    console.error('Failed to run binary:', error.message);
    process.exit(1);
}
