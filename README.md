# Decaf Script - GitHub Releases

A [decaf](https://github.com/levibostian/decaf) script for handling GitHub releases in continuous deployment workflows.

## What does this script do?

This script provides functionality to:

1. **Get the latest release** - Finds the most recent GitHub Release that matches a git tag on the current branch
2. **Validate release state** - Ensures that git tags have corresponding GitHub Releases
3. **Export functions** - Can be used as a library or standalone script

## Usage

### As a decaf script

This script is designed to be used with the [decaf](https://github.com/levibostian/decaf) deployment automation tool. When you install decaf and configure it to use this script, it will:

1. Check for the latest release on your current branch
2. Find the corresponding git commit
3. Provide this information to decaf for further deployment steps

### As a library

You can also import and use the functions directly:

```typescript
import { getLatestReleaseFromGitHubReleases } from "@levibostian/decaf-script-github-releases";

const latestRelease = await getLatestReleaseFromGitHubReleases();
if (latestRelease) {
  console.log(`Latest release: ${latestRelease.versionName}`);
  console.log(`Commit SHA: ${latestRelease.commitSha}`);
}
```
