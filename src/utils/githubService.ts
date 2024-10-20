// src/utils/githubService.ts

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as exec from '@actions/exec';

export async function validateAuthentication(): Promise<void> {
  const token = process.env.GITHUB_TOKEN || core.getInput('github-token');
  if (!token) {
    throw new Error('GITHUB_TOKEN is not available. Please ensure it is provided.');
  }
}

export async function cloneRepository(): Promise<void> {
  // Clone the repository if necessary
  // Assuming the repository is already checked out by actions/checkout
  core.info('Repository is already cloned by actions/checkout.');
  // If additional cloning is needed, implement the logic here
}

export async function getChangedFiles(): Promise<string[]> {
  let output = '';
  await exec.exec('git', ['diff', '--name-only', 'HEAD^', 'HEAD'], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  });

  const files = output.trim().split('\n').filter(file => file);
  return files;
}

export async function approveOrRejectPR(isApproved: boolean): Promise<void> {
  if (isApproved) {
    core.info('Analysis passed. The code can be merged.');
  } else {
    core.setFailed('Analysis failed. The code should not be merged.');
  }
}

export async function postComment(body: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN || core.getInput('github-token');
  if (!token) {
    core.warning('GITHUB_TOKEN is not available. Cannot post comment.');
    return;
  }

  const octokit = github.getOctokit(token);
  const context = github.context;

  const issueNumber = context.payload.pull_request?.number || context.issue?.number;
  if (!issueNumber) {
    core.warning('No pull request or issue number found in the context.');
    return;
  }

  await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    body,
  });
}
