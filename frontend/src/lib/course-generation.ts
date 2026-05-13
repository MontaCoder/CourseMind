import api from '@/lib/api';
import type { MediaUrlResponse, TextResponse, TranscriptResponse } from '@/lib/api-types';

const lessonFormat = 'Return clean Markdown only with exactly these sections: ## Overview, ## Key ideas, ## Example, ## Quick check. Use short paragraphs and bullet lists. No tables, code fences, links, or preface.';
const maxTranscriptChars = 5000;

export const lessonPrompt = (lang: string, course: string, subtopic: string) =>
  `Strictly in ${lang}. Generate a complete teaching lesson about "${subtopic}" for the course "${course}". Do not ask clarification questions or say more information is needed; make reasonable educational assumptions and continue. ${lessonFormat}`;

export const lessonImagePrompt = (course: string, subtopic: string) => `Example of ${subtopic} in ${course}`;

export const youtubeQuery = (course: string, subtopic: string) => `${subtopic} ${course} in english`;

export async function generateTheory(prompt: string) {
  const res = await api.post<TextResponse>('/api/generate', { prompt });
  return res.data.text;
}

export async function generateImage(prompt: string) {
  const res = await api.post<MediaUrlResponse>('/api/image', { prompt });
  return res.data.url;
}

export async function findYoutubeVideo(prompt: string) {
  const res = await api.post<MediaUrlResponse>('/api/yt', { prompt });
  return res.data.url;
}

export async function transcriptSummaryPrompt(
  url: string,
  lang: string,
  course: string,
  subtopic: string,
  connector = ':-'
) {
  try {
    const res = await api.post<TranscriptResponse>('/api/transcript', { prompt: url });
    const transcript = Array.isArray(res.data.url)
      ? res.data.url
        .map((item) => (typeof item.text === 'string' ? item.text.trim() : ''))
        .filter(Boolean)
        .join(' ')
        .slice(0, maxTranscriptChars)
      : '';

    if (!transcript) return lessonPrompt(lang, course, subtopic);

    return `Strictly in ${lang}. Turn this transcript into a complete teaching lesson for "${subtopic}" in the course "${course}" ${connector} ${transcript}. Do not ask clarification questions or say the transcript is incomplete; make reasonable educational assumptions and continue. ${lessonFormat}`;
  } catch (error) {
    console.error(error);
    return lessonPrompt(lang, course, subtopic);
  }
}
