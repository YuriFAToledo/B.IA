// src/index.ts

import * as core from '@actions/core';
import { runController } from './controller';

async function run() {
  try {
    // Collect inputs
    const requirementsInput = core.getInput('requirements', { required: true });
    const geminiApiToken = core.getInput('geminiApiToken', { required: true });
    const githubToken = core.getInput('githubToken', { required: true });

    // Call the controller with the inputs
    await runController(requirementsInput, geminiApiToken, githubToken);

  } catch (error: any) {
    if (error instanceof Error) {
      core.setFailed(`Action failed with error: ${error.message}`);
    } else {
      core.setFailed('Action failed with an unknown error.');
    }
  }
}

run();
