import express from 'express';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  applyToOpportunity,
  getApplicants,
  updateApplicantStatus,
  saveOpportunity,
  getSavedOpportunities,
  getMyOpportunities,
  getTrendingOpportunities,
  getRecommendedOpportunities,
  analyzeMatch,
  uploadLogo,
  getOpportunityStats,
} from '../controllers/opportunityController.js';
import {
  createOpportunityValidation,
  updateOpportunityValidation,
  opportunityIdValidation,
  applyValidation,
} from '../middleware/validators/opportunityValidator.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

/**
 * Opportunity Routes
 * Base Path: /api/v1/opportunities
 */

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/opportunities
 * @desc    Get all opportunities with filters
 * @access  Public (with optional auth for personalized data)
 */
router.get('/', optionalAuth, getOpportunities);

/**
 * @route   GET /api/v1/opportunities/trending
 * @desc    Get trending opportunities
 * @access  Public
 */
router.get('/trending', getTrendingOpportunities);

/**
 * @route   GET /api/v1/opportunities/:id
 * @desc    Get opportunity by ID
 * @access  Public (with optional auth for personalized data)
 */
router.get('/:id', optionalAuth, opportunityIdValidation, getOpportunityById);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

/**
 * @route   POST /api/v1/opportunities
 * @desc    Create new opportunity
 * @access  Private
 */
router.post('/', protect, createOpportunityValidation, createOpportunity);

/**
 * @route   GET /api/v1/opportunities/my/posts
 * @desc    Get my posted opportunities
 * @access  Private
 */
router.get('/my/posts', protect, getMyOpportunities);

/**
 * @route   GET /api/v1/opportunities/my/saved
 * @desc    Get saved opportunities
 * @access  Private
 */
router.get('/my/saved', protect, getSavedOpportunities);

/**
 * @route   GET /api/v1/opportunities/my/recommendations
 * @desc    Get recommended opportunities
 * @access  Private
 */
router.get('/my/recommendations', protect, getRecommendedOpportunities);

/**
 * @route   PUT /api/v1/opportunities/:id
 * @desc    Update opportunity
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  protect,
  opportunityIdValidation,
  updateOpportunityValidation,
  updateOpportunity
);

/**
 * @route   DELETE /api/v1/opportunities/:id
 * @desc    Delete opportunity
 * @access  Private (Owner or Admin)
 */
router.delete('/:id', protect, opportunityIdValidation, deleteOpportunity);

/**
 * @route   POST /api/v1/opportunities/:id/apply
 * @desc    Apply to opportunity
 * @access  Private
 */
router.post(
  '/:id/apply',
  protect,
  opportunityIdValidation,
  applyValidation,
  applyToOpportunity
);

/**
 * @route   POST /api/v1/opportunities/:id/save
 * @desc    Save/bookmark opportunity
 * @access  Private
 */
router.post('/:id/save', protect, opportunityIdValidation, saveOpportunity);

/**
 * @route   GET /api/v1/opportunities/:id/match
 * @desc    Analyze match with user profile
 * @access  Private
 */
router.get('/:id/match', protect, opportunityIdValidation, analyzeMatch);

/**
 * @route   GET /api/v1/opportunities/:id/applicants
 * @desc    Get applicants for opportunity
 * @access  Private (Owner or Admin)
 */
router.get('/:id/applicants', protect, opportunityIdValidation, getApplicants);

/**
 * @route   PUT /api/v1/opportunities/:id/applicants/:userId
 * @desc    Update applicant status
 * @access  Private (Owner or Admin)
 */
router.put('/:id/applicants/:userId', protect, updateApplicantStatus);

/**
 * @route   POST /api/v1/opportunities/:id/upload-logo
 * @desc    Upload company logo
 * @access  Private (Owner or Admin)
 */
router.post(
  '/:id/upload-logo',
  protect,
  uploadSingle('logo'),
  uploadLogo
);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * @route   GET /api/v1/opportunities/admin/stats
 * @desc    Get opportunity statistics
 * @access  Private (Admin only)
 */
router.get('/admin/stats', protect, authorize('admin'), getOpportunityStats);

export default router;
