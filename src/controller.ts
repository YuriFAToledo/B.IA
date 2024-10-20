// src/controller.ts

import * as core from "@actions/core"
import {runService} from "./analyzers/service"

export async function runController(
	requirementsInput: string,
	geminiApiToken: string,
	githubToken: string
): Promise<void> {
	core.info("cheguei runController")
	core.info("parseRequirements")

	// Receive the inputs
	const requirements = parseRequirements(requirementsInput)
	core.info("passei pelo parseRequirements")
	core.info("vou atrás do validateRequirements")

	// Perform validations
	const validationError = validateRequirements(requirements)
	if (validationError) {
		core.setFailed(validationError)
		return
	}

	// If validations pass, call the service
	try {
		core.info("vou chamar o runService");

		await runService(requirements, geminiApiToken, githubToken)
	} catch (error: any) {
		core.setFailed(`Error during service execution: ${error.message}`)
	}
}

// Methods within this file

function parseRequirements(requirementsInput: string): {
	[publicName: string]: number
} {
	core.info("entrei parseRequirements")
	try {
		const requirements = JSON.parse(requirementsInput)
		return requirements
	} catch (error: any) {
		core.info("Error parsing requirements input. Returning a default value.")
		core.setFailed(error.message)
		return {fafa: 1}
	}
}

function validateRequirements(
	requirements: {[publicName: string]: number} | null
): string | null {
	if (!requirements) {
		return "Invalid requirements input. It should be a valid JSON object with target audiences and required percentages."
	}

	const validPublics = [
		"totalBlindness",
		"lowVision",
		"colorBlindness",
		"motorImpairment",
		"cognitiveDisability",
	]

	for (const [publicName, percentage] of Object.entries(requirements)) {
		if (!validPublics.includes(publicName)) {
			return `Invalid target audience: ${publicName}. Valid options are: ${validPublics.join(
				", "
			)}.`
		}
		if (typeof percentage !== "number" || percentage < 0 || percentage > 1) {
			return `Invalid percentage for ${publicName}. It should be a number between 0 and 1.`
		}
	}

	return null // No errors
}
