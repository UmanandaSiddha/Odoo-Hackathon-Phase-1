import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export interface DashboardStats {
  totalSwaps: number;
  activeConnections: number;
  averageRating: number;
  skillsProgress: number;
  completedSwapsThisMonth: number;
  newConnectionsThisWeek: number;
  totalReviews: number;
  improvedSkills: number;
  upcomingSwaps: Array<{
    title: string;
    with: string;
    date: string;
    skillToLearn: string;
    skillToTeach: string;
  }>;
  skillProgress: Array<{
    skill: string;
    progress: number;
    level: string;
    hoursSpent: number;
  }>;
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(error.response.data.message || 'An error occurred'));
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(error);
    }
  }
);

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    
    // Validate the response data
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
    throw error;
  }
}; 