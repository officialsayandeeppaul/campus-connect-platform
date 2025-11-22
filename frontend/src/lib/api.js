import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-details', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  getPublicProfile: (userId) => api.get(`/users/${userId}/profile`),
  searchBySkills: (params) => api.get('/users/search/skills', { params }),
  getByCollege: (college) => api.get(`/users/college/${college}`),
  getRecommendations: () => api.get('/users/me/recommendations'),
  update: (id, data) => api.put(`/users/${id}`, data),
  uploadAvatar: (formData) => api.post('/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadResume: (formData) => api.post('/users/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  scanResume: () => api.post('/users/scan-resume'),
  getStats: () => api.get('/users/admin/stats'),
  delete: (id) => api.delete(`/users/${id}`),
};

// Opportunities API
export const opportunitiesAPI = {
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  getTrending: () => api.get('/opportunities/trending'),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  apply: (id, data) => api.post(`/opportunities/${id}/apply`, data),
  save: (id) => api.post(`/opportunities/${id}/save`),
  unsave: (id) => api.delete(`/opportunities/${id}/save`),
  getMyPosts: () => api.get('/opportunities/my/posts'),
  getMySaved: () => api.get('/opportunities/my/saved'),
  getRecommendations: () => api.get('/opportunities/my/recommendations'),
  getMatch: (id) => api.get(`/opportunities/${id}/match`),
  getApplicants: (id) => api.get(`/opportunities/${id}/applicants`),
  updateApplicant: (id, userId, data) => api.put(`/opportunities/${id}/applicants/${userId}`, data),
  uploadLogo: (id, formData) => api.post(`/opportunities/${id}/upload-logo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getStats: () => api.get('/opportunities/admin/stats'),
};

// Collaborations API
export const collaborationsAPI = {
  getAll: (params) => api.get('/collaborations', { params }),
  getById: (id) => api.get(`/collaborations/${id}`),
  getTrending: () => api.get('/collaborations/trending'),
  create: (data) => api.post('/collaborations', data),
  update: (id, data) => api.put(`/collaborations/${id}`, data),
  delete: (id) => api.delete(`/collaborations/${id}`),
  expressInterest: (id, data) => api.post(`/collaborations/${id}/interest`, data),
  acceptMember: (id, userId) => api.post(`/collaborations/${id}/accept/${userId}`),
  rejectMember: (id, userId) => api.post(`/collaborations/${id}/reject/${userId}`),
  removeMember: (id, userId) => api.delete(`/collaborations/${id}/members/${userId}`),
  leave: (id) => api.post(`/collaborations/${id}/leave`),
  save: (id) => api.post(`/collaborations/${id}/save`),
  getMyProjects: () => api.get('/collaborations/my/projects'),
  getMyTeams: () => api.get('/collaborations/my/teams'),
  getMySaved: () => api.get('/collaborations/my/saved'),
  getRecommendations: () => api.get('/collaborations/my/recommendations'),
  getStats: () => api.get('/collaborations/admin/stats'),
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getUpcoming: () => api.get('/events/upcoming'),
  getTrending: () => api.get('/events/trending'),
  getCalendar: (params) => api.get('/events/calendar', { params }),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  cancelRegistration: (id) => api.delete(`/events/${id}/register`),
  expressInterest: (id) => api.post(`/events/${id}/interest`),
  markAttendance: (id, userId) => api.post(`/events/${id}/attendance/${userId}`),
  getAttendees: (id) => api.get(`/events/${id}/attendees`),
  getMyRegistrations: () => api.get('/events/my/registrations'),
  getMyOrganized: () => api.get('/events/my/organized'),
  uploadPoster: (id, formData) => api.post(`/events/${id}/upload-poster`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  sendReminders: (id) => api.post(`/events/${id}/send-reminders`),
  getStats: () => api.get('/events/admin/stats'),
};

// Messages API
export const messagesAPI = {
  getAll: () => api.get('/messages'),
  getConversations: () => api.get('/messages/conversations'),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getMessages: (userId) => api.get(`/messages/conversation/${userId}`),
  send: (data) => api.post('/messages', data),
  sendMessage: (data) => api.post('/messages', data),
  markAsRead: (id) => api.put(`/messages/${id}/read`),
  markAllAsRead: (userId) => api.put('/messages/mark-all-read', { userId }),
  delete: (id) => api.delete(`/messages/${id}`),
  deleteConversation: (userId) => api.delete(`/messages/conversation/${userId}`),
  getUnreadCount: () => api.get('/messages/unread-count'),
  search: (params) => api.get('/messages/search', { params }),
  getStats: () => api.get('/messages/stats'),
};

// Admin API
export const adminAPI = {
  getPlatformStats: () => api.get('/admin/stats'),
  getUserGrowth: () => api.get('/admin/stats/users/growth'),
  getRecentActivity: (limit = 20) => api.get(`/admin/activity?limit=${limit}`),
  banUser: (userId, reason) => api.put(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => api.put(`/admin/users/${userId}/unban`),
  verifyUser: (userId) => api.put(`/admin/users/${userId}/verify`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
};

export default api;
