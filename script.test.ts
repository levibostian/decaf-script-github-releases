import type {
  GetLatestReleaseStepInput,
  GetLatestReleaseStepOutput,
  GitCommit,
} from "@levibostian/decaf-sdk";
import { assertEquals } from "@std/assert"

// a decaf script test runner essentially. Copied from decaf: https://github.com/levibostian/decaf/blob/a0e324f7209c0f37b9d275b7259fcefd591a17c6/steps/get-next-release.test.ts#L4
// would be nice to put into decaf or the sdks in the future. 
async function runStep(input: GetLatestReleaseStepInput, mockGitHubReleases: {name: string; tagName: string}[]): Promise<{code: number; output: GetLatestReleaseStepOutput | null}> {
  // Write input to a temp file
  const tempFile = await Deno.makeTempFile()
  const inputFileContents = JSON.stringify(input)
  await Deno.writeTextFile(tempFile, inputFileContents)

  // Get absolute path to get-next-release.ts
  const scriptPath = new URL("./script.ts", import.meta.url).pathname

  const env: Record<string, string> = { 
    INPUT_GITHUB_TOKEN: "", 
    DATA_FILE_PATH: tempFile, 
    ...Deno.env.toObject() 
  };
  
  env.MOCK_GITHUB_RELEASES = JSON.stringify(mockGitHubReleases);

  const process = new Deno.Command("deno", {
    args: ["run", "--allow-all", scriptPath, "--config", JSON.stringify({})],
    env,
  })

  const child = process.spawn()
  const code = (await child.status).code
  const outputFileContents = await Deno.readTextFile(tempFile)
  let output: GetLatestReleaseStepOutput | null = null
  if (outputFileContents != inputFileContents) {
    output = JSON.parse(outputFileContents)
  }

  return { code, output }
}

Deno.test("given no tags on the current branch, expect null for latest release", async () => {
  const input: GetLatestReleaseStepInput = {
    gitCurrentBranch: "main",
    gitRepoOwner: "levibostian",
    gitRepoName: "decaf-script-github-releases",
    testMode: true,
    gitCommitsCurrentBranch: [
      {
        sha: "abc1",
        title: "Initial commit",
        tags: [],
        message: "Initial commit",
      },
      {
        sha: "abc2",
        title: "Add feature",
        tags: [],
        message: "Add feature",
      }
    ] as unknown as GitCommit[],
    gitCommitsAllLocalBranches: {}
  }

  const { code, output } = await runStep(input, [])

  assertEquals(code, 0)
  assertEquals(output, null)
})

Deno.test("given git tags exist and matching GitHub release exists, expect release info", async () => {
  const input: GetLatestReleaseStepInput = {
    gitCurrentBranch: "main",
    gitRepoOwner: "levibostian",
    gitRepoName: "decaf-script-github-releases",
    testMode: true,
    gitCommitsCurrentBranch: [
      {
        sha: "abc1",
        title: "Initial commit",
        tags: [],
        message: "Initial commit",
      },
      {
        sha: "abc2",
        title: "Release v1.0.0",
        tags: ["v1.0.0"],
        message: "Release v1.0.0",
      }
    ] as unknown as GitCommit[],
    gitCommitsAllLocalBranches: {}
  }

  const { code, output } = await runStep(input, [
    { name: "Release v1.0.0", tagName: "v1.0.0" },
    { name: "Release v0.9.0", tagName: "v0.9.0" }
  ])

  assertEquals(code, 0)
  assertEquals(output, {
    versionName: "Release v1.0.0",
    commitSha: "abc2"
  })
})

Deno.test("given multiple commits with tags, should use the first (latest) commit with tags", async () => {
  const input: GetLatestReleaseStepInput = {
    gitCurrentBranch: "main",
    gitRepoOwner: "levibostian",
    gitRepoName: "decaf-script-github-releases",
    testMode: true,
    gitCommitsCurrentBranch: [     
      {
        sha: "abc2",
        title: "Release v2.0.0",
        tags: ["v2.0.0"],
        message: "Release v2.0.0",
      },
      {
        sha: "abc3",
        title: "Release v1.0.0",
        tags: ["v1.0.0"],
        message: "Release v1.0.0",
      },
      {
        sha: "abc1",
        title: "Initial commit",
        tags: [],
        message: "Initial commit",
      },
    ] as unknown as GitCommit[],
    gitCommitsAllLocalBranches: {}
  }

  const { code, output } = await runStep(input, [
    { name: "Release v2.0.0", tagName: "v2.0.0" },
    { name: "Release v1.0.0", tagName: "v1.0.0" }
  ])

  assertEquals(code, 0)
  assertEquals(output, {
    versionName: "Release v2.0.0",
    commitSha: "abc2"
  })
})

