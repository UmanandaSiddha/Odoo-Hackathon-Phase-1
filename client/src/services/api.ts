import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

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

// Notification Types
export interface NotificationResponse {
  id: string;
  type: 'SWAP' | 'MESSAGE' | 'SYSTEM' | 'REVIEW';
  title: string;
  description: string;
  isRead: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  actionUrl: string | null;
  metadata: any;
  timestamp: string;
}

export interface NotificationStats {
  unread: number;
  weekly: number;
  total: number;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NotificationsData {
  notifications: NotificationResponse[];
  stats: NotificationStats;
  pagination: NotificationPagination;
}

// Notification API calls
export const getNotifications = async (filter: 'all' | 'unread' | 'read' = 'all', page = 1, limit = 20) => {
  const response = await api.get<APIResponse<NotificationsData>>(`/notifications?filter=${filter}&page=${page}&limit=${limit}`);
  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.patch<APIResponse<NotificationResponse>>(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch<APIResponse<{ message: string }>>('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await api.delete<APIResponse<{ message: string }>>(`/notifications/${id}`);
  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await api.delete<APIResponse<{ message: string }>>('/notifications');
  return response.data;
}; 

// Swap Types
export interface SwapStats {
  pending: number;
  active: number;
  completed: number;
  hoursExchanged: number;
}

export interface SwapPartner {
  name: string;
  avatar: string;
  rating: number;
}

export interface SwapSkill {
  name: string;
  level: string;
}

export interface SwapResponse {
  id: string;
  title: string;
  with: SwapPartner;
  skillToTeach: SwapSkill;
  skillToLearn: SwapSkill;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  date: string;
  duration: string;
  messages: number;
  lastActive: string;
}

export interface SwapPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SwapRequest {
  receiverId: string;
  skillOffered: string;
  skillWanted: string;
  duration?: number;
}

// Swap API calls
export const getSwapStats = async () => {
  const response = await api.get<APIResponse<{ stats: SwapStats }>>('/swaps/stats');
  return response.data;
};

export const getSwaps = async (status: string = 'all', search: string = '', page: number = 1, limit: number = 10) => {
  const response = await api.get<APIResponse<{ swaps: SwapResponse[], pagination: SwapPagination }>>(
    `/swaps?status=${status}&search=${search}&page=${page}&limit=${limit}`
  );
  return response.data;
};

export const sendSwapRequest = async (request: SwapRequest) => {
  const response = await api.post<APIResponse<{ message: string, request: any }>>('/requests', request);
  return response.data;
};

export const acceptSwapRequest = async (id: string) => {
  const response = await api.patch<APIResponse<{ message: string, request: any }>>(`/requests/${id}/accept`);
  return response.data;
};

export const completeSwap = async (id: string) => {
  const response = await api.patch<APIResponse<{ message: string, request: any }>>(`/requests/${id}/complete`);
  return response.data;
};

export const deleteSwapRequest = async (id: string) => {
  const response = await api.delete<APIResponse<{ message: string }>>(`/requests/${id}`);
  return response.data;
}; 

// Chat Interfaces
export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'me' | 'other';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  contact: ChatContact;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  totalMessages: number;
}

// Chat API Functions
export const getConversations = async (): Promise<Conversation[]> => {
  const response = await api.get('/conversations');
  return response.data.conversations;
};

export const getMessagesForConversation = async (
  conversationId: string,
  page = 1,
  limit = 20
): Promise<{
  messages: ChatMessage[];
  totalMessages: number;
  totalPages: number;
  currentPage: number;
}> => {
  const response = await api.get(`/conversations/${conversationId}/messages`, {
    params: { page, limit, sort: 'createdAt_desc' }
  });
  return response.data;
};

export const sendMessage = async (recipientId: string, message: string): Promise<ChatMessage> => {
  const response = await api.post(`/messages/${recipientId}`, { message });
  return response.data.chat;
};

export const updateMessageStatus = async (messageId: string, status: 'delivered' | 'read'): Promise<void> => {
  await api.patch(`/messages/${messageId}/status`, { status });
};

export const searchContacts = async (query: string): Promise<ChatContact[]> => {
  const response = await api.get('/contacts/search', {
    params: { query }
  });
  return response.data.contacts;
}; 