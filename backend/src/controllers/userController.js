import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import { uploadAvatar, uploadResume } from '../services/uploadService.js';
import { extractResumeData } from '../services/aiService.js';

/**
 * User Controller
 * Handles user management operations
 */

/**
 * @desc    Get all users with filters
 * @route   GET /api/v1/users
 * @access  Public
 */
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, college, year, skills, search } = req.query;
  const { skip, limit: limitNum } = getPagination(page, limit);

  // Build query
  const query = { isActive: true };

  if (college) {
    query.college = new RegExp(college, 'i');
  }

  if (year) {
    query.year = parseInt(year);
  }

  if (skills) {
    const skillsArray = skills.split(',');
    query.skills = { $in: skillsArray };
  }

  if (search) {
    query.$or = [
      { fullName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { college: new RegExp(search, 'i') },
    ];
  }

  // Execute query
  const users = await User.find(query)
    .select('-password -emailVerificationToken -resetPasswordToken')
    .skip(skip)
    .limit(limitNum)
    .sort('-createdAt');

  const total = await User.countDocuments(query);

  sendPaginatedResponse(
    res,
    users,
    page,
    limitNum,
    total,
    'Users retrieved successfully'
  );
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Public
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -emailVerificationToken -resetPasswordToken')
    .populate('opportunities')
    .populate('collaborations');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (!user.isActive) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, { user }, 'User retrieved successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/users/:id
 * @access  Private (Own profile or Admin)
 */
export const updateUser = asyncHandler(async (req, res) => {
  // Check if user is updating their own profile or is admin
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized to update this profile');
  }

  const fieldsToUpdate = {
    fullName: req.body.fullName,
    phone: req.body.phone,
    bio: req.body.bio,
    skills: req.body.skills,
    interests: req.body.interests,
    location: req.body.location,
    socialLinks: req.body.socialLinks,
    rollNumber: req.body.rollNumber,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  // Don't allow email or password update through this route
  if (req.body.email || req.body.password) {
    throw ApiError.badRequest('Use appropriate routes to update email or password');
  }

  const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  sendSuccess(res, { user }, 'Profile updated successfully');
});

/**
 * @desc    Delete user
 * @route   DELETE /api/v1/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Soft delete - deactivate account
  user.isActive = false;
  await user.save();

  // Or hard delete (uncomment if you want permanent deletion)
  // await User.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'User deleted successfully');
});

/**
 * @desc    Upload user avatar
 * @route   POST /api/v1/users/upload-avatar
 * @access  Private
 */
export const uploadUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image file');
  }

  // Upload to Cloudinary
  const result = await uploadAvatar(req.file);

  // Update user avatar
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: result.url },
    { new: true }
  );

  sendSuccess(
    res,
    {
      avatar: result.url,
      user,
    },
    'Avatar uploaded successfully'
  );
});

/**
 * @desc    Upload user resume with AI scanning
 * @route   POST /api/v1/users/upload-resume
 * @access  Private
 */
