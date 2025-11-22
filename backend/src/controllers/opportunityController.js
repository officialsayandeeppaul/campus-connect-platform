import Opportunity from '../models/Opportunity.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess, sendPaginatedResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';
import { sendOpportunityApplicationEmail } from '../services/emailService.js';
import { analyzeOpportunityMatch } from '../services/aiService.js';
import { uploadCompanyLogo } from '../services/uploadService.js';

/**
 * Opportunity Controller
 * Handles internship/job opportunity operations
 */

/**
 * @desc    Get all opportunities with filters
 * @route   GET /api/v1/opportunities
 * @access  Public
 */
export const getOpportunities = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    category,
    mode,
    location,
    skills,
    search,
    status = 'active',
  } = req.query;

  const { skip, limit: limitNum } = getPagination(page, limit);

  // Build query
  const query = { status };

  if (type) query.type = type;
  if (category) query.category = category;
  if (mode) query.mode = mode;
  if (location) query['location.city'] = new RegExp(location, 'i');

  if (skills) {
    const skillsArray = skills.split(',');
    query.skillsRequired = { $in: skillsArray };
  }

  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { company: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
    ];
  }

  // Only show non-expired opportunities
  query.deadline = { $gte: new Date() };

  let opportunities = await Opportunity.find(query)
    .populate('postedBy', 'fullName email college avatar')
    .skip(skip)
    .limit(limitNum)
    .sort('-createdAt');

  // Add hasApplied and isSaved flags if user is authenticated
  if (req.user) {
    opportunities = opportunities.map(opp => {
      const oppData = opp.toObject();
      oppData.hasApplied = opp.applicants.some(
        app => 
          app.user.toString() === req.user.id.toString() &&
          !['rejected', 'declined'].includes(app.status)  // Exclude rejected/declined
      );
      oppData.isSaved = opp.saves.some(
        saveId => saveId.toString() === req.user.id.toString()
      );
      return oppData;
    });
  }

  const total = await Opportunity.countDocuments(query);

  sendPaginatedResponse(
    res,
    opportunities,
    page,
    limitNum,
    total,
    'Opportunities retrieved successfully'
  );
});

/**
 * @desc    Get opportunity by ID
 * @route   GET /api/v1/opportunities/:id
 * @access  Public
 */
export const getOpportunityById = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id)
    .populate('postedBy', 'fullName email college avatar')
    .populate('applicants.user', 'fullName email college skills avatar');

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  // Increment view count
  await opportunity.incrementViews();

  // Check if user has applied or saved (if authenticated)
  const oppData = opportunity.toObject();
  if (req.user) {
    oppData.hasApplied = opportunity.applicants.some(
      app => 
        app.user._id.toString() === req.user.id.toString() &&
        !['rejected', 'declined'].includes(app.status)  // Exclude rejected/declined
    );
    oppData.isSaved = opportunity.saves.some(
      saveId => saveId.toString() === req.user.id.toString()
    );
  }

  sendSuccess(res, { opportunity: oppData }, 'Opportunity retrieved successfully');
});

/**
 * @desc    Create new opportunity
 * @route   POST /api/v1/opportunities
 * @access  Private
 */
export const createOpportunity = asyncHandler(async (req, res) => {
  const opportunityData = {
    ...req.body,
    postedBy: req.user.id,
  };

  const opportunity = await Opportunity.create(opportunityData);

  sendSuccess(res, { opportunity }, 'Opportunity created successfully', 201);
});

/**
 * @desc    Update opportunity
 * @route   PUT /api/v1/opportunities/:id
 * @access  Private (Owner or Admin)
 */
export const updateOpportunity = asyncHandler(async (req, res) => {
  let opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  // Check ownership
  if (
    opportunity.postedBy.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this opportunity');
  }

  opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  sendSuccess(res, { opportunity }, 'Opportunity updated successfully');
});

/**
 * @desc    Delete opportunity
 * @route   DELETE /api/v1/opportunities/:id
 * @access  Private (Owner or Admin)
 */
