// src/utils/fileService.ts

import * as fs from "fs"
import * as path from "path"

export async function getFileContent(
	filePath: string
): Promise<{[filePath: string]: string}> {
	const codeContent: {[filePath: string]: string} = {}

	const fullPath = path.resolve(process.cwd(), filePath)
	try {
		const content = fs.readFileSync(fullPath, "utf8")
		codeContent[filePath] = content
	} catch (error) {
		// Handle error
	}

	return codeContent
}
