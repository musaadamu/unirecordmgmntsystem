import { apiClient } from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<{ notifications: Notification[] }>('/notifications');
    return response.data.notifications;
  },
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.post(`/notifications/${id}/read`);
  },
  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