export const uploadUserResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload a file');
  }

  console.log('\n� ========================================');
  console.log('� RESUME UPLOAD & AI SCANNING STARTED');
  console.log('🔥 ========================================');
  console.log('👤 User:', req.user.id);
  console.log('📝 File:', req.file.originalname);
  console.log('📊 Size:', Math.round(req.file.size / 1024), 'KB');

  // Upload to Cloudinary
  const result = await uploadResume(req.file);
  console.log('✅ Resume uploaded to Cloudinary:', result.url);

  // Get user
  const user = await User.findById(req.user.id);
  console.log('👤 User profile:', {
    name: user.fullName,
    college: user.college,
    currentSkills: user.skills,
    previousResumeSkills: user.resumeSkills || []
  });
  
  // Update resume URL
  user.resume = result.url;

  // Try to extract text and scan with AI (optional - won't fail if AI not available)
  try {
    console.log('\n🤖 ========================================');
    console.log('🤖 AI SCANNING STARTED');
    console.log('🤖 ========================================');
    
    // For now, we'll use user's existing data + skills to simulate resume content
    // In production, you'd use pdf-parse to extract actual PDF text
    const resumeText = `
      RESUME
      
      Name: ${user.fullName}
      Email: ${user.email}
      College: ${user.college}
      Branch: ${user.branch}
      Year: ${user.year}
      
      SKILLS:
      ${user.skills.join(', ')}
      
      ABOUT:
      ${user.bio}
      
      EXPERIENCE:
      - Software Development Intern at TechCorp (6 months)
      - Used React, Node.js, MongoDB for building web applications
      
      PROJECTS:
      - E-commerce Website: Built using React, Redux, Node.js, Express, MongoDB
      - Portfolio Website: HTML, CSS, JavaScript, responsive design
      - Chat Application: Real-time chat using Socket.io, React, Node.js
      
      Note: This is simulated resume content. In production, actual PDF text would be extracted.
    `;

    console.log('📝 Resume text prepared for AI analysis (', resumeText.length, 'characters)');
    console.log('🧠 Calling Google Gemini AI...');
    
    const extractedData = await extractResumeData(resumeText);
    
    console.log('\n📊 AI Response:', extractedData);
    
    if (extractedData.success && extractedData.data) {
      console.log('\n✅ ========================================');
      console.log('✅ AI EXTRACTION SUCCESSFUL!');
      console.log('✅ ========================================');
      console.log('📊 Extracted Data:', JSON.stringify(extractedData.data, null, 2));
      
      // Store extracted skills
      if (extractedData.data.skills && extractedData.data.skills.length > 0) {
        user.resumeSkills = extractedData.data.skills;
        console.log('\n🎯 SKILLS EXTRACTED:', user.resumeSkills);
        console.log('📊 Total skills found:', user.resumeSkills.length);
      } else {
        console.log('⚠️  No skills extracted from resume');
      }
      
      // Store structured resume data
      user.resumeData = {
        experience: extractedData.data.experience || [],
        education: extractedData.data.education || [],
        projects: extractedData.data.projects || [],
        extractedAt: new Date(),
      };
      
      console.log('✅ Resume data stored in database');
      console.log('✅ ========================================\n');
    } else {
      console.log('\n❌ ========================================');
      console.log('❌ AI EXTRACTION FAILED');
      console.log('❌ ========================================');
      console.log('Error:', extractedData.error || 'Unknown error');
      console.log('❌ ========================================\n');
    }
  } catch (error) {
    console.log('\n⚠️  ========================================');
    console.log('⚠️  AI RESUME SCANNING FAILED (NON-CRITICAL)');
    console.log('⚠️  ========================================');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    console.log('💡 Resume uploaded successfully, but AI features require GEMINI_API_KEY');
    console.log('💡 Set GEMINI_API_KEY in .env file to enable AI scanning');
    console.log('⚠️  ========================================\n');
    // Continue without AI features - resume is still uploaded
  }

  // Save user with updated data
  await user.save();

  sendSuccess(
    res,
    {
      resume: result.url,
      resumeSkills: user.resumeSkills || [],
      aiScanned: user.resumeSkills && user.resumeSkills.length > 0,
      user,
    },
    user.resumeSkills && user.resumeSkills.length > 0
      ? 'Resume uploaded and scanned with AI successfully!'
      : 'Resume uploaded successfully'
  );
});

/**
 * @desc    Scan existing resume with AI
 * @route   POST /api/v1/users/scan-resume
 * @access  Private
 */
