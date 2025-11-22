import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

/**
 * Multer Configuration for File Uploads
 * Handles image and document uploads with validation
 */

// Configure storage (memory storage for Cloudinary upload)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = process.env.ALLOWED_FILE_TYPES 
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      ),
      false
    );
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

/**
 * Upload single image
 * Usage: upload.single('avatar')
 */
export const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

/**
 * Upload multiple images
 * Usage: upload.array('images', 5)
 */
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Upload mixed fields
 * Usage: upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }])
 */
export const uploadFields = (fields) => {
  return upload.fields(fields);
};

/**
 * Validate uploaded file
 */
export const validateUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    throw ApiError.badRequest('Please upload a file');
  }
  next();
};

/**
 * Image-specific upload middleware
 */
export const uploadImage = uploadSingle('image');
export const uploadAvatar = uploadSingle('avatar');
export const uploadResume = uploadSingle('resume');
export const uploadMultipleImages = uploadMultiple('images', 10);

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Validate image dimensions (optional)
 */
export const validateImageDimensions = (minWidth = 100, minHeight = 100) => {
  return async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    // This would require sharp or jimp library
    // For now, we'll skip dimension validation
    // You can add it later if needed

    next();
  };
};

export default upload;
