/**
 * Notification Service
 * Handles in-app notifications and push notifications
 */

// In-memory notification store (use Redis in production)
const notifications = new Map();

/**
 * Create notification
 */
export const createNotification = async (userId, notification) => {
  try {
    const userNotifications = notifications.get(userId) || [];
    
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      isRead: false,
      createdAt: new Date(),
    };

    userNotifications.unshift(newNotification);
    notifications.set(userId, userNotifications);

    return newNotification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, limit = 20) => {
  try {
    const userNotifications = notifications.get(userId) || [];
    return userNotifications.slice(0, limit);
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (userId, notificationId) => {
  try {
    const userNotifications = notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.isRead = true;
      notifications.set(userId, userNotifications);
    }

    return notification;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (userId) => {
  try {
    const userNotifications = notifications.get(userId) || [];
    userNotifications.forEach(n => n.isRead = true);
    notifications.set(userId, userNotifications);
    
    return { success: true };
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (userId, notificationId) => {
  try {
    const userNotifications = notifications.get(userId) || [];
    const filtered = userNotifications.filter(n => n.id !== notificationId);
    notifications.set(userId, filtered);
    
    return { success: true };
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (userId) => {
  try {
    const userNotifications = notifications.get(userId) || [];
    return userNotifications.filter(n => !n.isRead).length;
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

// Notification templates
export const NotificationTypes = {
  OPPORTUNITY_APPLICATION: 'opportunity_application',
  COLLABORATION_INTEREST: 'collaboration_interest',
  EVENT_REGISTRATION: 'event_registration',
  EVENT_REMINDER: 'event_reminder',
  MESSAGE_RECEIVED: 'message_received',
  PROFILE_VIEW: 'profile_view',
  SKILL_MATCH: 'skill_match',
};

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  NotificationTypes,
};
