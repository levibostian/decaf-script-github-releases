import {
  getLatestReleaseStepInput,
  GetLatestReleaseStepOutput,
  setLatestReleaseStepOutput
} from "jsr:@levibostian/decaf-sdk@0.2.1";
import $ from "jsr:@david/dax@0.43.2";

export const getLatestReleaseFromGitHubReleases = async (): Promise<GetLatestReleaseStepOutput | null> => {
  const input = getLatestReleaseStepInput();

  const latestGitTagCommit = input.gitCommitsCurrentBranch.filter((commit) => commit.tags?.length)[0]
  if (!latestGitTagCommit) {
    console.log("No git tags found on the current branch. Therefore, there has never been a release on this branch.");
    return null
  }

  const latestGitTag = latestGitTagCommit!.tags![0];

  console.log(`Latest git tag on the current branch is: ${latestGitTag}`);

  const latestReleasesGitHub: {
    name: string;
    tagName: string;
  }[] = await $`gh release list --exclude-drafts --order desc --json name,tagName`
      .json()

  if (!latestReleasesGitHub.length) {
    console.log(`No GitHub Releases found in the GitHub repository. Perhaps this is a mistake, since there is a git tag on the current branch but no GitHub Release for that tag? I suggest making a GitHub Release for the git tag, ${latestGitTag}, and then re-running the deployment.`);
    return null
  }

  const latestRelease = latestReleasesGitHub.find((release) => release.tagName === latestGitTag);

  if (!latestRelease) {
    console.log(`No GitHub Release found for the latest git tag on the current branch, ${latestGitTag}. Perhaps this is a mistake? I suggest making a GitHub Release for the git tag, ${latestGitTag}, and then re-running the deployment.`);
    return null
  }

  console.log(
    `latest release found: ${latestRelease.name} (${latestRelease.tagName})`,
  );

  const commitMatchingRelease = input.gitCommitsCurrentBranch.find((commit) => {
    return commit.tags?.includes(latestRelease.tagName);
  })!;

  console.log(
    `commit matching release found: ${commitMatchingRelease.title} (${commitMatchingRelease.sha})`,
  );

  return {
    versionName: latestRelease.name,
    commitSha: commitMatchingRelease.sha,
  }
}

if (import.meta.main) {
  const latestRelease = await getLatestReleaseFromGitHubReleases();
  if (latestRelease) {
    setLatestReleaseStepOutput(latestRelease);
  }
}