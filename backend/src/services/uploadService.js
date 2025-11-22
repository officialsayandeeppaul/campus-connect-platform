import { uploadToCloudinary, deleteFromCloudinary, uploadMultipleToCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

/**
 * Upload Service - Handle file uploads to Cloudinary
 */

/**
 * Upload single file
 */
export const uploadFile = async (file, folder = 'campus-connect') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // For memory storage (buffer)
    if (file.buffer) {
      // Save buffer to temp file
      const tempPath = path.join(process.cwd(), 'uploads', `temp-${Date.now()}-${file.originalname}`);
      
      // Create uploads directory if not exists
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      fs.writeFileSync(tempPath, file.buffer);
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(tempPath, folder);
      
      // Delete temp file
      fs.unlinkSync(tempPath);
      
      return result;
    }

    // For disk storage
    if (file.path) {
      const result = await uploadToCloudinary(file.path, folder);
      
      // Delete local file after upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      
      return result;
    }

    throw new Error('Invalid file format');
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (files, folder = 'campus-connect') => {
  try {
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map(file => uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);
    
    return results;
  } catch (error) {
    console.error('Multiple upload error:', error);
    throw new Error(`Multiple file upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFile = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('No public ID provided');
    }

    const result = await deleteFromCloudinary(publicId);
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
};

/**
 * Upload avatar/profile picture
 */
export const uploadAvatar = async (file) => {
  return uploadFile(file, 'campus-connect/avatars');
};

/**
 * Upload resume
 */
export const uploadResume = async (file) => {
  return uploadFile(file, 'campus-connect/resumes');
};

/**
 * Upload event poster
 */
export const uploadEventPoster = async (file) => {
  return uploadFile(file, 'campus-connect/events');
};

/**
 * Upload company logo
 */
export const uploadCompanyLogo = async (file) => {
  return uploadFile(file, 'campus-connect/companies');
};

export default {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  uploadAvatar,
  uploadResume,
  uploadEventPoster,
  uploadCompanyLogo,
};
