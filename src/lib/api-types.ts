export interface UserData {
  _id: string;
  email: string;
  mName: string;
  type: string;
}

export interface AuthSession {
  token: string;
  userData: UserData;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  userId?: string;
  userData: UserData;
}

export interface AdminDashboardResponse {
  admin: {
    email: string;
  };
}

export interface PromptResponse {
  generatedText: string;
}

export interface TextResponse {
  success?: boolean;
  text: string;
}

export interface MediaUrlResponse {
  url: string;
}

export interface TranscriptItem {
  text?: string | null;
}

export interface TranscriptResponse {
  url?: TranscriptItem[] | null;
}

export interface CourseCreateResponse {
  success: boolean;
  message?: string;
  courseId: string;
  completed: boolean | string;
}

export interface CourseResultResponse {
  success: boolean;
  message?: boolean;
  lang?: string;
}

export interface CourseListItem {
  _id: string;
  content: string;
  mainTopic: string;
  type: string;
  completed: boolean | string;
  end?: string;
  photo?: string;
  status?: string;
}

export type CoursesResponse = CourseListItem[];

export interface SharedCourseItem {
  content: string;
  type: string;
  mainTopic: string;
}

export type SharedCourseResponse = SharedCourseItem[];
