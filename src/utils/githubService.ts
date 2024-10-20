// src/utils/githubService.ts

import * as core from "@actions/core"
import * as github from "@actions/github"
import * as exec from "@actions/exec"
import { stringify } from "querystring";

// export async function validateAuthentication(): Promise<void> {
// 	const token = githubToken || core.getInput("github-token")
// 	if (!token) {
// 		throw new Error(
// 			"GITHUB_TOKEN is not available. Please ensure it is provided."
// 		)
// 	}
// }

// export async function cloneRepository(): Promise<void> {
// 	// Clone the repository if necessary
// 	// Assuming the repository is already checked out by actions/checkout
// 	core.info("Repository is already cloned by actions/checkout.")
// 	// If additional cloning is needed, implement the logic here
// }

export async function getChangedFiles(githubToken: string): Promise<string[]> {
	const eventName = github.context.eventName
    core.info(eventName);

	const changedFiles: string[] = []

	if (eventName === 'pull_request' || eventName === 'pull_request_target') {
		const baseSha = github.context.payload.pull_request?.base?.sha;
		const headSha = github.context.payload.pull_request?.head?.sha;
	
		if (!baseSha || !headSha) {
		  core.setFailed('Cannot determine changed files without "base" and "head" commits.');
		  throw new Error('Cannot determine changed files without "base" and "head" commits.');
		}
	
		let output = '';
		await exec.exec('git', ['diff', '--name-only', `${baseSha}`, `${headSha}`], {
		  listeners: {
			stdout: (data: Buffer) => {
			  output += data.toString();
			},
		  },
		});
	
		const files = output.trim().split('\n').filter((file) => file);
		changedFiles.push(...files);
	  } else if (eventName === "push") {
		// For push events, get the list of changed files using git
		const before = github.context.payload.before
		core.info(JSON.stringify(before));
		const after = github.context.payload.after
		core.info(JSON.stringify(after));

		if (!before || !after) {
			core.setFailed(
				'Cannot determine changed files without "before" and "after" commits.'
			)
			throw new Error(
				'Cannot determine changed files without "before" and "after" commits.'
			)
		}

		let output = ""
		await exec.exec("git", ["diff", "--name-only", `${before}`, `${after}`], {
			listeners: {
				stdout: (data: Buffer) => {
					output += data.toString()
				},
			},
		})

		const files = output
			.trim()
			.split("\n")
			.filter((file) => file)
		changedFiles.push(...files)
	} else {
		core.warning(`Event ${eventName} is not supported.`)
	}

	core.info(`Changed files: ${(changedFiles)}`)

	return changedFiles
}

export async function approveOrRejectPR(isApproved: boolean): Promise<void> {
	if (isApproved) {
		core.info("Analysis passed. The code can be merged.")
	} else {
		core.setFailed("Analysis failed. The code should not be merged.")
	}
}

export async function postComment(body: string, githubToken: string): Promise<void> {
	const token = githubToken || core.getInput("github-token")
	if (!token) {
		core.warning("GITHUB_TOKEN is not available. Cannot post comment.")
		return
	}

	const octokit = github.getOctokit(token)
	const context = github.context

	const issueNumber =
		context.payload.pull_request?.number || context.issue?.number
	if (!issueNumber) {
		core.warning("No pull request or issue number found in the context.")
		return
	}

	await octokit.rest.issues.createComment({
		owner: context.repo.owner,
		repo: context.repo.repo,
		issue_number: issueNumber,
		body,
	})
}
