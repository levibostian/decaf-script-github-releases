#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Get the version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Download and install the binary
try {
    execSync(`curl -fsSL https://github.com/levibostian/decaf-script-github-releases/blob/HEAD/install?raw=true | bash -s "${version}" > /dev/null`, {
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
