import { apiClient, buildQueryString } from './api';
import { ApiResponse } from '@/types';

export interface SupportTicket {
  _id: string;
  student: string;
  title: string;
  description: string;
  category: 'academic' | 'technical' | 'financial' | 'administrative' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    department: string;
    role: string;
  };
  attachments: Array<{
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: string;
  }>;
  messages: Array<{
    _id: string;
    sender: {
      _id: string;
      name: string;
      role: 'student' | 'staff' | 'admin';
    };
    message: string;
    timestamp: string;
    attachments?: Array<{
      filename: string;
      url: string;
    }>;
  }>;
  tags: string[];
  resolution?: {
    summary: string;
    resolvedBy: string;
    resolvedAt: string;
    satisfaction?: number;
    feedback?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    role: 'student' | 'staff' | 'admin' | 'bot';
    avatar?: string;
  };
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    filename: string;
    url: string;
    type: string;
  }>;
  readBy: Array<{
    user: string;
    readAt: string;
  }>;
  timestamp: string;
}

export interface ChatConversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    role: string;
    avatar?: string;
    lastSeen?: string;
  }>;
  type: 'direct' | 'group' | 'support';
  title?: string;
  description?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: 'academic' | 'administrative' | 'event' | 'emergency' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: Array<'all_students' | 'specific_program' | 'specific_level' | 'specific_department'>;
  targetCriteria?: {
    programs?: string[];
    levels?: string[];
    departments?: string[];
    faculties?: string[];
  };
  author: {
    _id: string;
    name: string;
    role: string;
    department?: string;
  };
  attachments?: Array<{
    filename: string;
    url: string;
    type: string;
  }>;
  publishedAt: string;
  expiresAt?: string;
  isRead: boolean;
  readAt?: string;
  isPinned: boolean;
  allowComments: boolean;
  comments?: Array<{
    _id: string;
    author: {
      name: string;
      role: string;
    };
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isHelpful?: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  views: number;
  lastUpdated: string;
}

export interface AdvisorMeeting {
  _id: string;
  student: string;
  advisor: {
    _id: string;
    name: string;
    email: string;
    department: string;
    title: string;
    avatar?: string;
    officeLocation?: string;
    officeHours?: string;
  };
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // in minutes
  meetingType: 'in_person' | 'virtual' | 'phone';
  meetingLink?: string;
  location?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  agenda?: string[];
  notes?: string;
  followUpActions?: Array<{
    action: string;
    dueDate?: string;
    completed: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SupportFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export const supportService = {
  // Support Tickets
  getTickets: async (filters: SupportFilters = {}): Promise<{ tickets: SupportTicket[]; total: number; page: number; totalPages: number }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ tickets: SupportTicket[]; pagination: any }>>(
      `/student/support/tickets${queryString}`
    );
    return {
      tickets: response.data.data.tickets,
      total: response.data.data.pagination.total,
      page: response.data.data.pagination.page,
      totalPages: response.data.data.pagination.totalPages,
    };
  },

  getTicket: async (ticketId: string): Promise<SupportTicket> => {
    const response = await apiClient.get<ApiResponse<{ ticket: SupportTicket }>>(
      `/student/support/tickets/${ticketId}`
    );
    return response.data.data.ticket;
  },

