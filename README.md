# decaf Script - GitHub Releases

A script specifically designed for the [decaf](https://github.com/levibostian/decaf) deployment automation tool. This script helps you work with GitHub Releases in your continuous deployment workflows.

**Important**: This is exclusively for use with decaf. You must use decaf to utilize this script - it's not a standalone tool for general use.

## What does this script do?

If you use GitHub's Releases feature to store and track the versions that you deploy, this script is for you. When you run decaf and need to specify where to determine successful releases, this script provides that functionality.

This script provides functionality to:

1. **Get the latest release** - Finds the most recent GitHub Release that matches a git tag on the current branch
2. **Set/create a release** - Creates a new GitHub Release with configurable options

## Commands

### Get Latest Release (Default)
```bash
# These are all equivalent
script.ts
script.ts get
script.ts get-latest-release
```

### Set/Create Release
```bash
# Create release with default settings
script.ts set
script.ts set-latest-release

# Create release with custom arguments
script.ts set --generate-notes --latest --target main
script.ts set --draft --notes "Custom release notes"
```

## Getting Started

**No installation required!** We just need to tell decaf how to run this script (via `npx`, `deno`, or a compiled binary).

Here are some simple examples for how to run this script with decaf on GitHub Actions or from the command line.

**GitHub Actions Example**

```yaml
- uses: levibostian/decaf
  with:
    get_latest_release_current_branch: npx @levibostian/decaf-script-github-releases get
    deploy: your-script-here && npx @levibostian/decaf-script-github-releases set
    # Other decaf arguments...
```

**Command Line Example**

```bash
decaf \
  --get-latest-release-current-branch "npx @levibostian/decaf-script-github-releases get" \
  --deploy "your-script-here && npx @levibostian/decaf-script-github-releases set"
```

> Note: Replace `your-script-here` with whatever commands you need to run as part of the deployment process before creating the release. Be sure to run the script *last* because once you create the release, decaf will consider the deployment successful and if you re-run decaf, it will not attempt to re-attempt the deployment.

### Alternative Installation Methods

The above examples use `npx` and are arguably the easiest way to run the script. But, you have a few other options too: 

1. **Run with Deno** (requires Deno installed)

```yaml
get_latest_release_current_branch: deno run --allow-all --quiet jsr:@levibostian/decaf-script-github-releases get
deploy: deno run --allow-all --quiet jsr:@levibostian/decaf-script-github-releases set
```

2. **Run as a compiled binary**

Great option that doesn't depend on node or deno. This just installs a binary from GitHub and runs it for your operating system.

```yaml
get_latest_release_current_branch: curl -fsSL https://github.com/levibostian/decaf-script-github-releases/blob/HEAD/install?raw=true | bash -s "0.1.0" && ./decaf-script-github-releases get
deploy: curl -fsSL https://github.com/levibostian/decaf-script-github-releases/blob/HEAD/install?raw=true | bash -s "0.1.0" && ./decaf-script-github-releases set

# Or, always run the latest version (less stable, but always up-to-date)
get_latest_release_current_branch: curl -fsSL https://github.com/levibostian/decaf-script-github-releases/blob/HEAD/install?raw=true | bash && ./decaf-script-github-releases get
```

### Using Aliases

For convenience, you can also use these aliases:

```bash
# Instead of 'get', you can use:
get-latest-release

# Instead of 'set', you can use:
set-latest-release
```

### GitHub Release Options

When creating new releases, this script just runs the GitHub CLI under the hood. The script will use a set of default options to create the release, but you can customize it by passing any additional arguments that the GitHub CLI supports.

Example: 

```bash
# All arguments that you add after 'set' will be passed to the GitHub CLI
npx @levibostian/decaf-script-github-releases set --draft --target {{gitCurrentBranch}}
```

### GitHub Release Assets

If you want to upload assets with the GitHub Release, you can provide paths to those assets as output of your own deployment script.

It's a little hacky at the moment because decaf doesn't have this feature built-in at the moment, but you can append custom JSON data to provide to this script like this: 

```typescript
// In order for the github release deployment script to be able to create a release with these assets, we need to update the input object to include them.
const outputFileForDeployment = JSON.parse(new TextDecoder("utf-8").decode(Deno.readFileSync(Deno.env.get("DATA_FILE_PATH")!)));
outputFileForDeployment["@levibostian/decaf-script-github-releases"]["githubReleaseAssets"] = githubReleaseAssets

// Write the updated input back to the file so that the deployment script can read it.
Deno.writeFileSync(Deno.env.get("DATA_FILE_PATH")!, new TextEncoder().encode(JSON.stringify(outputFileForDeployment)))
```

This is Deno typescript code, but the concept is the same in any language. Parse the JSON file located at file path specified in the `DATA_FILE_PATH` environment variable, add a key with the name of this package (`@levibostian/decaf-script-github-releases`), and then add a `githubReleaseAssets` array to that object. The value of that array should be strings with the format: `"<path-to-asset>#<name-of-asset>"`. Lastly, write the updated JSON back to the same file path.

See the file `script/deployment-deploy.ts` in this repository for a complete example of how to do this.

