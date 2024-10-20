// main service
import * as core from '@actions/core';
import {getFileContent} from "../utils/fileService"
import {approveOrRejectPR, getChangedFiles, postComment} from "../utils/githubService"
import {getWcagCriteria, IRequirements} from "../utils/wcagService"
import {IEvaluationReturn, runEvaluations} from "./geminiService"
import { stringify } from "querystring";

export async function runService(
	requirements: IRequirements,
	geminiApiToken: string,
    githubToken: string
): Promise<void> {
    
    core.info('Running service...');
    core.info(stringify(requirements));
	const publicos = getWcagCriteria(requirements)

	const paths = await getChangedFiles(githubToken);
    core.info(paths.toString());

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

    approveOrRejectPR(reproved.length == 0);

    if(reproved.length > 0) {
        let message = "The code does not meet the following requirements:\n\n"
        reproved.forEach((evaluation) => {
            message += `* ${evaluation.message}\n`
        })
        postComment(message, githubToken)
        return
    }

    postComment('Parabains', githubToken)

	return
}

interface IEvaluation extends IEvaluationReturn {
	publicName: string
}