  createTicket: async (ticket: {
    title: string;
    description: string;
    category: string;
    priority: string;
    attachments?: File[];
  }): Promise<SupportTicket> => {
    const formData = new FormData();
    formData.append('title', ticket.title);
    formData.append('description', ticket.description);
    formData.append('category', ticket.category);
    formData.append('priority', ticket.priority);
    
    if (ticket.attachments) {
      ticket.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<ApiResponse<{ ticket: SupportTicket }>>(
      '/student/support/tickets',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.ticket;
  },

  addTicketMessage: async (ticketId: string, message: string, attachments?: File[]): Promise<SupportTicket> => {
    const formData = new FormData();
    formData.append('message', message);
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<ApiResponse<{ ticket: SupportTicket }>>(
      `/student/support/tickets/${ticketId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.ticket;
  },

  closeTicket: async (ticketId: string, feedback?: { satisfaction: number; comment: string }): Promise<SupportTicket> => {
    const response = await apiClient.patch<ApiResponse<{ ticket: SupportTicket }>>(
      `/student/support/tickets/${ticketId}/close`,
      feedback
    );
    return response.data.data.ticket;
  },

  // Chat & Messaging
  getConversations: async (): Promise<ChatConversation[]> => {
    const response = await apiClient.get<ApiResponse<{ conversations: ChatConversation[] }>>(
      '/student/chat/conversations'
    );
    return response.data.data.conversations;
  },

  getConversation: async (conversationId: string): Promise<ChatConversation> => {
    const response = await apiClient.get<ApiResponse<{ conversation: ChatConversation }>>(
      `/student/chat/conversations/${conversationId}`
    );
    return response.data.data.conversation;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<{ messages: ChatMessage[]; hasMore: boolean }> => {
    const queryString = buildQueryString({ page, limit });
    const response = await apiClient.get<ApiResponse<{ messages: ChatMessage[]; hasMore: boolean }>>(
      `/student/chat/conversations/${conversationId}/messages${queryString}`
    );
    return response.data.data;
  },

  sendMessage: async (conversationId: string, message: string, attachments?: File[]): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('message', message);
    
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<ApiResponse<{ message: ChatMessage }>>(
      `/student/chat/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.message;
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.patch(`/student/chat/conversations/${conversationId}/read`);
  },

  // Announcements
  getAnnouncements: async (filters: {
    category?: string;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ announcements: Announcement[]; total: number; unreadCount: number }> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<ApiResponse<{ announcements: Announcement[]; pagination: any; unreadCount: number }>>(
      `/student/announcements${queryString}`
    );
    return {
      announcements: response.data.data.announcements,
      total: response.data.data.pagination.total,
      unreadCount: response.data.data.unreadCount,
    };
  },

  markAnnouncementAsRead: async (announcementId: string): Promise<void> => {
    await apiClient.patch(`/student/announcements/${announcementId}/read`);
  },

  // FAQ
  getFAQs: async (category?: string, search?: string): Promise<FAQ[]> => {
    const queryString = buildQueryString({ category, search });
    const response = await apiClient.get<ApiResponse<{ faqs: FAQ[] }>>(
      `/student/support/faq${queryString}`
    );
    return response.data.data.faqs;
  },

  markFAQHelpful: async (faqId: string, helpful: boolean): Promise<void> => {
    await apiClient.post(`/student/support/faq/${faqId}/feedback`, { helpful });
  },

  // Academic Advisor
  getAdvisorInfo: async (): Promise<{
    advisor: {
      _id: string;
      name: string;
      email: string;
      department: string;
      title: string;
      avatar?: string;
      officeLocation?: string;
      officeHours?: string;
      bio?: string;
    };
    upcomingMeetings: AdvisorMeeting[];
    recentMeetings: AdvisorMeeting[];
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/student/advisor');
    return response.data.data;
  },

  scheduleMeeting: async (meeting: {
    title: string;
    description?: string;
    scheduledAt: string;
    duration: number;
    meetingType: string;
    agenda?: string[];
  }): Promise<AdvisorMeeting> => {
    const response = await apiClient.post<ApiResponse<{ meeting: AdvisorMeeting }>>(
      '/student/advisor/meetings',
      meeting
    );
    return response.data.data.meeting;
  },

  getMeetings: async (): Promise<AdvisorMeeting[]> => {
    const response = await apiClient.get<ApiResponse<{ meetings: AdvisorMeeting[] }>>(
      '/student/advisor/meetings'
    );
    return response.data.data.meetings;
  },

  cancelMeeting: async (meetingId: string, reason?: string): Promise<void> => {
    await apiClient.patch(`/student/advisor/meetings/${meetingId}/cancel`, { reason });
  },

  // Support Statistics
  getSupportStats: async (): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    satisfactionRating: number;
  }> => {
    const response = await apiClient.get<ApiResponse<any>>('/student/support/stats');
    return response.data.data;
  },
};

export default supportService;
