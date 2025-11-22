/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * Eliminates the need for try-catch blocks in every controller
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;

/**
 * Usage Example:
 * 
 * import asyncHandler from '../utils/asyncHandler.js';
 * 
 * export const getUsers = asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * });
 * 
 * No need for try-catch! Errors are automatically passed to error middleware.
 */
