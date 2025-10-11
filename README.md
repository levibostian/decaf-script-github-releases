# decaf Script - GitHub Releases

A script specifically designed for the [decaf](https://github.com/levibostian/decaf) deployment automation tool. This script helps you work with GitHub Releases in your continuous deployment workflows.

**Important**: This is exclusively for use with decaf. You must use decaf to utilize this script - it's not a standalone tool for general use.

## What does this script do?

If you use GitHub's Releases feature to store and track the versions that you deploy, this script is for you. When you run decaf and need to specify where to determine successful releases, this script provides that functionality.

This script provides functionality to:

1. **Get the latest release** - Finds the most recent GitHub Release that matches a git tag on the current branch
2. **Validate release state** - Ensures that git tags have corresponding GitHub Releases

## Getting Started

**No installation required!** We just need to tell decaf how to run this script. 

Doesn't matter how you run decaf (GitHub Actions or CLI), for the *`get_latest_release_current_branch`* argument, you just need to specify how to run it.

```yaml
- uses: levibostian/decaf
  with:
    get_latest_release_current_branch: npx @levibostian/decaf-script-github-releases
    # Other decaf arguments...
```

The above example uses `npx` and is arguably the easiest way to run the script. But, you have a few other options too: 

1. Run with Deno (requires Deno installed)

```yaml
get_latest_release_current_branch: deno run --allow-all --quiet jsr:@levibostian/decaf-script-github-releases
```

2. Run as a compiled binary

Great option that doesn't depend on node or deno. This just installs a binary from GitHub and runs it for your operating system.

```yaml
# Reminder: replace "0.1.0" with the latest version of the script
get_latest_release_current_branch: curl -fsSL https://github.com/levibostian/decaf-script-github-releases/blob/HEAD/install?raw=true | bash -s "0.1.0" && ./decaf-script-github-releases

# Or, always run the latest version (less stable, but always up-to-date)
get_latest_release_current_branch: curl -fsSL https://github.com/levibostian/decaf-script-github-releases/blob/HEAD/install?raw=true | bash && ./decaf-script-github-releases
```

That's it! decaf will handle the execution and use the results in your deployment workflow.