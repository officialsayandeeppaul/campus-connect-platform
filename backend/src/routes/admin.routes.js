import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Opportunity from '../models/Opportunity.js';
import Event from '../models/Event.js';
import Collaboration from '../models/Collaboration.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @desc    Get platform statistics
 * @route   GET /api/v1/admin/stats
 * @access  Private (Admin only)
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  const stats = {
    users: {
      total: await User.countDocuments(),
      students: await User.countDocuments({ role: 'student' }),
      recruiters: await User.countDocuments({ role: 'recruiter' }),
      admins: await User.countDocuments({ role: 'admin' }),
      active: await User.countDocuments({ isActive: true }),
      verified: await User.countDocuments({ isVerified: true }),
      newThisMonth: await User.countDocuments({
        createdAt: { $gte: startOfMonth }
      }),
      newThisWeek: await User.countDocuments({
        createdAt: { $gte: startOfWeek }
      }),
    },
    
    opportunities: {
      total: await Opportunity.countDocuments(),
      active: await Opportunity.countDocuments({ status: 'active' }),
      inactive: await Opportunity.countDocuments({ status: 'inactive' }),
      totalViews: await Opportunity.aggregate([
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]).then(res => res[0]?.total || 0),
      totalApplications: await Opportunity.aggregate([
        { $project: { count: { $size: '$applicants' } } },
        { $group: { _id: null, total: { $sum: '$count' } } }
      ]).then(res => res[0]?.total || 0),
    },
    
    events: {
      total: await Event.countDocuments(),
      upcoming: await Event.countDocuments({ status: 'upcoming' }),
      ongoing: await Event.countDocuments({ status: 'ongoing' }),
      completed: await Event.countDocuments({ status: 'completed' }),
      totalAttendees: await Event.aggregate([
        { $project: { count: { $size: '$attendees' } } },
        { $group: { _id: null, total: { $sum: '$count' } } }
      ]).then(res => res[0]?.total || 0),
    },
    
    collaborations: {
      total: await Collaboration.countDocuments(),
      open: await Collaboration.countDocuments({ status: 'open' }),
      inProgress: await Collaboration.countDocuments({ status: 'in-progress' }),
      completed: await Collaboration.countDocuments({ status: 'completed' }),
    },
    
    engagement: {
      totalMessages: await Message.countDocuments(),
      messagesThisWeek: await Message.countDocuments({
        createdAt: { $gte: startOfWeek }
      }),
    }
  };

  sendSuccess(res, { stats }, 'Platform statistics retrieved successfully');
}));

/**
 * @desc    Get user growth data
 * @route   GET /api/v1/admin/stats/users/growth
 * @access  Private (Admin only)
 */
router.get('/stats/users/growth', asyncHandler(async (req, res) => {
  const months = 12;
  const growth = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const count = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    growth.push({
      month: startOfMonth.toLocaleString('default', { month: 'short', year: 'numeric' }),
      count
    });
  }
  
  sendSuccess(res, { growth }, 'User growth data retrieved');
}));

/**
 * @desc    Ban user
 * @route   PUT /api/v1/admin/users/:userId/ban
 * @access  Private (Admin only)
 */
router.put('/users/:userId/ban', asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { 
      isActive: false,
      bannedAt: new Date(),
      bannedBy: req.user.id,
      banReason: reason || 'Violation of terms of service'
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, { user }, 'User banned successfully');
}));

/**
 * @desc    Unban user
 * @route   PUT /api/v1/admin/users/:userId/unban
 * @access  Private (Admin only)
 */
router.put('/users/:userId/unban', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { 
      isActive: true,
      $unset: { bannedAt: '', bannedBy: '', banReason: '' }
    },
    { new: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, { user }, 'User unbanned successfully');
}));

/**
 * @desc    Verify user manually
 * @route   PUT /api/v1/admin/users/:userId/verify
 * @access  Private (Admin only)
 */
router.put('/users/:userId/verify', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.userId,
    { isVerified: true },
    { new: true }
  ).select('-password');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, { user }, 'User verified successfully');
}));

/**
 * @desc    Delete user permanently
 * @route   DELETE /api/v1/admin/users/:userId
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, null, 'User deleted permanently');
}));

/**
 * @desc    Get recent activity
 * @route   GET /api/v1/admin/activity
 * @access  Private (Admin only)
 */
router.get('/activity', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  // Get recent users
  const recentUsers = await User.find()
    .sort('-createdAt')
    .limit(limit)
    .select('fullName email role createdAt');

  // Get recent opportunities
  const recentOpportunities = await Opportunity.find()
    .sort('-createdAt')
    .limit(limit)
    .populate('postedBy', 'fullName email')
    .select('title company createdAt');

  // Get recent events
  const recentEvents = await Event.find()
    .sort('-createdAt')
    .limit(limit)
    .populate('organizer', 'fullName email')
    .select('title eventType createdAt');

  // Combine and sort by date
  const activities = [
    ...recentUsers.map(u => ({
      type: 'user',
      user: { fullName: u.fullName, email: u.email, role: u.role },
      timestamp: u.createdAt
    })),
    ...recentOpportunities.map(o => ({
      type: 'opportunity',
      opportunity: { title: o.title, company: o.company },
      postedBy: o.postedBy,
      timestamp: o.createdAt
    })),
    ...recentEvents.map(e => ({
      type: 'event',
      event: { title: e.title, eventType: e.eventType },
      organizer: e.organizer,
      timestamp: e.createdAt
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

  sendSuccess(res, { activities }, 'Recent activity retrieved');
}));

export default router;
