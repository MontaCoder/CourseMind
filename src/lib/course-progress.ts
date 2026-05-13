import type { CourseTopic } from '@/lib/course-types';
import { getCourseTopics } from '@/lib/course-types';

export const courseProgress = (content: string, mainTopic: string, quizPassed = false) => {
  try {
    const data = JSON.parse(content);
    const topics = getCourseTopics(data, mainTopic) as CourseTopic[];
    const lessonStats = topics.reduce(
      (stats, topic) => {
        (topic.subtopics || []).forEach((subtopic) => {
          stats.total += 1;
          if (subtopic.done) stats.done += 1;
        });
        return stats;
      },
      { done: 0, total: 0 }
    );
    const total = lessonStats.total + 1;
    const done = lessonStats.done + (quizPassed ? 1 : 0);

    return {
      done,
      total,
      percentage: total ? Math.round((done / total) * 100) : 0,
    };
  } catch (error) {
    console.error(error);
    return { done: 0, total: 0, percentage: 0 };
  }
};
