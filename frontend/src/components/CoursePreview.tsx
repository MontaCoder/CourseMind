import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  findYoutubeVideo,
  generateImage,
  generateTheory,
  lessonImagePrompt,
  lessonPrompt,
  transcriptSummaryPrompt,
  youtubeQuery
} from '@/lib/course-generation';

interface CoursePreviewProps {
  isLoading: boolean;
  courseName: string;
  topics: Record<string, CourseTopic[]>;
  type: string;
  lang: string;
  onClose?: () => void;
}

type CourseSubtopic = {
  title: string;
  theory?: string;
  image?: string;
  youtube?: string;
  done?: boolean;
};

type CourseTopic = {
  title: string;
  subtopics: CourseSubtopic[];
};

const CoursePreview = ({ isLoading, courseName, topics, type, lang, onClose }: CoursePreviewProps) => {
  const navigate = useNavigate();
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const { toast } = useToast();
  const topicKey = courseName.toLowerCase();

  const fail = (error?: unknown) => {
    if (error) console.error(error);
    setIsLoadingCourse(false);
    toast({ title: 'Error', description: 'Internal Server Error' });
  };

  const openCourse = async () => {
    const response = await api.post('/api/course', { content: JSON.stringify(topics), type, mainTopic: courseName, lang });
    if (!response.data.success) return fail();

    sessionStorage.setItem('courseId', response.data.courseId);
    sessionStorage.setItem('first', response.data.completed);
    sessionStorage.setItem('jsonData', JSON.stringify(topics));
    navigate('/course/' + response.data.courseId, {
      state: {
        jsonData: topics,
        mainTopic: courseName.toUpperCase(),
        type: type.toLowerCase(),
        courseId: response.data.courseId,
        end: '',
        pass: false,
        lang
      }
    });
  };

  const saveFirstLesson = async (mediaKey: 'image' | 'youtube', media: string, theory: string) => {
    const firstSubtopic = topics[topicKey][0].subtopics[0];
    firstSubtopic.theory = theory;
    firstSubtopic[mediaKey] = media;
    await openCourse();
  };

  const createImageCourse = async (subtopic: string) => {
    const [theory, image] = await Promise.all([
      generateTheory(lessonPrompt(lang, courseName, subtopic)),
      generateImage(lessonImagePrompt(courseName, subtopic)),
    ]);
    await saveFirstLesson('image', image, theory);
  };

  const createVideoCourse = async (subtopic: string) => {
    const video = await findYoutubeVideo(youtubeQuery(courseName, subtopic));
    let prompt = lessonPrompt(lang, courseName, subtopic);
    try {
      prompt = await transcriptSummaryPrompt(video, lang, 'and :-');
    } catch (error) {
      console.error(error);
    }
    const theory = await generateTheory(prompt);
    await saveFirstLesson('youtube', video, theory);
  };

  const handleCreateCourse = async () => {
    const firstSubtopic = topics?.[topicKey]?.[0]?.subtopics?.[0]?.title;
    if (!firstSubtopic) return fail();
    setIsLoadingCourse(true);
    try {
      if (type === 'Video & Text Course') await createVideoCourse(firstSubtopic);
      else await createImageCourse(firstSubtopic);
    } catch (error) {
      fail(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            <Skeleton className="h-10 w-3/4 mx-auto" />
          </h1>
          <div className="text-muted-foreground max-w-lg mx-auto">
            <Skeleton className="h-4 w-full mx-auto" />
          </div>
        </div>
        <div className="space-y-6 max-w-3xl mx-auto">
          {[1, 2, 3, 4].map((section) => (
            <div key={section} className="space-y-2">
              <Skeleton className="h-10 w-full bg-muted-foreground/10" />
              {[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full" />)}
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Loader className="animate-spin h-5 w-5 text-primary" />
            <span>Generating your course structure...</span>
          </div>
        </div>
      </div>
    );
  }

  const topicList = topics?.[topicKey];

  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-indigo-500 mb-4">
          {courseName.toUpperCase()}
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">List of topics and subtopics course will cover</p>
      </div>

      <ScrollArea className="px-4">
        <div className="space-y-6 max-w-3xl mx-auto pb-6">
          {Array.isArray(topicList) ? topicList.map((topic) => (
            <div key={topic.title} className="space-y-2">
              <Card className="bg-black text-white">
                <CardContent className="p-4 font-bold">{topic.title}</CardContent>
              </Card>
              {topic.subtopics.map((subtopic) => (
                <Card key={subtopic.title} className="border">
                  <CardContent className="p-4">{subtopic.title}</CardContent>
                </Card>
              ))}
            </div>
          )) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Failed to load course topics. Please try again.</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-center gap-4 mt-8">
        <Button disabled={isLoadingCourse} variant="outline" onClick={onClose} className="w-40">Cancel</Button>
        <Button disabled={isLoadingCourse} onClick={handleCreateCourse} className="w-40 bg-black text-white hover:bg-gray-800">
          {isLoadingCourse ? <Loader className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
          {isLoadingCourse ? 'Generating...' : 'Generate Course'}
        </Button>
      </div>
    </div>
  );
};

export default CoursePreview;