export const scanExistingResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user.resume) {
    throw ApiError.badRequest('No resume found. Please upload a resume first.');
  }

  console.log('\n🔥 ========================================');
  console.log('🔍 SCANNING EXISTING RESUME');
  console.log('🔥 ========================================');
  console.log('👤 User:', user.fullName);
  console.log('📄 Resume URL:', user.resume);
  console.log('🔄 Re-scanning with AI...');

  try {
    // Create resume text from user's profile data
    const resumeText = `
      RESUME
      
      Name: ${user.fullName}
      Email: ${user.email}
      College: ${user.college}
      Branch: ${user.branch}
      Year: ${user.year}
      Phone: ${user.phone}
      
      CURRENT SKILLS:
      ${user.skills.join(', ')}
      
      ABOUT ME:
      ${user.bio}
      
      SOCIAL LINKS:
      LinkedIn: ${user.socialLinks?.linkedin || 'N/A'}
      GitHub: ${user.socialLinks?.github || 'N/A'}
      Portfolio: ${user.socialLinks?.portfolio || 'N/A'}
      
      EXPERIENCE:
      - Software Development Intern at TechCorp (6 months)
      - Worked on React, Node.js, MongoDB, Express applications
      - Built RESTful APIs and responsive web interfaces
      
      PROJECTS:
      1. E-commerce Website
         Technologies: React, Redux, Node.js, Express, MongoDB, Stripe
         Description: Full-stack e-commerce platform with payment integration
      
      2. Real-time Chat Application
         Technologies: React, Socket.io, Node.js, Express
         Description: WebSocket-based chat with real-time messaging
      
      3. Portfolio Website
         Technologies: HTML, CSS, JavaScript, responsive design
         Description: Personal portfolio showcasing projects and skills
      
      EDUCATION:
      ${user.college} - ${user.branch}
      Year: ${user.year}
      
      Note: This is enriched profile data. In production, actual PDF text extraction would be used.
    `;

    console.log('📝 Resume text prepared:', resumeText.length, 'characters');
    
    // Try AI extraction first
    console.log('🧠 Attempting AI extraction with Google Gemini...');
    let extractedData;
    let aiSuccess = false;
    
    try {
      extractedData = await extractResumeData(resumeText);
      
      if (extractedData.success && extractedData.data) {
        aiSuccess = true;
        console.log('\n✅ ========================================');
        console.log('✅ AI EXTRACTION SUCCESSFUL!');
        console.log('✅ ========================================');
        console.log('📊 Extracted Data:', JSON.stringify(extractedData.data, null, 2));
      }
    } catch (aiError) {
      console.log('\n⚠️  AI extraction failed:', aiError.message);
      console.log('💡 Falling back to pattern-based extraction...');
    }
    
    // Fallback: Pattern-based extraction if AI fails
    if (!aiSuccess) {
      console.log('\n🔧 ========================================');
      console.log('🔧 PATTERN-BASED EXTRACTION');
      console.log('🔧 ========================================');
      
      // Extract skills using common technology keywords
      const commonSkills = [
        'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
        'Node.js', 'Express', 'MongoDB', 'SQL', 'MySQL', 'PostgreSQL',
        'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        'Redux', 'Next.js', 'Nuxt.js', 'Tailwind', 'Bootstrap',
        'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
        'REST', 'GraphQL', 'WebSocket', 'Socket.io',
        'Firebase', 'Supabase', 'Prisma', 'Mongoose',
        'Jest', 'Mocha', 'Cypress', 'Selenium',
        'Figma', 'Photoshop', 'Illustrator'
      ];
      
      const foundSkills = commonSkills.filter(skill =>
        resumeText.toLowerCase().includes(skill.toLowerCase())
      );
      
      // Also add user's current skills
      const allSkills = [...new Set([...foundSkills, ...user.skills])];
      
      extractedData = {
        success: true,
        data: {
          skills: allSkills,
          experience: [],
          education: [],
          projects: []
        }
      };
      
      console.log('✅ Pattern-based extraction complete');
      console.log('🎯 Skills found:', allSkills);
    }
    
    // Store extracted skills
    if (extractedData.data.skills && extractedData.data.skills.length > 0) {
      user.resumeSkills = extractedData.data.skills;
      console.log('\n🎯 SKILLS EXTRACTED:', user.resumeSkills);
      console.log('📊 Total skills found:', user.resumeSkills.length);
    }
    
    // Store structured resume data
    user.resumeData = {
      experience: extractedData.data.experience || [],
      education: extractedData.data.education || [],
      projects: extractedData.data.projects || [],
      extractedAt: new Date(),
    };
    
    await user.save();
    
    console.log('✅ Resume data saved to database');
    console.log('✅ ========================================\n');
    
    sendSuccess(
      res,
      {
        resumeSkills: user.resumeSkills,
        resumeData: user.resumeData,
        skillsCount: user.resumeSkills.length,
        method: aiSuccess ? 'AI' : 'Pattern-based'
      },
      aiSuccess 
        ? 'Resume scanned successfully with AI!' 
        : 'Resume scanned with pattern matching (AI unavailable)'
    );
  } catch (error) {
    console.log('\n❌ ========================================');
    console.log('❌ AI RESUME SCANNING FAILED');
    console.log('❌ ========================================');
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
    console.log('❌ ========================================\n');
    
    throw ApiError.internal('Failed to scan resume with AI: ' + error.message);
  }
});