Deno.test("given git tags exist but no GitHub releases, expect null", async () => {
  const input: GetLatestReleaseStepInput = {
    gitCurrentBranch: "main",
    gitRepoOwner: "levibostian",
    gitRepoName: "decaf-script-github-releases",
    testMode: true,
    gitCommitsCurrentBranch: [
      {
        sha: "abc1",
        title: "Initial commit",
        tags: [],
        message: "Initial commit",
      },
      {
        sha: "abc2",
        title: "Release v1.0.0",
        tags: ["v1.0.0"],
        message: "Release v1.0.0",
      }
    ] as unknown as GitCommit[],
    gitCommitsAllLocalBranches: {}
  }

  // Mock no GitHub releases
  const { code, output } = await runStep(input, [])

  assertEquals(code, 0)
  assertEquals(output, null)
})

Deno.test("given git tags exist and GitHub releases exist but no matching release for latest tag, expect null", async () => {
  const input: GetLatestReleaseStepInput = {
    gitCurrentBranch: "main",
    gitRepoOwner: "levibostian",
    gitRepoName: "decaf-script-github-releases",
    testMode: true,
    gitCommitsCurrentBranch: [
      {
        sha: "abc1",
        title: "Initial commit",
        tags: [],
        message: "Initial commit",
      },
      {
        sha: "abc2",
        title: "Release v2.0.0",
        tags: ["v2.0.0"],
        message: "Release v2.0.0",
      }
    ] as unknown as GitCommit[],
    gitCommitsAllLocalBranches: {}
  }

  // Mock GitHub releases that don't match the latest tag
  const mockReleases = [
    { name: "Release v1.0.0", tagName: "v1.0.0" },
    { name: "Release v1.1.0", tagName: "v1.1.0" }
  ];

  const { code, output } = await runStep(input, mockReleases)

  assertEquals(code, 0)
  assertEquals(output, null)
})

Deno.test("given on a maintenance branch with newer releases available on main branch, expect release matching latest tag on maintenance branch", async () => {
  const input: GetLatestReleaseStepInput = {
    gitCurrentBranch: "v1", // a maintenance branch
    gitRepoOwner: "levibostian",
    gitRepoName: "decaf-script-github-releases",
    testMode: true,
    gitCommitsCurrentBranch: [      
      {
        sha: "abc2",
        title: "Patch release v1.5.1",
        tags: ["v1.5.1"],
        message: "Patch release v1.5.1",
      },
      {
        sha: "abc1",
        title: "Initial v1 branch commit",
        tags: [],
        message: "Initial v1 branch commit",
      },
    ] as unknown as GitCommit[],
    gitCommitsAllLocalBranches: {}
  }

  // Mock GitHub releases including newer releases (v3.0.0, v2.0.0) but also the one matching our branch (v1.5.1)
  const mockReleases = [
    { name: "Release v3.0.0", tagName: "v3.0.0" }, // Newer release from main branch
    { name: "Release v2.5.0", tagName: "v2.5.0" }, // Another newer release
    { name: "Release v2.0.0", tagName: "v2.0.0" }, // Another newer release
    { name: "Release v1.5.1", tagName: "v1.5.1" }, // The one we want - matches our maintenance branch
    { name: "Release v1.5.0", tagName: "v1.5.0" }, // Older release on v1 branch
    { name: "Release v1.0.0", tagName: "v1.0.0" }  // Even older release
  ];

  const { code, output } = await runStep(input, mockReleases)

  assertEquals(code, 0)
  assertEquals(output, {
    versionName: "Release v1.5.1",
    commitSha: "abc2"
  })
})