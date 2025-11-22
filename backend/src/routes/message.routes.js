import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getConversations,
  getConversation,
  sendMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  markAllAsRead,
  deleteConversation,
  searchMessages,
  getMessageStats,
} from '../controllers/messageController.js';

const router = express.Router();

/**
 * Message Routes
 * Base Path: /api/v1/messages
 * All routes require authentication
 */

// ============================================
// PROTECTED ROUTES (All require authentication)
// ============================================

/**
 * @route   GET /api/v1/messages
 * @desc    Get all user conversations
 * @access  Private
 */
router.get('/', protect, getConversations);

/**
 * @route   GET /api/v1/messages/conversations
 * @desc    Get all user conversations (alias)
 * @access  Private
 */
router.get('/conversations', protect, getConversations);

/**
 * @route   GET /api/v1/messages/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', protect, getUnreadCount);

/**
 * @route   GET /api/v1/messages/stats
 * @desc    Get message statistics
 * @access  Private
 */
router.get('/stats', protect, getMessageStats);

/**
 * @route   GET /api/v1/messages/search
 * @desc    Search messages
 * @access  Private
 */
router.get('/search', protect, searchMessages);

/**
 * @route   GET /api/v1/messages/conversation/:userId
 * @desc    Get conversation with specific user
 * @access  Private
 */
router.get('/conversation/:userId', protect, getConversation);

/**
 * @route   POST /api/v1/messages
 * @desc    Send message
 * @access  Private
 */
router.post('/', protect, sendMessage);

/**
 * @route   PUT /api/v1/messages/mark-all-read
 * @desc    Mark all messages from user as read
 * @access  Private
 */
router.put('/mark-all-read', protect, markAllAsRead);

/**
 * @route   PUT /api/v1/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @route   DELETE /api/v1/messages/:id
 * @desc    Delete message
 * @access  Private
 */
router.delete('/:id', protect, deleteMessage);

/**
 * @route   DELETE /api/v1/messages/conversation/:userId
 * @desc    Delete entire conversation
 * @access  Private
 */
router.delete('/conversation/:userId', protect, deleteConversation);

export default router;
