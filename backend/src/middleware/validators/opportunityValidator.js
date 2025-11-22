import { body, param, query } from 'express-validator';
import { handleValidationErrors } from './authValidator.js';

/**
 * Validation middleware for opportunity routes
 */

/**
 * Create opportunity validation
 */
export const createOpportunityValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('company')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  
  body('type')
    .notEmpty().withMessage('Opportunity type is required')
    .isIn(['internship', 'job', 'freelance', 'project', 'volunteer']).withMessage('Invalid opportunity type'),
  
  body('category')
    .notEmpty().withMessage('Category is required'),
  
  body('mode')
    .notEmpty().withMessage('Work mode is required')
    .isIn(['remote', 'onsite', 'hybrid']).withMessage('Invalid work mode'),
  
  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('deadline')
    .notEmpty().withMessage('Application deadline is required')
    .isISO8601().withMessage('Invalid date format'),
  
  body('skillsRequired')
    .notEmpty().withMessage('Required skills are needed')
    .isArray({ min: 1 }).withMessage('At least one skill is required'),
  
  handleValidationErrors,
];

/**
 * Update opportunity validation
 */
export const updateOpportunityValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  
  body('type')
    .optional()
    .isIn(['internship', 'job', 'freelance', 'project', 'volunteer']).withMessage('Invalid opportunity type'),
  
  body('mode')
    .optional()
    .isIn(['remote', 'onsite', 'hybrid']).withMessage('Invalid work mode'),
  
  body('status')
    .optional()
    .isIn(['active', 'closed', 'draft', 'expired']).withMessage('Invalid status'),
  
  handleValidationErrors,
];

/**
 * Opportunity ID validation
 */
export const opportunityIdValidation = [
  param('id')
    .notEmpty().withMessage('Opportunity ID is required')
    .isMongoId().withMessage('Invalid opportunity ID format'),
  
  handleValidationErrors,
];

/**
 * Apply to opportunity validation
 */
export const applyValidation = [
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Cover letter cannot exceed 1000 characters'),
  
  handleValidationErrors,
];

export default {
  createOpportunityValidation,
  updateOpportunityValidation,
  opportunityIdValidation,
  applyValidation,
};
