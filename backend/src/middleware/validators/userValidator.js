import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

/**
 * Validation middleware for user routes
 */

/**
 * Update user profile validation
 */
export const updateUserValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number'),
  
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array'),
  
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.+/).withMessage('Please provide a valid LinkedIn URL'),
  
  body('socialLinks.github')
    .optional()
    .trim()
    .matches(/^https?:\/\/(www\.)?github\.com\/.+/).withMessage('Please provide a valid GitHub URL'),
  
  handleValidationErrors,
];

/**
 * User ID parameter validation
 */
export const userIdValidation = [
  param('id')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid user ID format'),
  
  handleValidationErrors,
];

/**
 * Search users validation
 */
export const searchUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors,
];

export default {
  updateUserValidation,
  userIdValidation,
  searchUsersValidation,
};
