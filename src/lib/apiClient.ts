import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { serverURL } from '@/constants';

const TOKEN_KEY = 'authToken';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const clearAuth = (): void => {
  removeToken();
  const keys = ['auth', 'email', 'mName', 'uid', 'type'];
  keys.forEach((key) => sessionStorage.removeItem(key));
};

const apiClient: AxiosInstance = axios.create({
  baseURL: serverURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const api = {
  auth: {
    signup: (data: { email: string; mName: string; password: string; type: string }) =>
      apiClient.post('/api/signup', data),
    signin: (data: { email: string; password: string }) =>
      apiClient.post('/api/signin', data),
    social: (data: { email: string; name: string }) => apiClient.post('/api/social', data),
    forgot: (data: { email: string; name: string; company: string; logo: string }) =>
      apiClient.post('/api/forgot', data),
    resetPassword: (data: { password: string; token: string }) =>
      apiClient.post('/api/reset-password', data),
    updateProfile: (data: { uid: string; email?: string; mName?: string; password?: string }) =>
      apiClient.post('/api/profile', data),
    deleteUser: (data: { userId: string }) => apiClient.post('/api/deleteuser', data),
  },
  courses: {
    create: (data: { user: string; content: string; type: string; mainTopic: string; lang: string }) =>
      apiClient.post('/api/course', data),
    createShared: (data: { user: string; content: string; type: string; mainTopic: string }) =>
      apiClient.post('/api/courseshared', data),
    update: (data: { content: string; courseId: string }) =>
      apiClient.post('/api/update', data),
    delete: (data: { courseId: string }) => apiClient.post('/api/deletecourse', data),
    finish: (data: { courseId: string }) => apiClient.post('/api/finish', data),
    getAll: (params: { userId: string; page?: number; limit?: number }) =>
      apiClient.get('/api/courses', { params }),
    getShared: (id: string) => apiClient.get('/api/shareable', { params: { id } }),
    sendCertificate: (data: { html: string; email: string }) =>
      apiClient.post('/api/sendcertificate', data),
    checkAdmin: () => apiClient.post('/api/checkadmin', {}),
  },
  notes: {
    get: (data: { course: string }) => apiClient.post('/api/getnotes', data),
    save: (data: { course: string; notes: string }) => apiClient.post('/api/savenotes', data),
  },
  exam: {
    generate: (data: { courseId: string; mainTopic: string; subtopicsString: string; lang: string }) =>
      apiClient.post('/api/aiexam', data),
    updateResult: (data: { courseId: string; marksString: string }) =>
      apiClient.post('/api/updateresult', data),
    sendMail: (data: { html: string; email: string; subjects: string }) =>
      apiClient.post('/api/sendexammail', data),
    getResult: (data: { courseId: string }) => apiClient.post('/api/getmyresult', data),
  },
  payments: {
    razorpayCreate: (data: { plan: string; email: string; fullAddress: string }) =>
      apiClient.post('/api/razorpaycreate', data),
    paystackPayment: (data: { planId: string; amountInZar: number; email: string }) =>
      apiClient.post('/api/paystackpayment', data),
    stripePayment: (data: { planId: string }) => apiClient.post('/api/stripepayment', data),
    paypal: (data: { planId: string; email: string; name: string; lastName: string; post: string; address: string; country: string; admin?: string; brand?: string }) =>
      apiClient.post('/api/paypal', data),
    paypalDetails: (data: { subscriberId: string; uid: string; plan: string }) =>
      apiClient.post('/api/paypaldetails', data),
    paypalCancel: (data: { id: string; email: string }) => apiClient.post('/api/paypalcancel', data),
    paypalUpdate: (data: { id: string; idPlan: string }) => apiClient.post('/api/paypalupdate', data),
    stripeDetails: (data: { subscriberId: string; uid: string; plan: string }) =>
      apiClient.post('/api/stripedetails', data),
    stripeCancel: (data: { id: string; email: string }) => apiClient.post('/api/stripecancel', data),
    razorpayPending: (data: { sub: string }) => apiClient.post('/api/razorapypending', data),
    razorpayDetails: (data: { subscriberId: string; uid: string; plan: string }) =>
      apiClient.post('/api/razorapydetails', data),
    razorpayCancel: (data: { id: string; email: string }) => apiClient.post('/api/razorpaycancel', data),
    paystackFetch: (data: { email: string; uid: string; plan: string }) =>
      apiClient.post('/api/paystackfetch', data),
    paystackCancel: (data: { code: string; token: string; email: string }) =>
      apiClient.post('/api/paystackcancel', data),
    subscriptionDetail: (data: { uid: string; email: string }) =>
      apiClient.post('/api/subscriptiondetail', data),
    sendReceipt: (data: { html: string; email: string; plan: string; subscriberId: string; user: string; method: string; subscription: string }) =>
      apiClient.post('/api/sendreceipt', data),
    downloadReceipt: (data: { html: string; email: string }) =>
      apiClient.post('/api/downloadreceipt', data),
  },
  ai: {
    prompt: (data: { prompt: string }) => apiClient.post('/api/prompt', data),
    promptStream: async (
      prompt: string,
      token: string,
      onChunk: (chunk: string) => void,
      onDone: () => void,
      onError: (error: Error) => void,
    ) => {
      const response = await fetch(`${serverURL}/api/prompt-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.delta) onChunk(data.delta);
            } catch {
              // ignore malformed chunks
            }
          } else if (line.startsWith('event: ')) {
            const eventType = line.slice(7);
            if (eventType === 'done') {
              onDone();
              return;
            }
            if (eventType === 'error') {
              if (i + 1 < lines.length && lines[i + 1].startsWith('data: ')) {
                try {
                  const errorData = JSON.parse(lines[i + 1].slice(6));
                  onError(new Error(errorData.message || 'Streaming error'));
                } catch {
                  onError(new Error('Streaming error'));
                }
              } else {
                onError(new Error('Streaming error'));
              }
              return;
            }
          }
        }
      }
    },
    generate: (data: { prompt: string }) => apiClient.post('/api/generate', data),
    chat: (data: { prompt: string }) => apiClient.post('/api/chat', data),
    image: (data: { prompt: string }) => apiClient.post('/api/image', data),
    transcript: (data: { prompt: string }) => apiClient.post('/api/transcript', data),
    youtube: (data: { prompt: string }) => apiClient.post('/api/yt', data),
  },
  admin: {
    dashboard: () => apiClient.post('/api/dashboard', {}),
    getUsers: () => apiClient.get('/api/getusers'),
    getCourses: () => apiClient.get('/api/getcourses'),
    getPaidUsers: () => apiClient.get('/api/getpaid'),
    getAdmins: () => apiClient.get('/api/getadmins'),
    addAdmin: (data: { email: string }) => apiClient.post('/api/addadmin', data),
    removeAdmin: (data: { email: string }) => apiClient.post('/api/removeadmin', data),
    getContacts: () => apiClient.get('/api/getcontact'),
    saveSettings: (data: { data: string; type: string }) => apiClient.post('/api/saveadmin', data),
    getPolicies: () => apiClient.get('/api/policies'),
    contact: (data: { fname: string; lname: string; email: string; phone: string; msg: string }) =>
      apiClient.post('/api/contact', data),
    createBlog: (data: { title: string; excerpt: string; content: string; image: string; category: string; tags: string }) =>
      apiClient.post('/api/createblog', data),
    deleteBlogs: (data: { id: string }) => apiClient.post('/api/deleteblogs', data),
    updateBlogs: (data: { id: string; type: string; value: string }) =>
      apiClient.post('/api/updateblogs', data),
    getBlogs: () => apiClient.get('/api/getblogs'),
  },
};

export default apiClient;
