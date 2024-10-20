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
	// const wcagCriteriaPath = path.resolve(
	// 	__dirname,
	// 	"../constants/wcag-criteria.json"
	// )
	let wcagData: {[publicName: string]: any[]}
	try {
		// const data = fs.readFileSync(wcagCriteriaPath, "utf8")

		wcagData = {
      "totalBlindness": [
        {
          "id": "1.1.1",
          "name": "Non-text Content",
          "level": "A",
          "description": "Provide text alternatives for all non-text content."
        },
        {
          "id": "1.3.1",
          "name": "Information and Relationships",
          "level": "A",
          "description": "Ensure that information structure can be programmatically determined."
        },
        {
          "id": "2.1.1",
          "name": "Keyboard",
          "level": "A",
          "description": "All content must be operable via keyboard."
        },
        {
          "id": "3.3.2",
          "name": "Labels or Instructions",
          "level": "A",
          "description": "Provide descriptive labels for data inputs."
        },
        {
          "id": "4.1.2",
          "name": "Name, Role, Value",
          "level": "A",
          "description": "User interface components must have programmatically defined name, role, and value."
        }
      ]
    }
    
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
