import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  markAttendance,
  getAttendees,
  expressInterest,
  getMyRegistrations,
  getMyOrganizedEvents,
  getUpcomingEvents,
  getTrendingEvents,
  getEventsByDateRange,
  uploadPoster,
  sendReminders,
  getEventStats,
} from '../controllers/eventController.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

/**
 * Event Routes
 * Base Path: /api/v1/events
 */

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/events
 * @desc    Get all events with filters
 * @access  Public
 */
router.get('/', getEvents);

/**
 * @route   GET /api/v1/events/upcoming
 * @desc    Get upcoming events
 * @access  Public
 */
router.get('/upcoming', getUpcomingEvents);

/**
 * @route   GET /api/v1/events/trending
 * @desc    Get trending events
 * @access  Public
 */
router.get('/trending', getTrendingEvents);

/**
 * @route   GET /api/v1/events/calendar
 * @desc    Get events by date range
 * @access  Public
 */
router.get('/calendar', getEventsByDateRange);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================
// NOTE: These must come BEFORE /:id route to avoid conflicts

/**
 * @route   POST /api/v1/events
 * @desc    Create new event
 * @access  Private
 */
router.post('/', protect, createEvent);

/**
 * @route   GET /api/v1/events/my/registrations
 * @desc    Get my registered events
 * @access  Private
 */
router.get('/my/registrations', protect, getMyRegistrations);

/**
 * @route   GET /api/v1/events/my/organized
 * @desc    Get my organized events
 * @access  Private
 */
router.get('/my/organized', protect, getMyOrganizedEvents);

/**
 * @route   GET /api/v1/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', getEventById);

/**
 * @route   PUT /api/v1/events/:id
 * @desc    Update event
 * @access  Private (Organizer or Admin)
 */
router.put('/:id', protect, updateEvent);

/**
 * @route   DELETE /api/v1/events/:id
 * @desc    Delete event
 * @access  Private (Organizer or Admin)
 */
router.delete('/:id', protect, deleteEvent);

/**
 * @route   POST /api/v1/events/:id/register
 * @desc    Register for event
 * @access  Private
 */
router.post('/:id/register', protect, registerForEvent);

/**
 * @route   DELETE /api/v1/events/:id/register
 * @desc    Cancel event registration
 * @access  Private
 */
router.delete('/:id/register', protect, cancelRegistration);

/**
 * @route   POST /api/v1/events/:id/interest
 * @desc    Express interest in event
 * @access  Private
 */
router.post('/:id/interest', protect, expressInterest);

/**
 * @route   POST /api/v1/events/:id/attendance/:userId
 * @desc    Mark attendance
 * @access  Private (Organizer or Admin)
 */
router.post('/:id/attendance/:userId', protect, markAttendance);

/**
 * @route   GET /api/v1/events/:id/attendees
 * @desc    Get event attendees
 * @access  Private (Organizer or Admin)
 */
router.get('/:id/attendees', protect, getAttendees);

/**
 * @route   POST /api/v1/events/:id/upload-poster
 * @desc    Upload event poster
 * @access  Private (Organizer or Admin)
 */
router.post('/:id/upload-poster', protect, uploadSingle('poster'), uploadPoster);

/**
 * @route   POST /api/v1/events/:id/send-reminders
 * @desc    Send event reminders to attendees
 * @access  Private (Organizer or Admin)
 */
router.post('/:id/send-reminders', protect, sendReminders);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * @route   GET /api/v1/events/admin/stats
 * @desc    Get event statistics
 * @access  Private (Admin only)
 */
router.get('/admin/stats', protect, authorize('admin'), getEventStats);

export default router;
