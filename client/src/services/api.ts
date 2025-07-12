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

export interface UserProfile {
  firstName: string;
  lastName: string;
  bio: string;
  website: string;
  phone: string;
  profilePicture: string;
  isPublic: boolean;
  address?: {
    city: string;
    state: string;
    country: string;
  };
  skillsOffered: Array<{
    id: string;
    name: string;
    skillProgress: {
      level: string;
      progress: number;
      hoursSpent: number;
    };
  }>;
  skillsWanted: Array<{
    id: string;
    name: string;
    skillProgress: {
      level: string;
      progress: number;
      hoursSpent: number;
    };
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
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(new Error(error.response.data.message || 'An error occurred'));
    } else if (error.request) {
      return Promise.reject(new Error('No response from server'));
    } else {
      return Promise.reject(error);
    }
  }
);

// Dashboard API
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    
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

// Profile API
export const updateUserProfile = async (data: Partial<UserProfile>) => {
  const response = await api.patch('/profile/update', data);
  return response.data;
};

export const updateSkills = async (skills: Array<{ name: string; level?: string }>, type: 'offered' | 'wanted') => {
  const response = await api.patch('/profile/skills', { skills, type });
  return response.data;
};

export const updateSkillProgress = async (data: {
  skillId: string;
  progress?: number;
  level?: string;
  hoursSpent?: number;
}) => {
  const response = await api.patch('/profile/skills/progress', data);
  return response.data;
};

export const updateUserStatus = async (data: { isOnline?: boolean; lastLogin?: Date }) => {
  const response = await api.patch('/profile/status', data);
  return response.data;
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  const response = await api.patch('/profile/password', data);
  return response.data;
};

export const deleteUserAccount = async () => {
  const response = await api.delete('/profile/delete');
  return response.data;
}; 