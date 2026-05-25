# decaf Script - GitHub Releases

A script specifically designed for the [decaf](https://github.com/levibostian/decaf) deployment automation tool. This script helps you work with GitHub Releases in your continuous deployment workflows. This script can be used to tret GitHub Releases as the single source of truth for determining the latest release version and to create new releases as part of your deployment process.

## What does this script do?

If you use GitHub's Releases feature to store and track the versions that you deploy, this script is for you. When you run decaf and need to specify where to determine successful releases, this script provides that functionality.

This script provides functionality to:

1. **Get the latest release** - Finds the most recent GitHub Release that matches a git tag on the current branch
2. **Set/create a release** - Creates a new GitHub Release with configurable options

# Getting Started

Run using decaf's `shebang` command in your deployment workflow.

**GitHub Actions Example**

```yaml
- uses: levibostian/decaf
  with:
    get_latest_release_current_branch: decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> get
    deploy: |
      # your deployment scripts here...
      # at some point (if using GitHub Releases as single source of truth run at the very end) create a new release with the script
      decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> set
    # Other decaf arguments...
```

Replace `<version-here>` with a [release](https://github.com/levibostian/decaf-script-github-releases/releases). Latest: ![GitHub Release](https://img.shields.io/github/v/release/levibostian/decaf-script-github-releases)

**Command Line Example**

```bash
decaf \
  --get-latest-release-current-branch "decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> get" \
  --deploy "your-script-here && decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> set"
```

> Note: Replace `your-script-here` with whatever commands you need to run as part of the deployment process before creating the release. Be sure to run the script *last* because once you create the release, decaf will consider the deployment successful and if you re-run decaf, it will not attempt to re-attempt the deployment.

# Commands

### Get Latest Release

In your *get latest release* script for decaf, use the `get` (or `get-latest-release`) command to fetch the latest GitHub Release for the current branch. 

If your GitHub repository...
- ...has a newer git tag then the latest release, this script will return the release, not the tag. 
- ...has no releases, it will return nothing, indicating that there is no latest release. 
- ...has newer GitHub Releases then the current branch's latest git tag, it will return the older GitHub Release that matches the latest git tag on the current branch.

Example usage:

```bash 
decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> get
```

### Set/Create Release

In your *deploy* script for decaf, use the `set` (or `set-latest-release`) command to create a new GitHub Release for the current branch.

When you run this command, it will:
- Create a new GitHub Release using the new version determined by the decaf get next release version script 
- Upload any assets that you created if you called the `set-assets` command beforehand

Example usage:

```bash
# Use the default settings to create the release
decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> set

# Or, with custom GitHub CLI arguments
decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> set --draft --target {{gitCurrentBranch}}
```

### Set GitHub Release Assets

In your *deploy* script for decaf, use the `set-assets` (or `set-github-release-assets`) command to specify files that should be uploaded when creating a GitHub Release (when you call `set` command).

This command allows you to:
- Specify multiple files to upload as release assets
- Set custom display names for each asset

Example usage:

```bash
# After your deployment script runs, set the assets to upload. 
# Each asset follows the format: `"path/to/file#Display Name"`
decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> set-assets "dist/binary-linux#Linux Binary" "dist/binary-mac#Mac Binary"

# Then create the release (it will automatically include the assets)
decaf shebang git@github.com:levibostian/decaf-script-github-releases.git/shebang.sh@<version-here> set
```


