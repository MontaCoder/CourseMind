export interface CourseSubtopic {
  title: string;
  theory?: string;
  image?: string;
  youtube?: string;
  done?: boolean;
}

export interface CourseTopic {
  title: string;
  subtopics: CourseSubtopic[];
}

export type CourseContent = Record<string, CourseTopic[]>;

export const courseKey = (topic = '') => topic.trim().toLowerCase();

export const stripJsonFences = (value: string) =>
  value.replace(/```json/gi, '').replace(/```/g, '').trim();

export const isCourseTopicList = (value: unknown): value is CourseTopic[] =>
  Array.isArray(value) &&
  value.every((topic) => {
    if (!topic || typeof topic !== 'object') return false;
    const candidate = topic as Partial<CourseTopic>;
    return typeof candidate.title === 'string' && Array.isArray(candidate.subtopics);
  });

export function normalizeCourseContent(value: unknown, mainTopic: string): CourseContent {
  const key = courseKey(mainTopic);
  if (!key || !value || typeof value !== 'object' || Array.isArray(value)) return {};

  const source = value as Record<string, unknown>;
  const exactTopicList = source[key];
  if (isCourseTopicList(exactTopicList)) return { [key]: exactTopicList };

  const matchingEntry = Object.entries(source).find(
    ([sourceKey, sourceValue]) => courseKey(sourceKey) === key && isCourseTopicList(sourceValue)
  );
  if (matchingEntry) return { [key]: matchingEntry[1] as CourseTopic[] };

  const firstTopicList = Object.values(source).find(isCourseTopicList);
  return firstTopicList ? { [key]: firstTopicList } : {};
}

export const getCourseTopics = (content: unknown, mainTopic: string) =>
  normalizeCourseContent(content, mainTopic)[courseKey(mainTopic)] || [];

export const parseGeneratedCourseContent = (generatedText: string, mainTopic: string) =>
  normalizeCourseContent(JSON.parse(stripJsonFences(generatedText)), mainTopic);