export const deleteOpportunity = asyncHandler(async (req, res) => {
  let opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  // Extract ID from postedBy (could be ObjectId or populated object)
  const postedById = opportunity.postedBy._id 
    ? opportunity.postedBy._id.toString() 
    : opportunity.postedBy.toString();

  // Check ownership
  if (
    postedById !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to delete this opportunity');
  }

  // Soft delete - mark as inactive instead of deleting
  opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    { status: 'inactive' },
    { new: true }
  );

  console.log('🗑️  Opportunity soft deleted (marked as inactive):', opportunity.title);

  sendSuccess(res, { opportunity }, 'Opportunity deleted successfully');
});

/**
 * @desc    Apply to opportunity
 * @route   POST /api/v1/opportunities/:id/apply
 * @access  Private
 */
export const applyToOpportunity = asyncHandler(async (req, res) => {
  const { coverLetter } = req.body;

  const opportunity = await Opportunity.findById(req.params.id).populate(
    'postedBy',
    'fullName email'
  );

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  // Check if already applied
  if (opportunity.hasUserApplied(req.user.id)) {
    throw ApiError.badRequest('You have already applied to this opportunity');
  }

  // Check if deadline passed
  if (opportunity.deadline < new Date()) {
    throw ApiError.badRequest('Application deadline has passed');
  }

  // Get user details
  const user = await User.findById(req.user.id);

  // Add applicant
  await opportunity.addApplicant(req.user.id, coverLetter, user.resume);

  // Update user stats
  user.stats.opportunitiesApplied += 1;
  await user.save();

  // Send notification email to opportunity poster
  sendOpportunityApplicationEmail(opportunity, user).catch(err =>
    console.error('Application email failed:', err.message)
  );

  sendSuccess(res, { opportunity }, 'Application submitted successfully');
});

/**
 * @desc    Get applicants for opportunity
 * @route   GET /api/v1/opportunities/:id/applicants
 * @access  Private (Owner or Admin)
 */
export const getApplicants = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id).populate(
    'applicants.user',
    'fullName email college year skills avatar resume'
  );

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  console.log('🔍 Checking applicants access:');
  console.log('Opportunity posted by:', opportunity.postedBy);
  
  // Extract ID from postedBy (could be ObjectId or populated object)
  const postedById = opportunity.postedBy._id 
    ? opportunity.postedBy._id.toString() 
    : opportunity.postedBy.toString();
  
  console.log('Posted by ID:', postedById);
  console.log('Current user ID:', req.user.id.toString());
  console.log('User role:', req.user.role);

  // Check ownership - handle both populated and non-populated postedBy
  const isOwner = postedById === req.user.id.toString();
  const isAdmin = req.user.role === 'admin';

  console.log('Is owner?', isOwner);
  console.log('Is admin?', isAdmin);

  if (!isOwner && !isAdmin) {
    console.log('❌ Access denied');
    throw ApiError.forbidden('Not authorized to view applicants');
  }

  console.log('✅ Access granted - returning', opportunity.applicants.length, 'applicants');

  sendSuccess(
    res,
    {
      applicants: opportunity.applicants,
      count: opportunity.applicants.length,
    },
    'Applicants retrieved successfully'
  );
});

/**
 * @desc    Update applicant status
 * @route   PUT /api/v1/opportunities/:id/applicants/:userId
 * @access  Private (Owner or Admin)
 */
export const updateApplicantStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  console.log('📝 Update applicant status request:');
  console.log('Status received:', status);
  console.log('User ID:', req.params.userId);

  const validStatuses = ['pending', 'shortlisted', 'rejected', 'selected', 'accepted', 'declined'];
  if (!validStatuses.includes(status)) {
    console.log('❌ Invalid status:', status);
    console.log('Valid statuses:', validStatuses);
    throw ApiError.badRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  // Extract ID from postedBy (could be ObjectId or populated object)
  const postedById = opportunity.postedBy._id 
    ? opportunity.postedBy._id.toString() 
    : opportunity.postedBy.toString();

  console.log('Posted by ID:', postedById);
  console.log('Current user ID:', req.user.id.toString());

  // Check ownership - handle both populated and non-populated postedBy
  const isOwner = postedById === req.user.id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    console.log('❌ Not authorized to update status');
    throw ApiError.forbidden('Not authorized to update applicant status');
  }

  console.log('✅ Updating applicant status to:', status);
  await opportunity.updateApplicantStatus(req.params.userId, status);

  sendSuccess(res, { opportunity }, 'Applicant status updated successfully');
});

