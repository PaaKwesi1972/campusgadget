import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

// Messages that haven't been replied to yet
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const data = await apiRequest('/api/messages', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const count = data.conversations.filter(
          (c) => c.last_sender_id && c.last_sender_id !== currentUser.id
        ).length;
        setUnreadCount(count);
      } catch (err) {
        // Fail silently — badge just won't show if this errors
      }
    }
    fetchCount();
  }, []);

  return unreadCount;
}

// Real unread notification count (messages received, reviews received)
export function useNotificationCount() {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const data = await apiRequest('/api/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotificationCount(data.count);
      } catch (err) {
        // Fail silently
      }
    }
    fetchCount();
  }, []);

  return notificationCount;
}
