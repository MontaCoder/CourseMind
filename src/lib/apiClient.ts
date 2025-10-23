import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { serverURL } from '@/constants';

// Token management
const TOKEN_KEY = 'authToken';

export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

// Clear all auth data
export const clearAuth = (): void => {
    removeToken();
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('mName');
    sessionStorage.removeItem('uid');
    sessionStorage.removeItem('type');
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: serverURL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            clearAuth();
            
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

// API methods
export const api = {
    // Auth endpoints
    auth: {
        signup: (data: { email: string; mName: string; password: string; type: string }) =>
            apiClient.post('/api/signup', data),
        
        signin: (data: { email: string; password: string }) =>
            apiClient.post('/api/signin', data),
        
        social: (data: { email: string; name: string }) =>
            apiClient.post('/api/social', data),
        
        forgot: (data: { email: string; name: string; company: string; logo: string }) =>
            apiClient.post('/api/forgot', data),
        
        resetPassword: (data: { password: string; token: string }) =>
            apiClient.post('/api/reset-password', data),
        
        updateProfile: (data: { uid: string; email?: string; mName?: string; password?: string }) =>
            apiClient.post('/api/profile', data),
        
        deleteUser: (data: { userId: string }) =>
            apiClient.post('/api/deleteuser', data),
    },
    
    // Course endpoints
    courses: {
        create: (data: { user: string; content: string; type: string; mainTopic: string; lang: string }) =>
            apiClient.post('/api/course', data),
        
        createShared: (data: { user: string; content: string; type: string; mainTopic: string }) =>
            apiClient.post('/api/courseshared', data),
        
        update: (data: { content: string; courseId: string }) =>
            apiClient.post('/api/update', data),
        
        delete: (data: { courseId: string }) =>
            apiClient.post('/api/deletecourse', data),
        
        finish: (data: { courseId: string }) =>
            apiClient.post('/api/finish', data),
        
        getAll: (params: { userId: string; page?: number; limit?: number }) =>
            apiClient.get('/api/courses', { params }),
        
        getShared: (id: string) =>
            apiClient.get('/api/shareable', { params: { id } }),
        
        sendCertificate: (data: { html: string; email: string }) =>
            apiClient.post('/api/sendcertificate', data),
    },
    
    // Notes endpoints
    notes: {
        get: (data: { course: string }) =>
            apiClient.post('/api/getnotes', data),
        
        save: (data: { course: string; notes: string }) =>
            apiClient.post('/api/savenotes', data),
    },
    
    // Exam endpoints
    exam: {
        generate: (data: { courseId: string; mainTopic: string; subtopicsString: string; lang: string }) =>
            apiClient.post('/api/aiexam', data),
        
        updateResult: (data: { courseId: string; marksString: string }) =>
            apiClient.post('/api/updateresult', data),
        
        sendMail: (data: { html: string; email: string; subjects: string }) =>
            apiClient.post('/api/sendexammail', data),
        
        getResult: (data: { courseId: string }) =>
            apiClient.post('/api/getmyresult', data),
    },
    
    // Admin endpoints
    admin: {
        dashboard: () =>
            apiClient.post('/api/dashboard'),
        
        getUsers: () =>
            apiClient.get('/api/getusers'),
        
        getCourses: () =>
            apiClient.get('/api/getcourses'),
        
        getPaidUsers: () =>
            apiClient.get('/api/getpaid'),
        
        getAdmins: () =>
            apiClient.get('/api/getadmins'),
        
        addAdmin: (data: { email: string }) =>
            apiClient.post('/api/addadmin', data),
        
        removeAdmin: (data: { email: string }) =>
            apiClient.post('/api/removeadmin', data),
        
        getContacts: () =>
            apiClient.get('/api/getcontact'),
        
        saveSettings: (data: { data: string; type: string }) =>
            apiClient.post('/api/saveadmin', data),
        
        getPolicies: () =>
            apiClient.get('/api/policies'),
        
        contact: (data: { fname: string; lname: string; email: string; phone: string; msg: string }) =>
            apiClient.post('/api/contact', data),
        
        // Blog endpoints
        createBlog: (data: { title: string; excerpt: string; content: string; image: string; category: string; tags: string }) =>
            apiClient.post('/api/createblog', data),
        
        deleteBlogs: (data: { id: string }) =>
            apiClient.post('/api/deleteblogs', data),
        
        updateBlogs: (data: { id: string; type: string; value: string }) =>
            apiClient.post('/api/updateblogs', data),
        
        getBlogs: () =>
            apiClient.get('/api/getblogs'),
    },
};

export default apiClient;
