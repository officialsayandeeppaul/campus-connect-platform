import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  deleteAccount,
} from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../middleware/validators/authValidator.js';

const router = express.Router();

/**
 * Authentication Routes
 * Base Path: /api/v1/auth
 */

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);

/**
 * @route   PUT /api/v1/auth/reset-password/:resetToken
 * @desc    Reset password with token
 * @access  Public
 */
router.put('/reset-password/:resetToken', resetPasswordValidation, resetPassword);

/**
 * @route   GET /api/v1/auth/verify-email/:verificationToken
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:verificationToken', verifyEmail);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (clear cookie)
 * @access  Private
 */
router.post('/logout', protect, logout);

/**
 * @route   PUT /api/v1/auth/update-details
 * @desc    Update user profile details
 * @access  Private
 */
router.put('/update-details', protect, updateDetails);

/**
 * @route   PUT /api/v1/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
router.put('/update-password', protect, updatePassword);

/**
 * @route   POST /api/v1/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification', protect, resendVerification);

/**
 * @route   DELETE /api/v1/auth/delete-account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/delete-account', protect, deleteAccount);

export default router;