/**
 * @desc    Save/bookmark opportunity
 * @route   POST /api/v1/opportunities/:id/save
 * @access  Private
 */
export const saveOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id)
    .populate('postedBy', 'fullName email college avatar');

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  // Check if already saved
  if (opportunity.saves.includes(req.user.id)) {
    // Unsave
    opportunity.saves = opportunity.saves.filter(
      id => id.toString() !== req.user.id
    );
    await opportunity.save();
    
    // Add hasApplied and isSaved flags
    const oppData = opportunity.toObject();
    oppData.hasApplied = opportunity.applicants.some(
      app => 
        app.user.toString() === req.user.id &&
        !['rejected', 'declined'].includes(app.status)  // Exclude rejected/declined
    );
    oppData.isSaved = false; // Just unsaved
    
    return sendSuccess(res, { opportunity: oppData }, 'Opportunity unsaved');
  }

  // Save
  opportunity.saves.push(req.user.id);
  await opportunity.save();

  // Add hasApplied and isSaved flags
  const oppData = opportunity.toObject();
  oppData.hasApplied = opportunity.applicants.some(
    app => 
      app.user.toString() === req.user.id &&
      !['rejected', 'declined'].includes(app.status)  // Exclude rejected/declined
  );
  oppData.isSaved = true; // Just saved

  sendSuccess(res, { opportunity: oppData }, 'Opportunity saved successfully');
});

/**
 * @desc    Get saved opportunities
 * @route   GET /api/v1/opportunities/saved
 * @access  Private
 */
export const getSavedOpportunities = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({
    saves: req.user.id,
    status: 'active',
  })
    .populate('postedBy', 'fullName email college avatar')
    .sort('-createdAt');

  sendSuccess(
    res,
    { opportunities, count: opportunities.length },
    'Saved opportunities retrieved successfully'
  );
});

/**
 * @desc    Get my posted opportunities
 * @route   GET /api/v1/opportunities/my-posts
 * @access  Private
 */
export const getMyOpportunities = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({ postedBy: req.user.id })
    .populate('applicants.user', 'fullName email college')
    .sort('-createdAt');

  sendSuccess(
    res,
    { opportunities, count: opportunities.length },
    'Your opportunities retrieved successfully'
  );
});

/**
 * @desc    Get trending opportunities
 * @route   GET /api/v1/opportunities/trending
 * @access  Public
 */
export const getTrendingOpportunities = asyncHandler(async (req, res) => {
  const trending = await Opportunity.getTrending(10);

  sendSuccess(
    res,
    { opportunities: trending },
    'Trending opportunities retrieved successfully'
  );
});

/**
 * @desc    Get AI-powered recommended opportunities for user
 * @route   GET /api/v1/opportunities/my/recommendations
 * @access  Private
 */
