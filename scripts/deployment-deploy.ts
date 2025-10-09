#!/usr/bin/env -S deno run --quiet --allow-all --no-lock

import $ from "@david/dax";
import { getDeployStepInput } from "@levibostian/decaf-sdk"

const input = getDeployStepInput()

const githubReleaseAssets: string[] = []

const compileBinary = async ({ denoTarget, outputFileName }: { denoTarget: string; outputFileName: string }) => {
  // Create dist directory if it doesn't exist
  await $`mkdir -p dist`.printCommand()
  await $`OUTPUT_FILE_NAME=dist/${outputFileName} DENO_TARGET=${denoTarget} deno task compile`.printCommand()

  githubReleaseAssets.push(`dist/${outputFileName}#${outputFileName}`)
}

// Compile binaries for different platforms
await compileBinary({
  denoTarget: "x86_64-unknown-linux-gnu",
  outputFileName: "bin-x86_64-Linux",
})

await compileBinary({
  denoTarget: "aarch64-unknown-linux-gnu",
  outputFileName: "bin-aarch64-Linux",
})

await compileBinary({
  denoTarget: "x86_64-apple-darwin",
  outputFileName: "bin-x86_64-Darwin",
})

await compileBinary({
  denoTarget: "aarch64-apple-darwin",
  outputFileName: "bin-aarch64-Darwin",
})

// Publish the deno module to jsr
const argsToDenoPublish = [
  "publish",
  "--set-version",
  input.nextVersionName,
  "--allow-dirty"
]

if (input.testMode) {
  argsToDenoPublish.push("--dry-run")
}

// https://github.com/dsherret/dax#providing-arguments-to-a-command
await $`deno ${argsToDenoPublish}`.printCommand()

// GitHub Release with binaries
const argsToCreateGithubRelease = [
  `release`,
  `create`,
  input.nextVersionName,
  `--generate-notes`,
  `--latest`,
  `--target`,
  'main',
  ...githubReleaseAssets,
]

if (input.testMode) {
  console.log("Running in test mode, skipping creating GitHub release.")
  console.log(`Command to create GitHub release: gh ${argsToCreateGithubRelease.join(" ")}`)
} else {
  await $`gh ${argsToCreateGithubRelease}`.printCommand()
}
