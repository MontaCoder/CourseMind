import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Plus } from 'lucide-react';
import CoursePreview from '@/components/CoursePreview';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const languages = [
  'English', 'Arabic', 'Bengali', 'Bulgarian', 'Chinese', 'Croatian', 'Czech', 'Danish',
  'Dutch', 'Estonian', 'Finnish', 'French', 'German', 'Greek', 'Hebrew', 'Hindi',
  'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Latvian', 'Lithuanian',
  'Norwegian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Serbian', 'Slovak',
  'Slovenian', 'Spanish', 'Swahili', 'Swedish', 'Thai', 'Turkish', 'Ukrainian',
  'Vietnamese'
];

const GenerateCourse = () => {
  const [topic, setTopic] = useState('');
  const [subtopicInput, setSubtopicInput] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState({});
  const [topicsLimit, setTopicsLimit] = useState('4');
  const [courseType, setCourseType] = useState('Text & Image Course');
  const [paidMember, setPaidMember] = useState(false);
  const [lang, setLang] = useState('English');
  const { toast } = useToast();

  useEffect(() => {
    setPaidMember(sessionStorage.getItem('type') !== 'free');
  }, []);

  const paidToast = () => {
    if (!paidMember) {
      toast({ title: 'Go Premium', description: 'Access all features with a Premium upgrade.' });
    }
  };

  const addSubtopic = () => {
    const next = subtopicInput.trim();
    if (!next) return;
    if (subtopics.length >= 5) {
      toast({ title: 'Upgrade to Premium', description: 'You are limited to adding only 5 subtopics.' });
      return;
    }
    setSubtopics([...subtopics, next]);
    setSubtopicInput('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (topic.trim().length < 3) {
      toast({ title: 'Invalid Topic', description: 'Topic must be at least 3 characters.' });
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);

    const mainTopic = topic.trim();
    const prompt = `Strictly in ${lang}, Generate a list of Strict ${topicsLimit} topics and any number sub topic for each topic for main title ${mainTopic.toLowerCase()}, everything in single line. Those ${topicsLimit} topics should Strictly include these topics :- ${subtopics.join(', ').toLowerCase()}. Strictly Keep theory, youtube, image field empty. Generate in the form of JSON in this format {
            "${mainTopic.toLowerCase()}": [
       {
       "title": "Topic Title",
       "subtopics": [
        {
        "title": "Sub Topic Title",
        "theory": "",
        "youtube": "",
        "image": "",
        "done": false
        },
        {
        "title": "Sub Topic Title",
        "theory": "",
        "youtube": "",
        "image": "",
        "done": false
        }
       ]
       },
       {
       "title": "Topic Title",
       "subtopics": [
        {
        "title": "Sub Topic Title",
        "theory": "",
        "youtube": "",
        "image": "",
        "done": false
        },
        {
        "title": "Sub Topic Title",
        "theory": "",
        "youtube": "",
        "image": "",
        "done": false
        }
       ]
       }
      ]
      }`;

    try {
      const res = await api.post('/api/prompt', { prompt });
      const cleanedJsonString = res.data.generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
      setGeneratedTopics(JSON.parse(cleanedJsonString));
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'AI returned an invalid response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <SEO title="Generate Course - Preview" description="Preview your AI-generated course before creation" keywords="course generation, preview, AI learning" />
        <CoursePreview
          isLoading={isLoading}
          courseName={topic.toLowerCase()}
          topics={generatedTopics}
          type={courseType}
          lang={lang.toLowerCase()}
          onClose={() => setIsSubmitted(false)}
        />
      </>
    );
  }

  return (
    <>
      <SEO title="Generate Course" description="Create a customized AI-generated course" keywords="course generation, AI learning, custom education" />
      <div className="space-y-8 animate-fade-in max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gradient bg-gradient-to-r from-primary to-indigo-500 mb-4">Generate Course</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Type the topic on which you want to Generate course. Also, you can enter a list of subtopics, which are the specifics you want to learn.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input id="topic" placeholder="Enter main topic" value={topic} onChange={(event) => setTopic(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtopic">Sub Topic (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="subtopic"
                      placeholder="Enter subtopic"
                      value={subtopicInput}
                      onChange={(event) => setSubtopicInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addSubtopic();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSubtopic} className="bg-black text-white hover:bg-gray-800">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Sub-Topic
                    </Button>
                  </div>

                  {subtopics.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {subtopics.map((item, index) => (
                        <div key={item} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <span className="text-sm">{item}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 w-7 p-0"
                            onClick={() => setSubtopics(subtopics.filter((_, i) => i !== index))}
                          >
                            A-
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Select Number Of Sub Topic</Label>
                  <RadioGroup value={topicsLimit} onValueChange={setTopicsLimit} className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem value="4" id="r1" />
                      <Label htmlFor="r1" className="mb-0">5</Label>
                    </div>
                    <div onClick={paidToast} className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem disabled={!paidMember} value="8" id="r2" />
                      <Label htmlFor="r2" className="mb-0">10</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label>Select Course Type</Label>
                  <RadioGroup value={courseType} onValueChange={setCourseType} className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem value="Text & Image Course" id="ct1" />
                      <Label htmlFor="ct1" className="mb-0">Theory & Image Course</Label>
                    </div>
                    <div onClick={paidToast} className="flex items-center space-x-2 border p-3 rounded-md">
                      <RadioGroupItem disabled={!paidMember} value="Video & Text Course" id="ct2" />
                      <Label htmlFor="ct2" className="mb-0">Video & Theory Course</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Course Language</Label>
                  <Select
                    value={lang}
                    onValueChange={(value) => {
                      if (!paidMember) paidToast();
                      else setLang(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
};

export default GenerateCourse;
