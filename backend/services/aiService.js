import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import showdown from 'showdown';
import { config } from '../config/environment.js';
import { AI_MODEL } from '../config/constants.js';

const genAI = new GoogleGenerativeAI(config.api.googleAI);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

// Reuse a single Showdown converter instance
const markdownConverter = new showdown.Converter();

// Helper function to extract JSON from text (handles code fences and plain JSON)
function extractJSON(text) {
    // Try to find JSON in code blocks first
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1];
    }
    
    // Try to find JSON object directly
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return jsonMatch[0];
    }
    
    // Fallback: return original text
    return text;
}

export class AIService {
    static async generateContent(prompt) {
        const model = genAI.getGenerativeModel({ model: AI_MODEL, safetySettings });
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    }

    static async *generateContentStream(prompt) {
        const model = genAI.getGenerativeModel({ model: AI_MODEL, safetySettings });
        
        try {
            const result = await model.generateContentStream(prompt);
            let fullText = '';
            
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    fullText += chunkText;
                    yield chunkText;
                }
            }
        } catch (error) {
            // Fallback to non-streaming if streaming fails
            console.warn('Streaming failed, falling back to non-streaming:', error.message);
            const text = await this.generateContent(prompt);
            // Chunk the text for streaming effect
            const chunkSize = 50;
            for (let i = 0; i < text.length; i += chunkSize) {
                yield text.slice(i, i + chunkSize);
            }
        }
    }

    static async generateHTML(prompt) {
        const text = await this.generateContent(prompt);
        return markdownConverter.makeHtml(text);
    }

    static async generateExam(courseId, mainTopic, subtopicsString, lang) {
        const prompt = `Strictly in ${lang},
        generate a strictly 10 question MCQ quiz on title ${mainTopic} based on each topics :- ${subtopicsString}, Atleast One question per topic. Add options A, B, C, D and only one correct answer. Give your responses Strictly in JSON format like this :-
        {
          "${mainTopic}": [
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            },
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            },
            {
              "topic": "topic title",
              "question": "",
              "options": [
               "",
               "",
               "",
               ""
              ],
              "answer": "correct option like A, B, C, D"
            }
          ]
        }
        `;

        const result = await this.generateContent(prompt);
        // Robustly extract JSON from response
        return extractJSON(result);
    }
}

