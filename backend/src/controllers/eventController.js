import Event from '../models/Event.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import { sendEventRegistrationEmail, sendEventReminderEmail } from '../services/emailService.js';
import { uploadEventPoster } from '../services/uploadService.js';

/**
 * Event Controller
 * Handles campus event operations
 */

/**
 * @desc    Get all events with filters
 * @route   GET /api/v1/events
 * @access  Public
 */
export const getEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    eventType,
    category,
    mode,
    status = 'upcoming',
    search,
  } = req.query;

  const { skip, limit: limitNum } = getPagination(page, limit);

  // Build query
  const query = { isPublished: true };

  if (status === 'upcoming') {
    query.status = 'upcoming';
    query.startDate = { $gte: new Date() };
  } else if (status) {
    query.status = status;
  }

  if (eventType) query.eventType = eventType;
  if (category) query.category = category;
  if (mode) query.mode = mode;

  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  const events = await Event.find(query)
    .populate('organizer', 'fullName email college avatar')
    .skip(skip)
    .limit(limitNum)
    .sort('startDate');

  const total = await Event.countDocuments(query);

  sendPaginatedResponse(
    res,
    events,
    page,
    limitNum,
    total,
    'Events retrieved successfully'
  );
});

/**
 * @desc    Get event by ID
 * @route   GET /api/v1/events/:id
 * @access  Public
 */
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'fullName email college avatar')
    .populate('attendees.user', 'fullName email college avatar');

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Increment view count
  await event.incrementViews();

  sendSuccess(res, { event }, 'Event retrieved successfully');
});

/**
 * @desc    Create new event
 * @route   POST /api/v1/events
 * @access  Private
 */
export const createEvent = asyncHandler(async (req, res) => {
  const eventData = {
    ...req.body,
    organizer: req.user.id,
  };

  const event = await Event.create(eventData);

  sendSuccess(res, { event }, 'Event created successfully', 201);
});

/**
 * @desc    Update event
 * @route   PUT /api/v1/events/:id
 * @access  Private (Organizer or Admin)
 */
export const updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check ownership
  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this event');
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, { event }, 'Event updated successfully');
});

/**
 * @desc    Delete event
 * @route   DELETE /api/v1/events/:id
 * @access  Private (Organizer or Admin)
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check ownership
  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this event');
  }

  await Event.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Event deleted successfully');
});

/**
 * @desc    Register for event
 * @route   POST /api/v1/events/:id/register
 * @access  Private
 */
export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    'organizer',
    'fullName email'
  );

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check if already registered
  if (event.isUserRegistered(req.user.id)) {
    throw ApiError.badRequest('You are already registered for this event');
  }

  // Check if registration is open
  if (!event.isRegistrationOpen) {
    throw ApiError.badRequest('Event registration is closed');
  }

  // Get user details
  const user = await User.findById(req.user.id);

  // Register user
  await event.registerUser(req.user.id);

  // Update user stats
  user.stats.eventsAttended += 1;
  await user.save();

  // Send confirmation email
  sendEventRegistrationEmail(event, user).catch(err =>
    console.error('Registration email failed:', err.message)
  );

  sendSuccess(res, { event }, 'Registration successful');
});

/**
 * @desc    Cancel event registration
 * @route   DELETE /api/v1/events/:id/register
 * @access  Private
 */
export const cancelRegistration = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check if registered
  if (!event.isUserRegistered(req.user.id)) {
    throw ApiError.badRequest('You are not registered for this event');
  }

  await event.cancelRegistration(req.user.id);

  sendSuccess(res, { event }, 'Registration cancelled successfully');
});

/**
 * @desc    Mark attendance
 * @route   POST /api/v1/events/:id/attendance/:userId
 * @access  Private (Organizer or Admin)
 */
export const markAttendance = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check ownership
  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to mark attendance');
  }

  await event.markAttendance(req.params.userId);

  sendSuccess(res, { event }, 'Attendance marked successfully');
});

/**
 * @desc    Get event attendees
 * @route   GET /api/v1/events/:id/attendees
 * @access  Private (Organizer or Admin)
 */
export const getAttendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    'attendees.user',
    'fullName email college phone avatar'
  );

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check ownership
  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to view attendees');
  }

  sendSuccess(
    res,
    {
      attendees: event.attendees,
      count: event.attendees.length,
    },
    'Attendees retrieved successfully'
  );
});

/**
 * @desc    Express interest in event
 * @route   POST /api/v1/events/:id/interest
 * @access  Private
 */
