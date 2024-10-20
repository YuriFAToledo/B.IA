"use strict";
// // src/controller.ts
// import * as core from '@actions/core';
// import { validateRequirementsInput } from './utils/wcagService';
// import { runService } from './analyzers/service';
// export async function runController(requirementsInput: string, geminiApiToken: string): Promise<void> {
//   // Receive the inputs
//   const requirements = parseRequirements(requirementsInput);
//   // Perform validations
//   const validationError = validateRequirements(requirements);
//   if (validationError) {
//     core.setFailed(validationError);
//     return;
//   }
//   // If validations pass, call the service
//   try {
//     await runService(requirements, geminiApiToken);
//   } catch (error: any) {
//     core.setFailed(`Error during service execution: ${error.message}`);
//   }
// }
// // Methods within this file
// function parseRequirements(requirementsInput: string): { [publicName: string]: number } | null {
//   try {
//     const requirements = JSON.parse(requirementsInput);
//     return requirements;
//   } catch (error) {
//     return null;
//   }
// }
// function validateRequirements(requirements: { [publicName: string]: number } | null): string | null {
//   if (!requirements) {
//     return 'Invalid requirements input. It should be a valid JSON object with target audiences and required percentages.';
//   }
//   const validPublics = ['totalBlindness', 'lowVision', 'colorBlindness', 'motorImpairment', 'cognitiveDisability'];
//   for (const [publicName, percentage] of Object.entries(requirements)) {
//     if (!validPublics.includes(publicName)) {
//       return `Invalid target audience: ${publicName}. Valid options are: ${validPublics.join(', ')}.`;
//     }
//     if (typeof percentage !== 'number' || percentage < 0 || percentage > 1) {
//       return `Invalid percentage for ${publicName}. It should be a number between 0 and 1.`;
//     }
//   }
//   return null; // No errors
// }