export const getRecommendedOpportunities = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  console.log('\n🤖 ========================================');
  console.log('🤖 AI RECOMMENDATIONS REQUEST');
  console.log('🤖 ========================================');
  console.log('👤 User:', user.fullName, '(' + user._id + ')');
  console.log('📊 Profile Completion:', user.profileCompletionPercentage + '%');
  console.log('✋ Manual Skills:', user.skills || []);
  console.log('🤖 Resume Skills:', user.resumeSkills || []);
  console.log('📄 Resume Uploaded:', user.resume ? 'Yes' : 'No');

  // Check if profile is complete enough for recommendations
  if (user.profileCompletionPercentage < 80) {
    console.log('\n❌ Profile completion below 80%');
    console.log('❌ Recommendations blocked - user needs to complete profile');
    console.log('❌ ========================================\n');
    return sendSuccess(
      res,
      { 
        opportunities: [], 
        count: 0,
        message: 'Please complete your profile (at least 80%) to get AI-powered recommendations'
      },
      'Profile incomplete'
    );
  }

  // Get all user skills (manual + extracted from resume if available)
  let allSkills = [...(user.skills || [])];
  const manualSkillsCount = allSkills.length;
  
  // If user has resume skills extracted, add them
  if (user.resumeSkills && user.resumeSkills.length > 0) {
    console.log('\n✅ RESUME-BASED MATCHING ENABLED!');
    console.log('✅ AI-Extracted Skills:', user.resumeSkills);
    allSkills = [...new Set([...allSkills, ...user.resumeSkills])]; // Remove duplicates
    console.log('✅ Combined Skills (no duplicates):', allSkills);
  } else {
    console.log('\n⚠️  No resume skills found');
    console.log('⚠️  Using only manual skills');
    if (!user.resume) {
      console.log('💡 User should upload resume for better recommendations');
    } else {
      console.log('💡 Resume uploaded but not scanned - may need to re-upload');
    }
  }

  console.log('\n🎯 MATCHING CRITERIA:');
  console.log('📊 Manual Skills:', manualSkillsCount);
  console.log('🤖 AI-Extracted Skills:', (user.resumeSkills || []).length);
  console.log('🎯 Total Skills for Matching:', allSkills.length);
  console.log('🎯 Skills:', allSkills);

  // Find opportunities matching user skills
  let opportunities;
  
  if (allSkills.length > 0) {
    console.log('\n🔍 ========================================');
    console.log('🔍 SEARCHING FOR OPPORTUNITIES');
    console.log('🔍 ========================================');
    console.log('📊 User skills:', allSkills);
    
    // Get ALL active opportunities (we'll filter by match score)
    opportunities = await Opportunity.find({ status: 'active' })
      .populate('postedBy', 'fullName email college avatar')
      .sort('-createdAt')
      .limit(100);
    
    console.log(`📊 Total active opportunities in database: ${opportunities.length}`);
    
    // Calculate match score for each opportunity
    const opportunitiesWithScores = opportunities.map(opp => {
      const oppSkills = opp.skillsRequired || [];
      
      // Convert opportunity skills (sentences) to lowercase for matching
      const oppSkillsText = oppSkills.join(' ').toLowerCase();
      
      // Count how many user skills appear in opportunity description
      let matchingSkills = [];
      allSkills.forEach(userSkill => {
        if (oppSkillsText.includes(userSkill.toLowerCase())) {
          matchingSkills.push(userSkill);
        }
      });
      
      // Calculate match percentage based on user's skills
      const matchScore = matchingSkills.length > 0 
        ? Math.round((matchingSkills.length / allSkills.length) * 100)
        : 0;
      
      return {
        ...opp.toObject(),
        matchScore,
        matchingSkills,
        totalUserSkills: allSkills.length,
        matchedCount: matchingSkills.length
      };
    });
    
    // Filter opportunities with at least 40% match (flexible matching)
    opportunities = opportunitiesWithScores.filter(opp => opp.matchScore >= 40);
    
    console.log(`\n✅ Found ${opportunities.length} opportunities with 40%+ skill match`);
    
    if (opportunities.length === 0) {
      console.log('\n⚠️  ========================================');
      console.log('⚠️  NO OPPORTUNITIES FOUND (40%+ MATCH)');
      console.log('⚠️  ========================================');
      console.log('💡 Your skills:', allSkills);
      console.log('💡 Try: Add more skills or lower match threshold');
      console.log('⚠️  ========================================\n');
    } else {
      // Sort by match score (highest first)
      opportunities = opportunities.sort((a, b) => b.matchScore - a.matchScore);
      
      console.log('\n🏆 ========================================');
      console.log('🏆 TOP MATCHES FOUND!');
      console.log('🏆 ========================================');
      opportunities.slice(0, 5).forEach((o, i) => {
        console.log(`${i + 1}. ${o.title}`);
        console.log(`   Company: ${o.company}`);
        console.log(`   Match: ${o.matchScore}% (${o.matchedCount}/${o.totalUserSkills} skills)`);
        console.log(`   Matching Skills: ${o.matchingSkills.join(', ')}`);
      });
      console.log('🏆 ========================================\n');
      
      // Return top 20
      opportunities = opportunities.slice(0, 20);
    }
    
  } else {
    // If no skills, return recent opportunities
    console.log('\n⚠️  No skills found, returning recent opportunities');
    opportunities = await Opportunity.find({ status: 'active' })
      .populate('postedBy', 'fullName email college avatar')
      .limit(20)
      .sort('-createdAt');
    
    console.log(`✅ Found ${opportunities.length} recent opportunities`);
  }

  const resumeBased = user.resumeSkills && user.resumeSkills.length > 0;
  
  console.log('\n📤 ========================================');
  console.log('📤 SENDING RESPONSE');
  console.log('📤 ========================================');
  console.log('📊 Opportunities:', opportunities.length);
  console.log('🤖 Resume-Based:', resumeBased ? 'YES ✅' : 'NO ❌');
  console.log('📊 Skills Used:', allSkills.length);
  console.log('📤 ========================================\n');

  sendSuccess(
    res,
    { 
      opportunities, 
      count: opportunities.length,
      skillsUsed: allSkills,
      resumeBased: resumeBased
    },
    'AI-powered recommendations retrieved successfully'
  );
});