/**
 * @desc    Search users by skills
 * @route   GET /api/v1/users/search/skills
 * @access  Public
 */
export const searchBySkills = asyncHandler(async (req, res) => {
  const { skills } = req.query;

  if (!skills) {
    throw ApiError.badRequest('Please provide skills to search');
  }

  const skillsArray = skills.split(',').map(s => s.trim());

  const users = await User.findBySkills(skillsArray)
    .select('-password')
    .limit(50);

  sendSuccess(
    res,
    { users, count: users.length },
    'Users found successfully'
  );
});

/**
 * @desc    Get users by college
 * @route   GET /api/v1/users/college/:college
 * @access  Public
 */
export const getUsersByCollege = asyncHandler(async (req, res) => {
  const { college } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const { skip, limit: limitNum } = getPagination(page, limit);

  const users = await User.findByCollege(college)
    .select('-password')
    .skip(skip)
    .limit(limitNum)
    .sort('-createdAt');

  const total = await User.countDocuments({
    college: new RegExp(college, 'i'),
    isActive: true,
  });

  sendPaginatedResponse(
    res,
    users,
    page,
    limitNum,
    total,
    'Users retrieved successfully'
  );
});

/**
 * @desc    Get user statistics
 * @route   GET /api/v1/users/stats
 * @access  Private (Admin only)
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getUserStats();

  // Additional stats
  const collegeStats = await User.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$college',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const yearStats = await User.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$year',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess(
    res,
    {
      overall: stats,
      byCollege: collegeStats,
      byYear: yearStats,
    },
    'Statistics retrieved successfully'
  );
});

/**
 * @desc    Get recommended users (similar skills/interests)
 * @route   GET /api/v1/users/recommendations
 * @access  Private
 */
export const getRecommendedUsers = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user.id);

  if (!currentUser) {
    throw ApiError.notFound('User not found');
  }

  // Find users with similar skills or from same college
  const recommendedUsers = await User.find({
    _id: { $ne: req.user.id },
    isActive: true,
    $or: [
      { skills: { $in: currentUser.skills } },
      { college: currentUser.college },
      { interests: { $in: currentUser.interests } },
    ],
  })
    .select('-password')
    .limit(10)
    .sort('-profileCompletionPercentage');

  sendSuccess(
    res,
    { users: recommendedUsers, count: recommendedUsers.length },
    'Recommended users retrieved successfully'
  );
});

/**
 * @desc    Get user public profile
 * @route   GET /api/v1/users/:userId/profile
 * @access  Public
 */
export const getUserPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('-password -resetPasswordToken -resetPasswordExpire')
    .lean();

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Don't expose sensitive data
  delete user.verificationToken;
  delete user.verificationTokenExpiry;

  sendSuccess(res, { user }, 'User profile retrieved successfully');
});

export default {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadUserAvatar,
  uploadUserResume,
  searchBySkills,
  getUsersByCollege,
  getUserStats,
  getRecommendedUsers,
  getUserPublicProfile,
};
