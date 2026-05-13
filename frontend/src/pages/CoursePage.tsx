// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Content } from '@tiptap/react'
import { MinimalTiptapEditor } from '../minimal-tiptap'
import { Button } from '@/components/ui/button';
import { Home, Share, Download, MessageCircle, ClipboardCheck, Menu, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { appLogo, websiteURL } from '@/constants';
import { emailTemplate, paragraph } from '@/lib/email';
import api from '@/lib/api';
import ShareOnSocial from 'react-share-on-social';
import StyledText from '@/components/styledText';
import html2pdf from 'html2pdf.js';
import { findYoutubeVideo, generateImage, generateTheory, lessonImagePrompt, lessonPrompt, transcriptSummaryPrompt, youtubeQuery } from '@/lib/course-generation';
import { courseProgress as getCourseProgress } from '@/lib/course-progress';
import { getCourseTopics, normalizeCourseContent } from '@/lib/course-types';

const CoursePage = () => {

  //ADDED FROM v4.0
  const { state } = useLocation();
  const { mainTopic, type, courseId, end, pass, lang } = state || {};
  const jsonData = normalizeCourseContent(JSON.parse(sessionStorage.getItem('jsonData')), mainTopic || '');
  const currentTopics = getCourseTopics(jsonData, mainTopic || '');
  const [selected, setSelected] = useState('');
  const [theory, setTheory] = useState('');
  const [media, setMedia] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isComplete, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [saving] = useState(false);
  const defaultMessage = `<p>Hey there! I'm your AI teacher. If you have any questions about your ${mainTopic} course, whether it's about videos, images, or theory, just ask me. I'm here to clear your doubts.</p>`;
  const defaultPrompt = `I have a doubt about this topic :- ${mainTopic}. Please clarify my doubt in very short :- `;

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<Content>('')

  const updateProgress = () => {
    const stats = getCourseProgress(JSON.stringify(jsonData), mainTopic, Boolean(pass));
    setPercentage(stats.percentage);
    if (stats.percentage >= 100) setIsCompleted(true);
  };

  async function getNotes() {
    try {
      const response = await api.post('/api/getnotes', { course: courseId });
      if (response.data.success) {
        setValue(response.data.message);
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveNote = async () => {
    const response = await api.post('/api/savenotes', { course: courseId, notes: value });
    if (response.data.success) {
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    }
  };

  // Loading skeleton for course content
  const CourseContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-8 w-3/4 mb-8" />

      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-1/2 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-3/4" />
        </div>

        <div>
          <Skeleton className="h-7 w-1/3 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-5/6" />
        </div>

        <div>
          <Skeleton className="h-7 w-2/5 mb-4" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-5 w-full mb-2" />
          <Skeleton className="h-36 w-full rounded-md bg-muted/30" />
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    loadMessages()
    getNotes()
    // Ensure the page starts at the top when loaded
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }

    // Ensure window also scrolls to top
    window.scrollTo(0, 0);
    if (!mainTopic) {
      navigate("/create");
    } else {
      if (percentage >= 100) {
        setIsCompleted(true);
      }

      const mainTopicData = currentTopics[0];
      const firstSubtopic = mainTopicData?.subtopics?.[0];
      if (!firstSubtopic) {
        toast({
          title: "Course outline needs another try",
          description: "This course outline is incomplete. Please regenerate the course.",
        });
        navigate("/dashboard/generate-course");
        return;
      }
      firstSubtopic.done = true
      setSelected(firstSubtopic.title)
      setTheory(firstSubtopic.theory);

      if (type === 'video & text course') {
        setMedia(firstSubtopic.youtube);
      } else {
        setMedia(firstSubtopic.image)

      }
      setIsLoading(false);
      sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
      updateProgress();

    }

  }, []);

  const loadMessages = async () => {
    try {
      const jsonValue = sessionStorage.getItem(mainTopic);
      if (jsonValue !== null) {
        setMessages(JSON.parse(jsonValue));
      } else {
        const newMessages = [...messages, { text: defaultMessage, sender: 'bot' }];
        setMessages(newMessages);
        await storeLocal(newMessages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function storeLocal(messages) {
    try {
      sessionStorage.setItem(mainTopic, JSON.stringify(messages));
    } catch (error) {
      console.error(error);
    }
  }

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage = { text: newMessage, sender: 'user' };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await storeLocal(updatedMessages);
    setNewMessage('');

    const mainPrompt = defaultPrompt + newMessage;
    const dataToSend = { prompt: mainPrompt };
    const url = '/api/chat';

    try {
      const response = await api.post(url, dataToSend);
      if (response.data.success === false) {
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      } else {
        const botMessage = { text: response.data.text, sender: 'bot' };
        const updatedMessagesWithBot = [...updatedMessages, botMessage];
        setMessages(updatedMessagesWithBot);
        await storeLocal(updatedMessagesWithBot);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      console.error(error);
    }
  };

  const CountDoneTopics = () => {
    updateProgress();
  }

  const handleSelect = (topics, sub) => {
    if (!isLoading) {
      const mTopic = currentTopics.find(topic => topic.title === topics);
      const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === sub);

      if (mSubTopic.theory === '' || mSubTopic.theory === undefined || mSubTopic.theory === null) {
        if (type === 'video & text course') {

          const query = youtubeQuery(mainTopic, mSubTopic.title);
          setIsLoading(true);
          sendVideo(query, topics, sub, mSubTopic.title);

        } else {

          const prompt = lessonPrompt(lang, mainTopic, mSubTopic.title);
          const promptImage = lessonImagePrompt(mainTopic, mSubTopic.title);
          setIsLoading(true);
          sendPrompt(prompt, promptImage, topics, sub);

        }
      } else {
        setSelected(mSubTopic.title)
        setTheory(mSubTopic.theory)
        if (type === 'video & text course') {
          setMedia(mSubTopic.youtube);
        } else {
          setMedia(mSubTopic.image)
        }
      }
    }
  };

  async function sendPrompt(prompt, promptImage, topics, sub) {
    try {
      const theory = await generateTheory(prompt);
      sendImage(theory, promptImage, topics, sub);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendImage(parsedJson, promptImage, topics, sub) {
    try {
      const image = await generateImage(promptImage);
      sendData(image, parsedJson, topics, sub);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendData(image, theory, topics, sub) {

    const mTopic = currentTopics.find(topic => topic.title === topics);
    const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === sub);
    mSubTopic.theory = theory
    mSubTopic.image = image;
    setSelected(mSubTopic.title)

    setIsLoading(false);
    setTheory(theory)
    if (type === 'video & text course') {
      setMedia(mSubTopic.youtube);
    } else {
      setMedia(image)
    }
    mSubTopic.done = true;
    updateCourse();
  }

  async function sendDataVideo(image, theory, topics, sub) {

    const mTopic = currentTopics.find(topic => topic.title === topics);
    const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === sub);
    mSubTopic.theory = theory
    mSubTopic.youtube = image;
    setSelected(mSubTopic.title)

    setIsLoading(false);
    setTheory(theory)
    if (type === 'video & text course') {
      setMedia(image);
    } else {
      setMedia(mSubTopic.image)
    }
    mSubTopic.done = true;
    updateCourse();

  }

  async function updateCourse() {
    CountDoneTopics();
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    const dataToSend = {
      content: JSON.stringify(jsonData),
      courseId: courseId
    };
    try {
      const postURL = '/api/update';
      await api.post(postURL, dataToSend);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendVideo(query, mTopic, mSubTopic, subtop) {
    try {
      const video = await findYoutubeVideo(query);
      sendTranscript(video, mTopic, mSubTopic, subtop);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendTranscript(url, mTopic, mSubTopic, subtop) {
    try {
      const prompt = await transcriptSummaryPrompt(url, lang, mainTopic, subtop);
      sendSummery(prompt, url, mTopic, mSubTopic);
    } catch (error) {
      console.error(error)
      const prompt = lessonPrompt(lang, mainTopic, subtop);
      sendSummery(prompt, url, mTopic, mSubTopic);
    }
  }

  async function sendSummery(prompt, url, mTopic, mSubTopic) {
    try {
      const theory = await generateTheory(prompt);
      sendDataVideo(url, theory, mTopic, mSubTopic);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function htmlDownload() {
    setExporting(true);
    // Generate the combined HTML content
    const combinedHtml = await getCombinedHtml(mainTopic, currentTopics);

    // Create a temporary div element
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '100%';  // Ensure div is 100% width
    tempDiv.style.height = '100%';  // Ensure div is 100% height
    tempDiv.innerHTML = combinedHtml;
    document.body.appendChild(tempDiv);

    // Create the PDF options
    const options = {
      filename: `${mainTopic}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      margin: [15, 15, 15, 15],
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      html2canvas: {
        scale: 2,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        useCORS: true
      },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
    };

    // Generate the PDF
    html2pdf().from(tempDiv).set(options).save().then(() => {
      // Save the PDF
      document.body.removeChild(tempDiv);
      setExporting(false);
    });
  }

  async function getCombinedHtml(mainTopic, topics) {

    async function toDataUrl(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.onload = function () {
          const reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result);
          };
          reader.readAsDataURL(xhr.response);
        };

        xhr.onerror = function () {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        };

        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
      }).catch(error => {
        console.error(`Failed to fetch image at ${url}:`, error);
        return ''; // Fallback or placeholder
      });
    }

    const topicsHtml = topics.map(topic => `
        <h3 style="font-size: 18pt; font-weight: bold; margin: 0; margin-top: 15px;">${topic.title}</h3>
        ${topic.subtopics.map(subtopic => `
            <p style="font-size: 16pt; margin-top: 10px;">${subtopic.title}</p>
        `).join('')}
    `).join('');

    const theoryPromises = topics.map(async topic => {
      const subtopicPromises = topic.subtopics.map(async (subtopic, index, array) => {
        const imageUrl = type === 'text & image course' ? await toDataUrl(subtopic.image) : ``;
        return `
            <div>
                <p style="font-size: 16pt; margin-top: 20px; font-weight: bold;">
                    ${subtopic.title}
                </p>
                <div style="font-size: 12pt; margin-top: 15px;">
                    ${subtopic.done
            ? `
                            ${type === 'text & image course'
              ? (imageUrl ? `<img style="margin-top: 10px;" src="${imageUrl}" alt="${subtopic.title} image">` : `<a style="color: #0000FF;" href="${subtopic.image}" target="_blank">View example image</a>`)
              : `<a style="color: #0000FF;" href="https://www.youtube.com/watch?v=${subtopic.youtube}" target="_blank" rel="noopener noreferrer">Watch the YouTube video on ${subtopic.title}</a>`
            }
                            <div style="margin-top: 10px;">${subtopic.theory}</div>
                        `
            : `<div style="margin-top: 10px;">Please visit ${subtopic.title} topic to export as PDF. Only topics that are completed will be added to the PDF.</div>`
          }
                </div>
            </div>
        `;
      });
      const subtopicHtml = await Promise.all(subtopicPromises);
      return `
            <div style="margin-top: 30px;">
                <h3 style="font-size: 18pt; text-align: center; font-weight: bold; margin: 0;">
                    ${topic.title}
                </h3>
                ${subtopicHtml.join('')}
            </div>
        `;
    });
    const theoryHtml = await Promise.all(theoryPromises);

    return `
    <div class="html2pdf__page-break" 
         style="display: flex; align-items: center; justify-content: center; text-align: center; margin: 0 auto; max-width: 100%; height: 11in;">
        <h1 style="font-size: 30pt; font-weight: bold; margin: 0;">
            ${mainTopic}
        </h1>
    </div>
    <div class="html2pdf__page-break" style="text-align: start; margin-top: 30px; margin-right: 16px; margin-left: 16px;">
        <h2 style="font-size: 24pt; font-weight: bold; margin: 0;">Index</h2>
        <br>
        <hr>
        ${topicsHtml}
    </div>
    <div style="text-align: start; margin-right: 16px; margin-left: 16px;">
        ${theoryHtml.join('')}
    </div>
    `;
  }

  async function redirectExam() {
    if (!isLoading) {
      setIsLoading(true);
      const mainTopicExam = currentTopics;
      let subtopicsString = '';
      mainTopicExam.map((topicTemp) => {
        const titleOfSubTopic = topicTemp.title;
        subtopicsString = subtopicsString + ' , ' + titleOfSubTopic;
      });
      const response = await api.post('/api/aiexam', { courseId, mainTopic, subtopicsString, lang });
      if (response.data.success) {
        setIsLoading(false);
        const questions = JSON.parse(response.data.message);
        navigate('/course/'+ courseId +'/quiz', { state: { topic: mainTopic, courseId: courseId, questions: questions } });
      } else {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      }
    }
  }

  const renderTopicsAndSubtopics = (topics) => {
    return (
      <>
        {topics.map((topic) => (
          <Accordion key={topic.title} type="single" collapsible className="mb-2">
            <AccordionItem value={topic.title} className="border-none">
              <AccordionTrigger className="py-2 px-3 text-left hover:bg-accent/50 rounded-md">
                {topic.title}
              </AccordionTrigger>
              <AccordionContent className="pl-2">
                {topic.subtopics.map((subtopic) => (
                  <div
                    onClick={() => handleSelect(topic.title, subtopic.title)}
                    key={subtopic.title}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer",
                      subtopic.title === "class-objects" && "bg-accent/50 font-medium text-primary"
                    )}
                  >
                    {subtopic.done && (
                      <span className="mr-2 text-primary">✓</span>
                    )}
                    <span className="text-sm">{subtopic.title}</span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </>
    );
  }

  function certificateCheck() {
    if (isComplete) {
      finish();
    } else {
      toast({
        title: "Completion Certificate",
        description: "Complete course to get certificate",
      });
    }
  }

  async function finish() {
    if (sessionStorage.getItem('first') === 'true') {
      if (!end) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB');
        navigate('/course/'+courseId+'/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      } else {
        navigate('/course/'+courseId+'/certificate', { state: { courseTitle: mainTopic, end: end } });
      }

    } else {
      const dataToSend = {
        courseId: courseId
      };
      try {
        const response = await api.post('/api/finish', dataToSend);
        if (response.data.success) {
          const today = new Date();
          const formattedDate = today.toLocaleDateString('en-GB');
          sessionStorage.setItem('first', 'true');
          sendEmail(formattedDate);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function sendEmail(formattedDate) {
    const userName = sessionStorage.getItem('mName');
    const html = emailTemplate({
      title: 'Completion Certificate',
      preview: 'Completion Certificate',
      body: [
        paragraph('Hello <strong>' + userName + '</strong>,'),
        paragraph('We are pleased to inform you that you have successfully completed the ' + mainTopic + ' course on ' + formattedDate + '.'),
        paragraph('Your certificate is ready. You can access it from your dashboard whenever you need it.'),
      ].join(''),
      buttonHref: websiteURL,
      buttonText: 'Get Certificate',
    });

    try {
      await api.post('/api/sendcertificate', { html, courseId });
    } catch (error) {
      console.error(error);
    }
  }

  const renderTopicsAndSubtopicsMobile = (topics) => {
    return (
      <>
        {topics.map((topic) => (
          <Accordion key={topic.title} type="single" collapsible className="mb-2">
            <AccordionItem value={topic.title} className="border-none">
              <AccordionTrigger className="py-2 text-left px-3 hover:bg-accent/50 rounded-md">
                {topic.title}
              </AccordionTrigger>
              <AccordionContent className="pl-2">
                {topic.subtopics.map((subtopic) => (
                  <div
                    onClick={() => handleSelect(topic.title, subtopic.title)}
                    key={subtopic.title}
                    className={cn(
                      "flex items-center px-4 py-2 rounded-md hover:bg-accent/50 transition-colors cursor-pointer",
                      subtopic.title === "class-objects" && "bg-accent/50 font-medium text-primary"
                    )}
                  >
                    {subtopic.done && (
                      <span className="mr-2 text-primary">✓</span>
                    )}
                    <span className="text-sm">{subtopic.title}</span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="border-b border-border/40 py-2 px-4 flex justify-between items-center sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh]">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Course Content</h2>
                <ScrollArea className="h-[60vh]">
                  <div className="pr-4">
                    {jsonData && renderTopicsAndSubtopics(currentTopics)}
                    <p onClick={redirectExam} className='py-2 text-left px-3 hover:bg-accent/50 rounded-md cursor-pointer'>{pass === true ? <span className="mr-2 text-primary">✓</span> : <></>}{mainTopic} Quiz</p>
                  </div>
                </ScrollArea>
              </div>
            </DrawerContent>
          </Drawer>

          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted-foreground/20" strokeWidth="2" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset={100 - percentage}
                  transform="rotate(-90 18 18)"
                />
                <text
                  x="18"
                  y="18"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium"
                >
                  {percentage}%
                </text>
              </svg>
            </div>
            <h1 className="text-xl font-bold">{mainTopic}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <ToggleGroup type="single" className="hidden sm:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to='/dashboard'>
                <Home className="h-4 w-4 mr-1" /> Home
              </Link>
            </Button>
            <Button onClick={certificateCheck} variant="ghost" size="sm" asChild>
              <span className='cursor-pointer'><Award className="h-4 w-4 mr-1" /> Certificate</span>
            </Button>
            <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm" asChild>
              <span className='cursor-pointer'><Download className="h-4 w-4 mr-1" />{exporting ? 'Exporting...' : 'Export'}</span>
            </Button>
            <ShareOnSocial
              textToShare={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              link={websiteURL + '/shareable?id=' + courseId}
              linkTitle={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              linkFavicon={appLogo}
              noReferer
            >
              <Button variant="ghost" size="sm" asChild>
                <span className='cursor-pointer'><Share className="h-4 w-4 mr-1" /> Share</span>
              </Button>
            </ShareOnSocial>
          </ToggleGroup>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={cn(
          "bg-sidebar border-r border-border/40 transition-all duration-300 overflow-hidden hidden md:block",
          isMenuOpen ? "w-64" : "w-0"
        )}>
          <ScrollArea className="h-full">
            <div className="p-4">
              {jsonData && renderTopicsAndSubtopicsMobile(currentTopics)}
              <p onClick={redirectExam} className='py-2 text-left px-3 hover:bg-accent/50 rounded-md cursor-pointer'>{pass === true ? <span className="mr-2 text-primary">✓</span> : <></>}{mainTopic} Quiz</p>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" viewportRef={mainContentRef}>
            <main className="p-6 max-w-5xl mx-auto">
              {isLoading ?
                <CourseContentSkeleton />
                :
                <>
                  <h1 className="text-3xl font-bold mb-6">{selected}</h1>
                  <div className="space-y-4">
                    {type === 'video & text course' ?
                      <div>
                        <iframe
                          key={media}
                          className="mb-5 aspect-video w-full max-w-3xl"
                          src={`https://www.youtube.com/embed/${media}`}
                          title={selected}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      :
                      <div>
                        <img className='overflow-hidden h-96 max-md:h-64' src={media} alt="Media" />
                      </div>
                    }
                    <StyledText text={theory} />
                  </div>
                </>
              }
            </main>
          </ScrollArea>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 flex justify-around items-center">
        <Button variant="ghost" size="sm">
          <Link to='/dashboard'>
            <Home className="h-5 w-5" />
          </Link>
        </Button>
        <Button onClick={certificateCheck} variant="ghost" size="sm" asChild>
          <span>
            <Award className="h-5 w-5" />
          </span>
        </Button>
        <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm">
          <Download className="h-5 w-5" />
        </Button>
        <ShareOnSocial
          textToShare={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          link={websiteURL + '/shareable?id=' + courseId}
          linkTitle={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          linkFavicon={appLogo}
          noReferer
        >
          <Button variant="ghost" size="sm">
            <Share className="h-5 w-5" />
          </Button>
        </ShareOnSocial>
      </div>

      <div className="fixed bottom-16 right-6 flex flex-col gap-3 md:bottom-6">
        <Button
          size="icon"
          className="rounded-full bg-primary shadow-lg hover:shadow-xl"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="rounded-full bg-primary shadow-lg hover:shadow-xl"
          onClick={() => setIsNotesOpen(true)}
        >
          <ClipboardCheck className="h-5 w-5" />
        </Button>
      </div>

      {isMobile ? (
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-full p-0">
            <div className="flex flex-col h-full p-4">
              <div className="py-2 px-4 border-b border-border mb-2">
                <h2 className="text-lg font-semibold">Course Assistant</h2>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2 px-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2 p-4 border-t border-border">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Course Assistant</DialogTitle>
            <div className="flex flex-col h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-2/4 max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-full p-0">
            <div className="flex flex-col h-full p-4">
              <div className="py-2 px-4 border-b border-border mb-2">
                <h2 className="text-lg font-semibold">Course Notes</h2>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2 px-4">
                  <MinimalTiptapEditor
                    value={value}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="No notes yet. Start taking notes for this course."
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none"
                  />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="flex justify-end">
                  <Button disabled={saving} onClick={handleSaveNote}>{saving ? 'Saving...' : 'Save Note'}</Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogTitle>Course Notes</DialogTitle>
            <div className="flex flex-col h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  <MinimalTiptapEditor
                    value={value}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="No notes yet. Start taking notes for this course."
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none"
                  />
                </div>
              </ScrollArea>

              <div>
                <div className="flex justify-end">
                  <Button disabled={saving} onClick={handleSaveNote}>{saving ? 'Saving...' : 'Save Note'}</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CoursePage;
