import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
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
} from '../controllers/collaborationController.js';

const router = express.Router();

/**
 * Collaboration Routes
 * Base Path: /api/v1/collaborations
 */

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/collaborations
 * @desc    Get all collaborations with filters
 * @access  Public
 */
router.get('/', getCollaborations);

/**
 * @route   GET /api/v1/collaborations/trending
 * @desc    Get trending collaborations
 * @access  Public
 */
router.get('/trending', getTrendingCollaborations);

/**
 * @route   GET /api/v1/collaborations/:id
 * @desc    Get collaboration by ID
 * @access  Public
 */
router.get('/:id', getCollaborationById);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

/**
 * @route   POST /api/v1/collaborations
 * @desc    Create new collaboration
 * @access  Private
 */
router.post('/', protect, createCollaboration);

/**
 * @route   GET /api/v1/collaborations/my/projects
 * @desc    Get my created collaborations
 * @access  Private
 */
router.get('/my/projects', protect, getMyCollaborations);

/**
 * @route   GET /api/v1/collaborations/my/teams
 * @desc    Get collaborations I'm part of
 * @access  Private
 */
router.get('/my/teams', protect, getMyTeams);

/**
 * @route   GET /api/v1/collaborations/my/saved
 * @desc    Get saved collaborations
 * @access  Private
 */
router.get('/my/saved', protect, getSavedCollaborations);

/**
 * @route   GET /api/v1/collaborations/my/recommendations
 * @desc    Get recommended collaborations
 * @access  Private
 */
router.get('/my/recommendations', protect, getRecommendedCollaborations);

/**
 * @route   PUT /api/v1/collaborations/:id
 * @desc    Update collaboration
 * @access  Private (Owner or Admin)
 */
router.put('/:id', protect, updateCollaboration);

/**
 * @route   DELETE /api/v1/collaborations/:id
 * @desc    Delete collaboration
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', protect, deleteCollaboration);

/**
 * @route   POST /api/v1/collaborations/:id/interest
 * @desc    Express interest in collaboration
 * @access  Private
 */
router.post('/:id/interest', protect, expressInterest);

/**
 * @route   POST /api/v1/collaborations/:id/accept/:userId
 * @desc    Accept user interest (add to team)
 * @access  Private (Owner or Admin)
 */
router.post('/:id/accept/:userId', protect, acceptInterest);

/**
 * @route   POST /api/v1/collaborations/:id/reject/:userId
 * @desc    Reject user interest
 * @access  Private (Owner or Admin)
 */
router.post('/:id/reject/:userId', protect, rejectInterest);

/**
 * @route   DELETE /api/v1/collaborations/:id/members/:userId
 * @desc    Remove team member
 * @access  Private (Owner or Admin)
 */
router.delete('/:id/members/:userId', protect, removeMember);

/**
 * @route   POST /api/v1/collaborations/:id/leave
 * @desc    Leave collaboration
 * @access  Private
 */
router.post('/:id/leave', protect, leaveCollaboration);

/**
 * @route   POST /api/v1/collaborations/:id/save
 * @desc    Save/bookmark collaboration
 * @access  Private
 */
router.post('/:id/save', protect, saveCollaboration);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * @route   GET /api/v1/collaborations/admin/stats
 * @desc    Get collaboration statistics
 * @access  Private (Admin only)
 */
router.get('/admin/stats', protect, authorize('admin'), getCollaborationStats);

export default router;
