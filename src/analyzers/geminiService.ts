import {
    GoogleGenerativeAI,
    GenerativeModel,
    GenerateContentResult,
    SchemaType,
} from "@google/generative-ai";
import * as core from "@actions/core"

export interface IGeminiResponse {
    success: boolean;
    message: string | null;
}

export interface ICriteria {
    id: string;
    name: string;
    level: string;
    description: string;
}

export interface ICriteriaRequirements {
    criterias: ICriteria[];
    value: number;
}

export interface IEvaluationReturn {
    success: boolean;
    message: string;
}

export function getGeminiClient(geminiApiKey: string): GoogleGenerativeAI {
    return new GoogleGenerativeAI(geminiApiKey);
}

export function getEvaluationPrompt(criteria: string, code: string): string {
    const prompt = `
        You will receive a code and a criteria of quality.
        Your task is to evaluate the code based on the criteria.
        YOU SHOULD ALWAYS EVALUATE THE CODE BASED ON THE CRITERIA, NOT BASED ON YOUR PERSONAL OPINION.
        YOU SHOULD ALWAYS RETURN FOLLOWING THIS export INTERFACE:

        export interface IGeminiResponse {
            success: boolean;
            message: string;
        }

        Output will be always JUST a JSON object with a key success (boolean) and a key message (string ) only if not success. The message will contain the feedback from the evaluation.
        {
            "success": true or false,
            "message": "string" 
        }

        Example 1:
        Criteria: 
        {
            "id": "1.1.1", - this is the WCAG criteria id
            "name": "Non-text Content",
            "level": "A",
            "description": "Provide text alternatives for all non-text content."
        }
        
        Code:
        <div>
            <img src="button-image.jpg" onclick="submitForm()">
        </div>

        Output:
        {
            "success": false,
            "message": "The img tag is being used as a button without any alt text or an appropriate aria-label, meaning there's no text alternative provided for this non-text content (the image). Assistive technologies like screen readers won’t be able to interpret the purpose of this image since it lacks the necessary information to describe its functionality."
        }

        Example 2:
        Criteria:
        {
            "id": "1.3.1",
            "name": "Information and Relationships",
            "level": "A",
            "description": "Ensure that information structure can be programmatically determined."
        }

        Code:
        <div style="font-size: 20px; font-weight: bold;">Title of Section</div>
        <p>This is some paragraph text that explains the section.</p>
        <div style="font-size: 20px; font-weight: bold;">Another Section Title</div>
        <p>This is more text in another section.</p>

        Output:
        {
            "success": false,
            "message": "The HTML code is missing the necessary semantic elements to define the structure of the content. The content is being visually styled using div elements with inline styles, which makes it difficult for screen readers to interpret the information structure of the page. Consider using appropriate HTML elements like headings and paragraphs to define the content structure."
        }

        Now, evaluate the following code based on the criteria:

        Criteria:

        ${criteria}

        Code:

        ${code}
    `;

    return prompt;
}

export async function evaluateCriteria(
    gemini: GenerativeModel,
    criteria: ICriteria,
    code: string
): Promise<IGeminiResponse> {
    const prompt: string = getEvaluationPrompt(criteria.description, code);
    const evaluation: GenerateContentResult = await gemini.generateContent(
        prompt
    );

    // bota log aqui
    core.info("Evaluation: " + JSON.stringify(evaluation));

    const JSONEvaluation: IGeminiResponse = JSON.parse(
        evaluation.response.text()
    );

    // bota log aqui
    core.info("JSONEvaluation: " + JSON.stringify(JSONEvaluation));

    return JSONEvaluation;
}

export async function runEvaluations(
    geminiApiKey: string,
    requirements: ICriteriaRequirements,
    code: string
): Promise<IEvaluationReturn> {
    try {
        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                success: {
                    type: SchemaType.BOOLEAN,
                },
                message: {
                    type: SchemaType.STRING,
                },
            },
        };

        const geminiClient: GoogleGenerativeAI = getGeminiClient(geminiApiKey);
        const model: GenerativeModel = geminiClient.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const successMinRate: number = requirements.value;
        const criterias: ICriteria[] = requirements.criterias;

        let successCount: number = 0;
        let geminiResponses: IGeminiResponse[] = [];

        for (const criteria of criterias) {
            core.info("Criteria avaliada: " + criteria);
            const response: IGeminiResponse = await evaluateCriteria(
                model,
                criteria,
                code
            );
            geminiResponses.push(response);

            if (response.success) {
                core.info("Criteria aprovada: " + JSON.stringify(criteria));
                successCount++;
            }
            else {
                core.info("Criteria reprovada: " + JSON.stringify(criteria));
            }
        }

        const successRate: number = successCount / criterias.length;
        if (successRate >= successMinRate) {
            return {
                success: true,
                message: "The code meets the requirements.",
            };
        }

        let errorReport: string =
            "The code does not meet the requirements.\n\n";
        for (const geminiResponse of geminiResponses) {
            if (geminiResponse.success) continue;

            errorReport += `• ${geminiResponse.message}\n\n;`;
        }

        return {
            success: false,
            message: errorReport,
        };
    } catch (error) {
        console.log(error);

        return {
            success: false,
            message: "An error occurred while evaluating the code.",
        };
    }
}
