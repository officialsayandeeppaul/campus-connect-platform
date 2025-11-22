import { generateAIResponse, parseResume, matchSkills, recommendOpportunities, generateCoverLetter } from '../config/gemini.js';

/**
 * AI Service - Wrapper for Google Gemini AI
 * Provides high-level AI features for the platform
 */

/**
 * Parse resume text and extract structured information
 * @param {string} resumeText - Resume content as text
 * @returns {Promise<Object>} - Extracted resume data
 */
export const extractResumeData = async (resumeText) => {
  try {
    const data = await parseResume(resumeText);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Resume parsing error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Match student profile with opportunity requirements
 * @param {Object} student - Student profile
 * @param {Object} opportunity - Opportunity details
 * @returns {Promise<Object>} - Match analysis
 */
export const analyzeOpportunityMatch = async (student, opportunity) => {
  try {
    const matchResult = await matchSkills(
      student.skills || [],
      opportunity.skillsRequired || []
    );

    return {
      success: true,
      matchPercentage: matchResult.matchPercentage || 0,
      matchingSkills: matchResult.matchingSkills || [],
      missingSkills: matchResult.missingSkills || [],
      recommendations: matchResult.recommendations || [],
    };
  } catch (error) {
    console.error('Match analysis error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get personalized opportunity recommendations for a user
 * @param {Object} userProfile - User profile data
 * @param {Array} opportunities - Available opportunities
 * @returns {Promise<Array>} - Recommended opportunities with scores
 */
export const getPersonalizedRecommendations = async (userProfile, opportunities) => {
  try {
    const recommendations = await recommendOpportunities(userProfile, opportunities);
    return {
      success: true,
      recommendations,
    };
  } catch (error) {
    console.error('Recommendation error:', error);
    return {
      success: false,
      recommendations: [],
      error: error.message,
    };
  }
};

/**
 * Generate cover letter for opportunity application
 * @param {Object} userProfile - User profile
 * @param {Object} opportunity - Opportunity details
 * @returns {Promise<string>} - Generated cover letter
 */
export const createCoverLetter = async (userProfile, opportunity) => {
  try {
    const coverLetter = await generateCoverLetter(userProfile, opportunity);
    return {
      success: true,
      coverLetter,
    };
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate project description from brief idea
 * @param {string} projectIdea - Brief project idea
 * @returns {Promise<string>} - Detailed project description
 */
export const generateProjectDescription = async (projectIdea) => {
  try {
    const prompt = `
      Given this project idea: "${projectIdea}"
      
      Generate a detailed project description (200-300 words) that includes:
      1. Project overview
      2. Key features
      3. Target audience
      4. Expected outcomes
      5. Technical requirements
      
      Make it professional and engaging.
    `;

    const description = await generateAIResponse(prompt);
    return {
      success: true,
      description,
    };
  } catch (error) {
    console.error('Project description generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Suggest skills based on career goal
 * @param {string} careerGoal - User's career goal
 * @returns {Promise<Array>} - Suggested skills to learn
 */
export const suggestSkills = async (careerGoal) => {
  try {
    const prompt = `
      For someone who wants to become a ${careerGoal}, suggest:
      1. Top 10 essential skills they should learn
      2. Priority order (most important first)
      3. Brief reason for each skill
      
      Return as JSON array with: { skill, priority, reason }
    `;

    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const skills = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        skills,
      };
    }

    return {
      success: false,
      error: 'Failed to parse AI response',
    };
  } catch (error) {
    console.error('Skill suggestion error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate interview questions for a role
 * @param {string} role - Job role
 * @param {Array} skills - Required skills
 * @returns {Promise<Array>} - Interview questions
 */
export const generateInterviewQuestions = async (role, skills) => {
  try {
    const prompt = `
      Generate 10 interview questions for a ${role} position requiring these skills: ${skills.join(', ')}
      
      Include:
      - 3 technical questions
      - 3 behavioral questions
      - 2 situational questions
      - 2 skill-specific questions
      
      Return as JSON array with: { question, type, difficulty }
    `;

    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        questions,
      };
    }

    return {
      success: false,
      error: 'Failed to parse AI response',
    };
  } catch (error) {
    console.error('Interview questions generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Analyze user's profile and suggest improvements
 * @param {Object} userProfile - User profile data
 * @returns {Promise<Object>} - Profile improvement suggestions
 */
export const analyzeProfile = async (userProfile) => {
  try {
    const prompt = `
      Analyze this student profile and provide improvement suggestions:
      
      Name: ${userProfile.fullName}
      College: ${userProfile.college}
      Year: ${userProfile.year}
      Skills: ${userProfile.skills.join(', ')}
      Bio: ${userProfile.bio}
      
      Provide:
      1. Profile strength score (0-100)
      2. What's good about the profile
      3. What's missing
      4. 5 specific improvement suggestions
      
      Return as JSON with: { score, strengths, weaknesses, suggestions }
    `;

    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        analysis,
      };
    }

    return {
      success: false,
      error: 'Failed to parse AI response',
    };
  } catch (error) {
    console.error('Profile analysis error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate event description from basic details
 * @param {Object} eventDetails - Basic event details
 * @returns {Promise<string>} - Generated event description
 */
export const generateEventDescription = async (eventDetails) => {
  try {
    const prompt = `
      Create an engaging event description for:
      
      Title: ${eventDetails.title}
      Type: ${eventDetails.eventType}
      Topics: ${eventDetails.topics?.join(', ') || 'General'}
      
      Generate a 150-200 word description that:
      1. Explains what attendees will learn
      2. Highlights key benefits
      3. Creates excitement
      4. Includes a call-to-action
      
      Make it professional yet engaging.
    `;

    const description = await generateAIResponse(prompt);
    return {
      success: true,
      description,
    };
  } catch (error) {
    console.error('Event description generation error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Chat with AI assistant
 * @param {string} userMessage - User's question
 * @param {Object} context - Optional context (user profile, etc.)
 * @returns {Promise<string>} - AI response
 */
export const chatWithAI = async (userMessage, context = {}) => {
  try {
    let prompt = userMessage;

    // Add context if provided
    if (context.userProfile) {
      prompt = `
        User Context:
        - Name: ${context.userProfile.fullName}
        - College: ${context.userProfile.college}
        - Skills: ${context.userProfile.skills.join(', ')}
        
        User Question: ${userMessage}
        
        Provide a helpful, personalized response.
      `;
    }

    const response = await generateAIResponse(prompt);
    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  extractResumeData,
  analyzeOpportunityMatch,
  getPersonalizedRecommendations,
  createCoverLetter,
  generateProjectDescription,
  suggestSkills,
  generateInterviewQuestions,
  analyzeProfile,
  generateEventDescription,
  chatWithAI,
};
