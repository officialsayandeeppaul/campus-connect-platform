import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Protect routes - Verify JWT token
 * Usage: Add as middleware to protected routes
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from Bearer header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    // Get token from cookies
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    throw ApiError.unauthorized('Not authorized to access this route. Please login.');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw ApiError.unauthorized('User not found. Token may be invalid.');
    }

    // Check if user is verified (optional)
    if (!req.user.isVerified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      throw ApiError.forbidden('Please verify your email to access this resource.');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token. Please login again.');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired. Please login again.');
    }
    throw error;
  }
});

/**
 * Authorize specific roles
 * Usage: authorize('admin', 'moderator')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authorized to access this route.');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `User role '${req.user.role}' is not authorized to access this route.`
      );
    }

    next();
  };
};

/**
 * Check if user owns the resource
 * Compares req.user.id with resource owner
 */
export const checkOwnership = (resourceOwnerField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    // Get resource from request (assumes it's already fetched and attached to req)
    const resource = req.resource;

    if (!resource) {
      throw ApiError.notFound('Resource not found');
    }

    // Check if user is owner or admin
    const isOwner = resource[resourceOwnerField].toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden('Not authorized to perform this action on this resource.');
    }

    next();
  });
};

/**
 * Optional authentication
 * Attaches user to request if token is valid, but doesn't require it
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token invalid, but that's okay for optional auth
      req.user = null;
    }
  }

  next();
});

/**
 * Rate limiting per user
 * Tracks API calls per authenticated user
 */
export const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const userRequests = requests.get(userId) || [];

    // Filter out old requests outside the time window
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      throw ApiError.tooManyRequests(
        `Too many requests. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`
      );
    }

    // Add current request
    recentRequests.push(now);
    requests.set(userId, recentRequests);

    next();
  };
};
