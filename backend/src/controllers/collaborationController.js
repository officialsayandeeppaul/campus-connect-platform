import Collaboration from '../models/Collaboration.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import { sendCollaborationInterestEmail } from '../services/emailService.js';

/**
 * Collaboration Controller
 * Handles project collaboration operations
 */

/**
 * @desc    Get all collaborations with filters
 * @route   GET /api/v1/collaborations
 * @access  Public
 */
export const getCollaborations = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    projectType,
    category,
    skills,
    search,
    status,
    admin,
  } = req.query;

  const { skip, limit: limitNum } = getPagination(page, limit);

  // Build query
  const query = {};

  // For admin, show all collaborations (active and inactive)
  // For regular users, only show active collaborations with open status
  if (admin === 'true') {
    // Admin can see all - no default filters
    if (status) query.status = status;
  } else {
    // Regular users only see active and open collaborations
    query.isActive = true;
    query.status = status || 'open';
  }

  if (projectType) query.projectType = projectType;
  if (category) query.category = category;

  if (skills) {
    const skillsArray = skills.split(',');
    query.skillsNeeded = { $in: skillsArray };
  }

  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  const [collaborations, total] = await Promise.all([
    Collaboration.find(query)
      .populate('createdBy', 'fullName email college avatar')
      .populate('teamMembers.user', 'fullName email college skills avatar')
      .skip(skip)
      .limit(limitNum)
      .sort('-createdAt'),
    Collaboration.countDocuments(query)
  ]);

  sendPaginatedResponse(
    res,
    collaborations,
    page,
    limitNum,
    total,
    'Collaborations retrieved successfully'
  );
});

/**
 * @desc    Get collaboration by ID
 * @route   GET /api/v1/collaborations/:id
 * @access  Public
 */
export const getCollaborationById = asyncHandler(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id)
    .populate('createdBy', 'fullName email college avatar skills')
    .populate('teamMembers.user', 'fullName email college skills avatar')
    .populate('interestedUsers.user', 'fullName email college skills avatar');

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Increment view count
  await collaboration.incrementViews();

  sendSuccess(res, { collaboration }, 'Collaboration retrieved successfully');
});

/**
 * @desc    Create new collaboration
 * @route   POST /api/v1/collaborations
 * @access  Private
 */
export const createCollaboration = asyncHandler(async (req, res) => {
  const collaborationData = {
    ...req.body,
    createdBy: req.user.id,
  };

  const collaboration = await Collaboration.create(collaborationData);

  sendSuccess(res, { collaboration }, 'Collaboration created successfully', 201);
});

/**
 * @desc    Update collaboration
 * @route   PUT /api/v1/collaborations/:id
 * @access  Private (Owner or Admin)
 */
export const updateCollaboration = asyncHandler(async (req, res) => {
  let collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check ownership
  if (
    collaboration.createdBy.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this collaboration');
  }

  collaboration = await Collaboration.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  sendSuccess(res, { collaboration }, 'Collaboration updated successfully');
});

/**
 * @desc    Delete collaboration
 * @route   DELETE /api/v1/collaborations/:id
 * @access  Private (Owner or Admin)
 */
export const deleteCollaboration = asyncHandler(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check ownership
  if (
    collaboration.createdBy.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this collaboration');
  }

  await Collaboration.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Collaboration deleted successfully');
});

/**
 * @desc    Express interest in collaboration
 * @route   POST /api/v1/collaborations/:id/interest
 * @access  Private
 */
export const expressInterest = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const collaboration = await Collaboration.findById(req.params.id).populate(
    'createdBy',
    'fullName email'
  );

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check if already expressed interest
  if (collaboration.hasUserInterested(req.user.id)) {
    throw ApiError.badRequest('You have already expressed interest in this collaboration');
  }

  // Check if already a team member
  if (collaboration.isTeamMember(req.user.id)) {
    throw ApiError.badRequest('You are already a team member');
  }

  // Check if team is full
  if (collaboration.isTeamFull) {
    throw ApiError.badRequest('Team is already full');
  }

  // Get user details
  const user = await User.findById(req.user.id);

  // Express interest
  await collaboration.expressInterest(req.user.id, message);

  // Send notification email to collaboration creator
  sendCollaborationInterestEmail(collaboration, user).catch(err =>
    console.error('Interest email failed:', err.message)
  );

  sendSuccess(res, { collaboration }, 'Interest expressed successfully');
});

/**
 * @desc    Accept user interest (add to team)
 * @route   POST /api/v1/collaborations/:id/accept/:userId
 * @access  Private (Owner or Admin)
 */
export const acceptInterest = asyncHandler(async (req, res) => {
  const { role = 'Member' } = req.body;

  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check ownership
  const creatorId = collaboration.createdBy._id || collaboration.createdBy;
  if (
    creatorId.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to accept members');
  }

  await collaboration.acceptInterest(req.params.userId, role);

  // Update user stats
  const user = await User.findById(req.params.userId);
  if (user) {
    user.stats.collaborationsJoined += 1;
    await user.save();
  }

  sendSuccess(res, { collaboration }, 'User accepted to team successfully');
});

/**
 * @desc    Reject user interest
 * @route   POST /api/v1/collaborations/:id/reject/:userId
 * @access  Private (Owner or Admin)
 */
export const rejectInterest = asyncHandler(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check ownership
  const creatorId = collaboration.createdBy._id || collaboration.createdBy;
  if (
    creatorId.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to reject members');
  }

  await collaboration.rejectInterest(req.params.userId);

  sendSuccess(res, { collaboration }, 'Interest rejected successfully');
});

