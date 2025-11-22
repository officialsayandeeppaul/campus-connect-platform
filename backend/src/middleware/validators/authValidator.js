import { body, validationResult } from 'express-validator';
import ApiError from '../../utils/ApiError.js';

/**
 * Validation middleware for authentication routes
 */

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    throw ApiError.badRequest(errorMessages);
  }
  next();
};

/**
 * Register validation rules
 */
export const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('college')
    .trim()
    .notEmpty().withMessage('College name is required'),
  
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  
  body('branch')
    .trim()
    .notEmpty().withMessage('Branch/Department is required'),
  
  handleValidationErrors,
];

/**
 * Login validation rules
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors,
];

/**
 * Forgot password validation
 */
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  handleValidationErrors,
];

/**
 * Reset password validation
 * Note: Frontend validates password match before sending
 */
export const resetPasswordValidation = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors,
];

export default {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  handleValidationErrors,
};
