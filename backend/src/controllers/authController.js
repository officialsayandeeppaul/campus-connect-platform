import crypto from 'crypto';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

/**
 * Authentication Controller
 * Handles all authentication-related operations
 */

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, college, year, branch, phone, skills, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  // Create user with role (defaults to 'student' if not provided)
  const user = await User.create({
    fullName,
    email,
    password,
    college,
    year,
    branch,
    phone,
    skills: skills || [],
    role: role || 'student', // Accept role from request or default to student
  });

  // Generate JWT token
  const token = user.generateAuthToken();

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(err => 
    console.error('Welcome email failed:', err.message)
  );

  // Send verification email (non-blocking)
  sendVerificationEmail(user, verificationToken).catch(err =>
    console.error('Verification email failed:', err.message)
  );

  // Remove password from response
  const userResponse = user.getPublicProfile();

  sendSuccess(
    res,
    {
      user: userResponse,
      token,
    },
    'User registered successfully. Please check your email to verify your account.',
    201
  );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if password matches
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Please contact support.');
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save();

  // Generate JWT token
  const token = user.generateAuthToken();

  // Set token in cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  res.cookie('token', token, cookieOptions);

  // Remove password from response
  const userResponse = user.getPublicProfile();

  sendSuccess(
    res,
    {
      user: userResponse,
      token,
    },
    'Login successful'
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  sendSuccess(res, null, 'Logout successful');
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
  // User is already attached to req by protect middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, { user }, 'User retrieved successfully');
});

/**
 * @desc    Update user details
 * @route   PUT /api/v1/auth/update-details
 * @access  Private
 */
export const updateDetails = asyncHandler(async (req, res) => {
  // Get the user first
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Update fields if provided
  if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.college !== undefined) user.college = req.body.college;
  if (req.body.year !== undefined) user.year = req.body.year;
  if (req.body.branch !== undefined) user.branch = req.body.branch;
  if (req.body.bio !== undefined) user.bio = req.body.bio;
  if (req.body.skills !== undefined) user.skills = req.body.skills;
  if (req.body.interests !== undefined) user.interests = req.body.interests;
  if (req.body.location !== undefined) user.location = req.body.location;
  if (req.body.socialLinks !== undefined) {
    // Merge socialLinks instead of replacing
    user.socialLinks = {
      ...user.socialLinks,
      ...req.body.socialLinks
    };
  }

  // Save user - this will trigger the pre-save hook to calculate profile completion
  await user.save();

  sendSuccess(res, { user }, 'Profile updated successfully');
});

/**
 * @desc    Update password
 * @route   PUT /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Please provide current and new password');
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = user.generateAuthToken();

  sendSuccess(
    res,
    { token },
    'Password updated successfully'
  );
});

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log('\n🔐 ========================================');
  console.log('🔐 FORGOT PASSWORD REQUEST');
  console.log('🔐 ========================================');
  console.log('📧 Email:', email);

  const user = await User.findOne({ email });
  if (!user) {
    console.log('❌ User not found with email:', email);
    console.log('🔐 ========================================\n');
    throw ApiError.notFound('No user found with this email');
  }

  console.log('✅ User found:', user.fullName);

  // Generate reset token (unhashed for URL)
  const resetToken = user.generateResetPasswordToken();
  
  console.log('🔑 Reset token generated (unhashed):', resetToken.substring(0, 10) + '...');
  console.log('🔒 Hashed token saved to DB:', user.resetPasswordToken.substring(0, 10) + '...');
  console.log('⏰ Token expires at:', new Date(user.resetPasswordExpire).toLocaleString());
  
  // Save to database
  await user.save({ validateBeforeSave: false });
  console.log('💾 Token saved to database');

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  console.log('🔗 Reset URL:', resetUrl);

  // Send password reset email
  try {
    await sendPasswordResetEmail(user, resetToken);
    console.log('✅ Password reset email sent successfully');
    console.log('🔐 ========================================\n');
    
    sendSuccess(
      res,
      {
        email: user.email,
        // Only send reset URL in development for testing
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      },
      'Password reset email sent. Please check your email.'
    );
  } catch (error) {
    console.log('❌ Email sending failed:', error.message);
    
    // If email fails, remove reset token from database
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    console.log('🗑️  Reset token removed from database');
    console.log('🔐 ========================================\n');

    throw ApiError.internal('Email could not be sent. Please try again later.');
  }
});

/**
 * @desc    Reset password
 * @route   PUT /api/v1/auth/reset-password/:resetToken
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  console.log('\n🔐 ========================================');
  console.log('🔐 PASSWORD RESET ATTEMPT');
  console.log('🔐 ========================================');
  console.log('🔑 Token received (unhashed):', req.params.resetToken.substring(0, 10) + '...');

  // Hash the token to match database
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  console.log('🔒 Hashed token for DB lookup:', resetPasswordToken.substring(0, 10) + '...');
  console.log('🔍 Searching for user with valid token...');

  // Find user by token and check if token is still valid
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    console.log('❌ No user found with valid token');
    console.log('💡 Token may be invalid or expired');
    console.log('🔐 ========================================\n');
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  console.log('✅ User found:', user.fullName, '(' + user.email + ')');
  console.log('⏰ Token was valid until:', new Date(user.resetPasswordExpire).toLocaleString());

  // Set new password (will be hashed by pre-save hook)
  user.password = password;
  
  // Clear reset token from database
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  console.log('🔒 Setting new password...');
  console.log('🗑️  Clearing reset token from database...');
  
  await user.save();
  
  console.log('💾 Password updated in database');
  console.log('✅ Reset token deleted from database');

  // Generate auth token for auto-login
  const token = user.generateAuthToken();
  console.log('🎫 Auth token generated for auto-login');
  console.log('🔐 ========================================\n');

  sendSuccess(
    res,
    { 
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      }
    },
    'Password reset successful'
  );
});

/**
 * @desc    Verify email
 * @route   GET /api/v1/auth/verify-email/:verificationToken
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  // Get hashed token
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationToken)
    .digest('hex');

  // Find user by token and check if token is still valid
  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }

  // Verify email
  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  sendSuccess(
    res,
    { user: user.getPublicProfile() },
    'Email verified successfully'
  );
});

/**
 * @desc    Resend verification email
 * @route   POST /api/v1/auth/resend-verification
 * @access  Private
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.isVerified) {
    throw ApiError.badRequest('Email is already verified');
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    await sendVerificationEmail(user, verificationToken);
    
    sendSuccess(
      res,
      null,
      'Verification email sent. Please check your email.'
    );
  } catch (error) {
    throw ApiError.internal('Email could not be sent. Please try again later.');
  }
});

/**
 * @desc    Delete account
 * @route   DELETE /api/v1/auth/delete-account
 * @access  Private
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw ApiError.badRequest('Please provide your password to confirm deletion');
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Incorrect password');
  }

  // Soft delete - deactivate account
  user.isActive = false;
  await user.save();

  // Or hard delete (uncomment if you want permanent deletion)
  // await User.findByIdAndDelete(req.user.id);

  sendSuccess(
    res,
    null,
    'Account deleted successfully'
  );
});

export default {
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
};