/**
 * @desc    Analyze match between user and opportunity
 * @route   GET /api/v1/opportunities/:id/match
 * @access  Private
 */
export const analyzeMatch = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  const user = await User.findById(req.user.id);

  // Use AI service to analyze match
  const matchAnalysis = await analyzeOpportunityMatch(user, opportunity);

  sendSuccess(
    res,
    { match: matchAnalysis },
    'Match analysis completed successfully'
  );
});

/**
 * @desc    Upload company logo
 * @route   POST /api/v1/opportunities/:id/upload-logo
 * @access  Private (Owner or Admin)
 */
export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload an image file');
  }

  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    throw ApiError.notFound('Opportunity not found');
  }

  // Check ownership
  if (
    opportunity.postedBy.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    throw ApiError.forbidden('Not authorized to update this opportunity');
  }

  // Upload to Cloudinary
  const result = await uploadCompanyLogo(req.file);

  // Update opportunity
  opportunity.companyLogo = result.url;
  await opportunity.save();

  sendSuccess(
    res,
    { companyLogo: result.url, opportunity },
    'Company logo uploaded successfully'
  );
});

/**
 * @desc    Get opportunity statistics
 * @route   GET /api/v1/opportunities/stats
 * @access  Private (Admin)
 */
export const getOpportunityStats = asyncHandler(async (req, res) => {
  const stats = await Opportunity.getStats();

  const totalOpportunities = await Opportunity.countDocuments();
  const activeOpportunities = await Opportunity.countDocuments({ status: 'active' });
  const totalApplications = await Opportunity.aggregate([
    {
      $project: {
        applicantCount: { $size: '$applicants' },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$applicantCount' },
      },
    },
  ]);

  sendSuccess(
    res,
    {
      overall: {
        total: totalOpportunities,
        active: activeOpportunities,
        totalApplications: totalApplications[0]?.total || 0,
      },
      byType: stats,
    },
    'Statistics retrieved successfully'
  );
});

export default {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  applyToOpportunity,
  getApplicants,
  updateApplicantStatus,
  saveOpportunity,
  getSavedOpportunities,
  getMyOpportunities,
  getTrendingOpportunities,
  getRecommendedOpportunities,
  analyzeMatch,
  uploadLogo,
  getOpportunityStats,
};
