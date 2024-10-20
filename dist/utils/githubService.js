"use strict";
// src/utils/githubService.ts
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
exports.postComment = exports.approveOrRejectPR = exports.getChangedFiles = exports.cloneRepository = exports.validateAuthentication = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const exec = __importStar(require("@actions/exec"));
async function validateAuthentication() {
    const token = process.env.GITHUB_TOKEN || core.getInput('github-token');
    if (!token) {
        throw new Error('GITHUB_TOKEN is not available. Please ensure it is provided.');
    }
}
exports.validateAuthentication = validateAuthentication;
async function cloneRepository() {
    // Clone the repository if necessary
    // Assuming the repository is already checked out by actions/checkout
    core.info('Repository is already cloned by actions/checkout.');
    // If additional cloning is needed, implement the logic here
}
exports.cloneRepository = cloneRepository;
async function getChangedFiles() {
    let output = '';
    await exec.exec('git', ['diff', '--name-only', 'HEAD^', 'HEAD'], {
        listeners: {
            stdout: (data) => {
                output += data.toString();
            },
        },
    });
    const files = output.trim().split('\n').filter(file => file);
    return files;
}
exports.getChangedFiles = getChangedFiles;
async function approveOrRejectPR(isApproved) {
    if (isApproved) {
        core.info('Analysis passed. The code can be merged.');
    }
    else {
        core.setFailed('Analysis failed. The code should not be merged.');
    }
}
exports.approveOrRejectPR = approveOrRejectPR;
async function postComment(body) {
    var _a, _b;
    const token = process.env.GITHUB_TOKEN || core.getInput('github-token');
    if (!token) {
        core.warning('GITHUB_TOKEN is not available. Cannot post comment.');
        return;
    }
    const octokit = github.getOctokit(token);
    const context = github.context;
    const issueNumber = ((_a = context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number) || ((_b = context.issue) === null || _b === void 0 ? void 0 : _b.number);
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
exports.postComment = postComment;
//# sourceMappingURL=githubService.js.map