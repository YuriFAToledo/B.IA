// main service

import {getFileContent} from "../utils/fileService"
import {approveOrRejectPR, getChangedFiles} from "../utils/githubService"
import {getWcagCriteria, IRequirements} from "../utils/wcagService"
import {IEvaluationReturn, runEvaluations} from "./geminiService"

export async function runService(
	requirements: IRequirements,
	geminiApiToken: string
): Promise<void> {
	const publicos = getWcagCriteria(requirements)

	const paths = await getChangedFiles()

	let codeStr: string = ""

	for (const path of paths) {
		const fileContent = await getFileContent(path)
		codeStr += fileContent[path]
	}

	const evaluations: IEvaluation[] = []

	for (const publico of publicos) {
		const response: IEvaluationReturn = await runEvaluations(
			geminiApiToken,
			publico,
			codeStr
		)
		evaluations.push({...response, publicName: publico.publicName})
	}

	const reproved: IEvaluation[] = evaluations.filter(
		(evaluation) => !evaluation.success
	)

	approveOrRejectPR(reproved.length == 0)

	return
}

interface IEvaluation extends IEvaluationReturn {
	publicName: string
}