export const expressInterest = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check if already interested
  if (event.interested.includes(req.user.id)) {
    // Remove interest
    event.interested = event.interested.filter(
      id => id.toString() !== req.user.id
    );
    await event.save();
    return sendSuccess(res, { event }, 'Interest removed');
  }

  // Add interest
  event.interested.push(req.user.id);
  await event.save();

  sendSuccess(res, { event }, 'Interest expressed successfully');
});

/**
 * @desc    Get my registered events
 * @route   GET /api/v1/events/my/registrations
 * @access  Private
 */
export const getMyRegistrations = asyncHandler(async (req, res) => {
  const events = await Event.find({
    'attendees.user': req.user.id,
    'attendees.status': { $in: ['registered', 'attended'] },
  })
    .populate('organizer', 'fullName email college avatar')
    .sort('startDate');

  sendSuccess(
    res,
    { events, count: events.length },
    'Your registrations retrieved successfully'
  );
});

/**
 * @desc    Get my organized events
 * @route   GET /api/v1/events/my/organized
 * @access  Private
 */
export const getMyOrganizedEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user.id })
    .populate('attendees.user', 'fullName email college')
    .sort('-createdAt');

  sendSuccess(
    res,
    { events, count: events.length },
    'Your organized events retrieved successfully'
  );
});

/**
 * @desc    Get upcoming events
 * @route   GET /api/v1/events/upcoming
 * @access  Public
 */
export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await Event.findUpcoming()
    .populate('organizer', 'fullName email college avatar')
    .limit(20);

  sendSuccess(
    res,
    { events, count: events.length },
    'Upcoming events retrieved successfully'
  );
});

/**
 * @desc    Get trending events
 * @route   GET /api/v1/events/trending
 * @access  Public
 */
export const getTrendingEvents = asyncHandler(async (req, res) => {
  const trending = await Event.getTrending(10);

  sendSuccess(
    res,
    { events: trending },
    'Trending events retrieved successfully'
  );
});

/**
 * @desc    Get events by date range
 * @route   GET /api/v1/events/calendar
 * @access  Public
 */
export const getEventsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw ApiError.badRequest('Please provide startDate and endDate');
  }

  const events = await Event.findByDateRange(
    new Date(startDate),
    new Date(endDate)
  ).populate('organizer', 'fullName email college avatar');

  sendSuccess(
    res,
    { events, count: events.length },
    'Events retrieved successfully'
  );
});

/**
 * @desc    Upload event poster
 * @route   POST /api/v1/events/:id/upload-poster
 * @access  Private (Organizer or Admin)
 */
export const uploadPoster = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image file');
  }

  const event = await Event.findById(req.params.id);

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check ownership
  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this event');
  }

  // Upload to Cloudinary
  const result = await uploadEventPoster(req.file);

  // Update event
  event.poster = result.url;
  await event.save();

  sendSuccess(
    res,
    { poster: result.url, event },
    'Event poster uploaded successfully'
  );
});

/**
 * @desc    Send event reminders
 * @route   POST /api/v1/events/:id/send-reminders
 * @access  Private (Organizer or Admin)
 */
export const sendReminders = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    'attendees.user',
    'fullName email'
  );

  if (!event) {
    throw ApiError.notFound('Event not found');
  }

  // Check ownership
  if (
    event.organizer.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to send reminders');
  }

  // Send reminders to all registered attendees
  const reminderPromises = event.attendees
    .filter(att => att.status === 'registered')
    .map(att => sendEventReminderEmail(event, att.user));

  await Promise.all(reminderPromises);

  sendSuccess(
    res,
    null,
    `Reminders sent to ${reminderPromises.length} attendees`
  );
});

/**
 * @desc    Get event statistics
 * @route   GET /api/v1/events/stats
 * @access  Private (Admin)
 */
export const getEventStats = asyncHandler(async (req, res) => {
  const stats = await Event.getStats();

  const totalEvents = await Event.countDocuments();
  const upcomingEvents = await Event.countDocuments({
    status: 'upcoming',
    isPublished: true,
  });
  const completedEvents = await Event.countDocuments({ status: 'completed' });

  const totalAttendees = await Event.aggregate([
    {
      $project: {
        attendeeCount: { $size: '$attendees' },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$attendeeCount' },
      },
    },
  ]);

  sendSuccess(
    res,
    {
      overall: {
        total: totalEvents,
        upcoming: upcomingEvents,
        completed: completedEvents,
        totalAttendees: totalAttendees[0]?.total || 0,
      },
      byType: stats,
    },
    'Statistics retrieved successfully'
  );
});

export default {
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
};
