import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  getUserPublicProfile,
  updateUser,
  deleteUser,
  uploadUserAvatar,
  uploadUserResume,
  scanExistingResume,
  searchBySkills,
  getUsersByCollege,
  getUserStats,
  getRecommendedUsers,
} from '../controllers/userController.js';
import { updateUserValidation, userIdValidation } from '../middleware/validators/userValidator.js';
import { uploadSingle } from '../middleware/upload.js';

const router = express.Router();

/**
 * User Routes
 * Base Path: /api/v1/users
 */

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with filters
 * @access  Public
 */
router.get('/', getUsers);

/**
 * @route   GET /api/v1/users/search/skills
 * @desc    Search users by skills
 * @access  Public
 */
router.get('/search/skills', searchBySkills);

/**
 * @route   GET /api/v1/users/college/:college
 * @desc    Get users by college
 * @access  Public
 */
router.get('/college/:college', getUsersByCollege);

/**
 * @route   GET /api/v1/users/:userId/profile
 * @desc    Get user public profile
 * @access  Public
 */
router.get('/:userId/profile', getUserPublicProfile);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', userIdValidation, getUserById);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

/**
 * @route   GET /api/v1/users/recommendations
 * @desc    Get recommended users
 * @access  Private
 */
router.get('/me/recommendations', protect, getRecommendedUsers);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private (Own profile or Admin)
 */
router.put('/:id', protect, userIdValidation, updateUserValidation, updateUser);

/**
 * @route   POST /api/v1/users/upload-avatar
 * @desc    Upload user avatar
 * @access  Private
 */
router.post('/upload-avatar', protect, uploadSingle('avatar'), uploadUserAvatar);

/**
 * @route   POST /api/v1/users/upload-resume
 * @desc    Upload user resume
 * @access  Private
 */
router.post('/upload-resume', protect, uploadSingle('resume'), uploadUserResume);

/**
 * @route   POST /api/v1/users/scan-resume
 * @desc    Scan existing resume with AI
 * @access  Private
 */
router.post('/scan-resume', protect, scanExistingResume);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * @route   GET /api/v1/users/admin/stats
 * @desc    Get user statistics
 * @access  Private (Admin only)
 */
router.get('/admin/stats', protect, authorize('admin'), getUserStats);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), userIdValidation, deleteUser);

export default router;