/**
 * @desc    Remove team member
 * @route   DELETE /api/v1/collaborations/:id/members/:userId
 * @access  Private (Owner or Admin)
 */
export const removeMember = asyncHandler(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check ownership
  if (
    collaboration.createdBy.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to remove members');
  }

  await collaboration.removeMember(req.params.userId);

  sendSuccess(res, { collaboration }, 'Member removed successfully');
});

/**
 * @desc    Leave collaboration
 * @route   POST /api/v1/collaborations/:id/leave
 * @access  Private
 */
export const leaveCollaboration = asyncHandler(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check if user is a member
  if (!collaboration.isTeamMember(req.user.id)) {
    throw ApiError.badRequest('You are not a member of this collaboration');
  }

  // Cannot leave if creator
  if (collaboration.createdBy.toString() === req.user.id) {
    throw ApiError.badRequest('Creator cannot leave. Delete the collaboration instead.');
  }

  await collaboration.removeMember(req.user.id);

  sendSuccess(res, { collaboration }, 'Left collaboration successfully');
});

/**
 * @desc    Save/bookmark collaboration
 * @route   POST /api/v1/collaborations/:id/save
 * @access  Private
 */
export const saveCollaboration = asyncHandler(async (req, res) => {
  const collaboration = await Collaboration.findById(req.params.id);

  if (!collaboration) {
    throw ApiError.notFound('Collaboration not found');
  }

  // Check if already saved
  if (collaboration.saves.includes(req.user.id)) {
    // Unsave
    collaboration.saves = collaboration.saves.filter(
      id => id.toString() !== req.user.id
    );
    await collaboration.save();
    return sendSuccess(res, { collaboration }, 'Collaboration unsaved');
  }

  // Save
  collaboration.saves.push(req.user.id);
  await collaboration.save();

  sendSuccess(res, { collaboration }, 'Collaboration saved successfully');
});

/**
 * @desc    Get saved collaborations
 * @route   GET /api/v1/collaborations/saved
 * @access  Private
 */
export const getSavedCollaborations = asyncHandler(async (req, res) => {
  const collaborations = await Collaboration.find({
    saves: req.user.id,
    status: 'open',
    isActive: true,
  })
    .populate('createdBy', 'fullName email college avatar')
    .sort('-createdAt');

  sendSuccess(
    res,
    { collaborations, count: collaborations.length },
    'Saved collaborations retrieved successfully'
  );
});

/**
 * @desc    Get my collaborations (created)
 * @route   GET /api/v1/collaborations/my-projects
 * @access  Private
 */
export const getMyCollaborations = asyncHandler(async (req, res) => {
  const collaborations = await Collaboration.find({ createdBy: req.user.id })
    .populate('teamMembers.user', 'fullName email college skills')
    .populate('interestedUsers.user', 'fullName email college skills')
    .sort('-createdAt');

  sendSuccess(
    res,
    { collaborations, count: collaborations.length },
    'Your collaborations retrieved successfully'
  );
});

/**
 * @desc    Get collaborations I'm part of
 * @route   GET /api/v1/collaborations/my-teams
 * @access  Private
 */
export const getMyTeams = asyncHandler(async (req, res) => {
  const collaborations = await Collaboration.find({
    'teamMembers.user': req.user.id,
    'teamMembers.status': 'active',
  })
    .populate('createdBy', 'fullName email college avatar')
    .populate('teamMembers.user', 'fullName email college skills avatar')
    .sort('-createdAt');

  sendSuccess(
    res,
    { collaborations, count: collaborations.length },
    'Your teams retrieved successfully'
  );
});

/**
 * @desc    Get trending collaborations
 * @route   GET /api/v1/collaborations/trending
 * @access  Public
 */
export const getTrendingCollaborations = asyncHandler(async (req, res) => {
  const trending = await Collaboration.getTrending(10);

  sendSuccess(
    res,
    { collaborations: trending },
    'Trending collaborations retrieved successfully'
  );
});

/**
 * @desc    Get recommended collaborations
 * @route   GET /api/v1/collaborations/recommendations
 * @access  Private
 */
export const getRecommendedCollaborations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Find collaborations matching user skills
  const collaborations = await Collaboration.findBySkills(user.skills)
    .populate('createdBy', 'fullName email college avatar')
    .limit(20)
    .sort('-createdAt');

  sendSuccess(
    res,
    { collaborations, count: collaborations.length },
    'Recommended collaborations retrieved successfully'
  );
});

/**
 * @desc    Get collaboration statistics
 * @route   GET /api/v1/collaborations/stats
 * @access  Private (Admin)
 */
export const getCollaborationStats = asyncHandler(async (req, res) => {
  const stats = await Collaboration.getStats();

  const totalCollaborations = await Collaboration.countDocuments();
  const openCollaborations = await Collaboration.countDocuments({ status: 'open' });
  const completedCollaborations = await Collaboration.countDocuments({ status: 'completed' });

  sendSuccess(
    res,
    {
      overall: {
        total: totalCollaborations,
        open: openCollaborations,
        completed: completedCollaborations,
      },
      byType: stats,
    },
    'Statistics retrieved successfully'
  );
});

export default {
  getCollaborations,
  getCollaborationById,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
  expressInterest,
  acceptInterest,
  rejectInterest,
  removeMember,
  leaveCollaboration,
  saveCollaboration,
  getSavedCollaborations,
  getMyCollaborations,
  getMyTeams,
  getTrendingCollaborations,
  getRecommendedCollaborations,
  getCollaborationStats,
};
