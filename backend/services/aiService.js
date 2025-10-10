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

export class AIService {
    static async generateContent(prompt) {
        const model = genAI.getGenerativeModel({ model: AI_MODEL, safetySettings });
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    }

    static async generateHTML(prompt) {
        const text = await this.generateContent(prompt);
        const converter = new showdown.Converter();
        return converter.makeHtml(text);
    }

    static async generateExam(courseId, mainTopic, subtopicsString, lang) {
        const prompt = `Strictly in ${lang},
        generate a strictly 10 question MCQ quiz on title ${mainTopic} based on each topics :- ${subtopicsString}, Atleast One question per topic. Add options A, B, C, D and only one correct answer. Give your repones Strictly inJSON format like this :-
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
        // Remove code block markers
        return result.slice(7, result.length - 4);
    }
}

