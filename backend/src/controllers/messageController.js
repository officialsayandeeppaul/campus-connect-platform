import Message from '../models/Message.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendNewMessageEmail } from '../services/emailService.js';

/**
 * Message Controller
 * Handles direct messaging between users
 */

/**
 * @desc    Get user conversations
 * @route   GET /api/v1/messages
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Message.getUserConversations(req.user.id);

  sendSuccess(
    res,
    { conversations, count: conversations.length },
    'Conversations retrieved successfully'
  );
});

/**
 * @desc    Get conversation with specific user
 * @route   GET /api/v1/messages/conversation/:userId
 * @access  Private
 */
export const getConversation = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const messages = await Message.getConversation(
    req.user.id,
    req.params.userId,
    parseInt(limit)
  );

  // Mark messages as read
  const unreadMessages = messages.filter(
    msg => msg.receiver.toString() === req.user.id && !msg.isRead
  );

  await Promise.all(unreadMessages.map(msg => msg.markAsRead()));

  sendSuccess(
    res,
    { messages, count: messages.length },
    'Conversation retrieved successfully'
  );
});

/**
 * @desc    Send message
 * @route   POST /api/v1/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, content, messageType = 'text', attachments } = req.body;

  if (!receiver || !content) {
    throw ApiError.badRequest('Please provide receiver and content');
  }

  // Check if receiver exists
  const receiverUser = await User.findById(receiver);
  if (!receiverUser) {
    throw ApiError.notFound('Receiver not found');
  }

  // Cannot send message to self
  if (receiver === req.user.id) {
    throw ApiError.badRequest('Cannot send message to yourself');
  }

  // Create message
  const message = await Message.create({
    sender: req.user.id,
    receiver,
    content,
    messageType,
    attachments: attachments || [],
  });

  // Populate sender and receiver
  await message.populate('sender', 'fullName email avatar');
  await message.populate('receiver', 'fullName email avatar');

  // Send email notification (non-blocking)
  const sender = await User.findById(req.user.id);
  const messagePreview = content.substring(0, 100);
  sendNewMessageEmail(sender, receiverUser, messagePreview).catch(err =>
    console.error('Message notification email failed:', err.message)
  );

  sendSuccess(res, { message }, 'Message sent successfully', 201);
});

/**
 * @desc    Mark message as read
 * @route   PUT /api/v1/messages/:id/read
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  // Only receiver can mark as read
  if (message.receiver.toString() !== req.user.id) {
    throw ApiError.forbidden('Not authorized to mark this message as read');
  }

  await message.markAsRead();

  sendSuccess(res, { message }, 'Message marked as read');
});

/**
 * @desc    Delete message
 * @route   DELETE /api/v1/messages/:id
 * @access  Private
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    throw ApiError.notFound('Message not found');
  }

  // Only sender or receiver can delete
  if (
    message.sender.toString() !== req.user.id &&
    message.receiver.toString() !== req.user.id
  ) {
    throw ApiError.forbidden('Not authorized to delete this message');
  }

  await message.deleteForUser(req.user.id);

  sendSuccess(res, null, 'Message deleted successfully');
});

/**
 * @desc    Get unread message count
 * @route   GET /api/v1/messages/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.getUnreadCount(req.user.id);

  sendSuccess(res, { count }, 'Unread count retrieved successfully');
});

/**
 * @desc    Mark all messages as read
 * @route   PUT /api/v1/messages/mark-all-read
 * @access  Private
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw ApiError.badRequest('Please provide userId');
  }

  // Mark all messages from specific user as read
  await Message.updateMany(
    {
      sender: userId,
      receiver: req.user.id,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  sendSuccess(res, null, 'All messages marked as read');
});

/**
 * @desc    Delete conversation
 * @route   DELETE /api/v1/messages/conversation/:userId
 * @access  Private
 */
export const deleteConversation = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user.id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user.id },
    ],
  });

  // Delete for current user
  await Promise.all(messages.map(msg => msg.deleteForUser(req.user.id)));

  sendSuccess(res, null, 'Conversation deleted successfully');
});

/**
 * @desc    Search messages
 * @route   GET /api/v1/messages/search
 * @access  Private
 */
export const searchMessages = asyncHandler(async (req, res) => {
  const { query, limit = 50 } = req.query;

  if (!query) {
    throw ApiError.badRequest('Please provide search query');
  }

  const messages = await Message.find({
    $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    content: new RegExp(query, 'i'),
    deletedBy: { $nin: [req.user.id] },
  })
    .populate('sender', 'fullName email avatar')
    .populate('receiver', 'fullName email avatar')
    .sort('-createdAt')
    .limit(parseInt(limit));

  sendSuccess(
    res,
    { messages, count: messages.length },
    'Messages found successfully'
  );
});

/**
 * @desc    Get message statistics
 * @route   GET /api/v1/messages/stats
 * @access  Private
 */
export const getMessageStats = asyncHandler(async (req, res) => {
  const totalSent = await Message.countDocuments({ sender: req.user.id });
  const totalReceived = await Message.countDocuments({ receiver: req.user.id });
  const unreadCount = await Message.getUnreadCount(req.user.id);
  const conversations = await Message.getUserConversations(req.user.id);

  sendSuccess(
    res,
    {
      totalSent,
      totalReceived,
      unreadCount,
      totalConversations: conversations.length,
    },
    'Statistics retrieved successfully'
  );
});

export default {
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
};
