import api from '@/lib/api';

export const lessonPrompt = (lang: string, course: string, subtopic: string) =>
  `Strictly in ${lang}, Explain me about this subtopic of ${course} with examples :- ${subtopic}. Please Strictly Don't Give Additional Resources And Images.`;

export const lessonImagePrompt = (course: string, subtopic: string) => `Example of ${subtopic} in ${course}`;

export const youtubeQuery = (course: string, subtopic: string) => `${subtopic} ${course} in english`;

export async function generateTheory(prompt: string) {
  const res = await api.post<{ text: string }>('/api/generate', { prompt });
  return res.data.text;
}

export async function generateImage(prompt: string) {
  const res = await api.post<{ url: string }>('/api/image', { prompt });
  return res.data.url;
}

export async function findYoutubeVideo(prompt: string) {
  const res = await api.post<{ url: string }>('/api/yt', { prompt });
  return res.data.url;
}

export async function transcriptSummaryPrompt(url: string, lang: string, connector = ':-') {
  const res = await api.post<{ url: Array<{ text: string }> }>('/api/transcript', { prompt: url });
  const transcript = res.data.url.map((item: { text: string }) => item.text).join(' ');
  return `Strictly in ${lang}, Summarize this theory in a teaching way ${connector} ${transcript}.`;
}
