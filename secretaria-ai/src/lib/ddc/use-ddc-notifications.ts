// ZEHLA DDC - Cognitive OS Command Center
// Hook: use-ddc-notifications
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types/ddc';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from './api';

interface UseDDCNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => void;
}

export function useDDCNotifications(autoRefresh: boolean = true): UseDDCNotificationsReturn {
  const queryClient = useQueryClient();

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['ddc-notifications'],
    queryFn: () => fetchNotifications(),
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 15000
  });

  // Derive notifications from query data
  const notifications = useMemo(() => {
    if (notificationsData?.success && notificationsData.data) {
      return notificationsData.data;
    }
    return [];
  }, [notificationsData]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData<{ success: boolean; data: Notification[] }>(
        ['ddc-notifications'],
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.map(n =>
              n.id === notificationId ? { ...n, status: 'read' as const, readAt: new Date() } : n
            )
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['ddc-notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.setQueryData(
        ['ddc-notifications'],
        (prev: any) =>        prev.map(n => ({ ...n, read: true }))  
     );  
     queryClient.invalidateQueries({ queryKey: ['ddc-notifications'] });  
   }  
 });

 const markAsRead = useCallback(async (notificationId: string) => {  
   try {  
     await markAsReadMutation.mutateAsync(notificationId);  
   } catch (err) {  
     console.error('Error marking notification as read:', err);  
     throw err;  
   }  
 }, [markAsReadMutation]);

 const markAllAsRead = useCallback(async () => {  
   try {  
     await markAllAsReadMutation.mutateAsync();  
   } catch (err) {  
     console.error('Error marking all notifications as read:', err);  
     throw err;  
   }  
 }, [markAllAsReadMutation]);

 return {  
   notifications,  
   unreadCount,  
   isLoading,  
   error: error as Error | null,  
   markAsRead,  
   markAllAsRead,  
   refreshNotifications: () => refetch()  
 };  
}

export function useNotificationListener() {  
 const [lastNotification, setLastNotification] = useState<Notification | null>(null);

 useEffect(() => {  
   const handleNewNotification = (event: CustomEvent<Notification>) => {  
     setLastNotification(event.detail);

     try {  
       const audio = new Audio('/sounds/notification.mp3');  
       audio.play().catch(() => {});  
     } catch {}

     if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {  
       new Notification(event.detail.title, {  
         body: event.detail.message,  
         icon: '/logo.svg'  
       });  
     }  
   };

   window.addEventListener('ddc:new-notification', handleNewNotification as EventListener);

   if (typeof Notification !== 'undefined' && Notification.permission === 'default') {  
     Notification.requestPermission();  
   }

   return () => {  
     window.removeEventListener('ddc:new-notification', handleNewNotification as EventListener);  
   };  
 }, []);

 return lastNotification;  
}

export function useNotificationCategories(notifications: Notification[]) {  
 const categories = {  
   new_guest: notifications.filter(n => n.type === 'new_guest'),  
   booking_created: notifications.filter(n => n.type === 'booking_created'),  
   payment_received: notifications.filter(n => n.type === 'payment_received'),  
   ai_offline: notifications.filter(n => n.type === 'ai_offline'),  
   escalation_needed: notifications.filter(n => n.type === 'escalation_needed')  
 };

 const getNotificationsByPriority = (priority: Notification['priority']) => {  
   return notifications.filter(n => n.priority === priority);  
 };

 return {  
   categories,  
   getNotificationsByPriority,  
   urgentNotifications: categories.ai_offline.concat(categories.escalation_needed)  
 };  
}  

