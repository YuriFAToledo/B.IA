import * as fs from "fs"
import * as path from "path"
import * as core from '@actions/core';
import {ICriteria} from "../analyzers/geminiService"
import { stringify } from "querystring";

export interface IRequirements {
	[publicName: string]: number
}

export function getWcagCriteria(
	requirements: IRequirements
): Array<{publicName: string; criterias: ICriteria[]; value: number}> {

  core.info(stringify(requirements))

	// Parse the requirements string into an object
	// Load the wcag-criteria.json file
	const wcagCriteriaPath = path.resolve(
		__dirname,
		"../constants/wcag-criteria.json"
	)
	let wcagData: {[publicName: string]: any[]}
	try {
		const data = fs.readFileSync(wcagCriteriaPath, "utf8")
		wcagData = JSON.parse(data)
	} catch (error) {
    core.setFailed("Error reading wcag-criteria.json file.")
		throw new Error("Error reading wcag-criteria.json file.")
	}

	// Build the result array
	const result: Array<{
		publicName: string
		criterias: ICriteria[]
		value: number
	}> = []

	for (const publicName of Object.keys(requirements)) {
		const value = requirements[publicName]
		const criterias = wcagData[publicName] || []
		const publicObj = {
			publicName: publicName,
			criterias: criterias,
			value: value,
		}
		result.push(publicObj)
	}

	return result
}
