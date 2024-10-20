"use strict";
// src/controller.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runController = void 0;
const core = __importStar(require("@actions/core"));
const service_1 = require("./analyzers/service");
async function runController(requirementsInput, geminiApiToken) {
    // Receive the inputs
    const requirements = parseRequirements(requirementsInput);
    // Perform validations
    const validationError = validateRequirements(requirements);
    if (validationError) {
        core.setFailed(validationError);
        return;
    }
    // If validations pass, call the service
    try {
        await (0, service_1.runService)(requirements, geminiApiToken);
    }
    catch (error) {
        core.setFailed(`Error during service execution: ${error.message}`);
    }
}
exports.runController = runController;
// Methods within this file
function parseRequirements(requirementsInput) {
    try {
        const requirements = JSON.parse(requirementsInput);
        return requirements;
    }
    catch (error) {
        return null;
    }
}
function validateRequirements(requirements) {
    if (!requirements) {
        return 'Invalid requirements input. It should be a valid JSON object with target audiences and required percentages.';
    }
    const validPublics = ['totalBlindness', 'lowVision', 'colorBlindness', 'motorImpairment', 'cognitiveDisability'];
    for (const [publicName, percentage] of Object.entries(requirements)) {
        if (!validPublics.includes(publicName)) {
            return `Invalid target audience: ${publicName}. Valid options are: ${validPublics.join(', ')}.`;
        }
        if (typeof percentage !== 'number' || percentage < 0 || percentage > 1) {
            return `Invalid percentage for ${publicName}. It should be a number between 0 and 1.`;
        }
    }
    return null; // No errors
}
//# sourceMappingURL=controller.js.map