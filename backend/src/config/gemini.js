import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Google Gemini AI Configuration
 * Get API key from: https://ai.google.dev/
 * Free tier: 60 requests per minute
 */

let genAI = null;
let model = null;

// Initialize Gemini AI
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Try multiple model names for compatibility
    // For the free tier, use: gemini-1.5-flash-latest or gemini-1.5-flash-001
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    console.log('✅ Google Gemini AI initialized successfully (gemini-1.5-flash-latest)');
  } catch (error) {
    console.warn('⚠️  Gemini AI initialization failed:', error.message);
    console.warn('💡 Trying fallback model...');
    try {
      // Fallback to older stable model
      model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
      console.log('✅ Google Gemini AI initialized with fallback model (gemini-1.5-pro-latest)');
    } catch (fallbackError) {
      console.warn('⚠️  All models failed. AI features will be disabled.');
      console.warn('💡 Please check your GEMINI_API_KEY and ensure it has access to Gemini models');
      console.warn('💡 Get API key from: https://ai.google.dev/');
    }
  }
} else {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
  console.warn('💡 AI features will be disabled. Get free API key from: https://ai.google.dev/');
}

/**
 * Generate AI response
 * @param {string} prompt - The prompt to send to AI
 * @returns {Promise<string>} - AI generated response
 */
export const generateAIResponse = async (prompt) => {
  if (!model) {
    throw new Error('Gemini AI is not configured. Please add GEMINI_API_KEY to .env');
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw new Error('Failed to generate AI response');
  }
};

/**
 * Parse resume text and extract skills
 * @param {string} resumeText - Resume content
 * @returns {Promise<object>} - Extracted information
 */
export const parseResume = async (resumeText) => {
  if (!model) {
    throw new Error('Gemini AI is not configured');
  }

  const prompt = `
    Analyze this resume and extract the following information in JSON format:
    - skills: Array of technical and soft skills
    - experience: Array of work experiences with company, role, and duration
    - education: Array of educational qualifications
    - projects: Array of projects mentioned
    
    Resume text:
    ${resumeText}
    
    Return only valid JSON, no additional text.
  `;

  try {
    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Resume parsing error:', error);
    throw new Error('Failed to parse resume');
  }
};

/**
 * Match student skills with opportunity requirements
 * @param {Array} studentSkills - Student's skills
 * @param {Array} requiredSkills - Required skills for opportunity
 * @returns {Promise<object>} - Match score and recommendations
 */
export const matchSkills = async (studentSkills, requiredSkills) => {
  if (!model) {
    throw new Error('Gemini AI is not configured');
  }

  const prompt = `
    Compare these two skill sets and provide:
    1. Match percentage (0-100)
    2. Matching skills
    3. Missing skills
    4. Recommendations for improvement
    
    Student Skills: ${studentSkills.join(', ')}
    Required Skills: ${requiredSkills.join(', ')}
    
    Return as JSON with keys: matchPercentage, matchingSkills, missingSkills, recommendations
  `;

  try {
    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Skill matching error:', error);
    throw new Error('Failed to match skills');
  }
};

/**
 * Generate personalized opportunity recommendations
 * @param {object} userProfile - User profile data
 * @param {Array} opportunities - Available opportunities
 * @returns {Promise<Array>} - Recommended opportunities with scores
 */
export const recommendOpportunities = async (userProfile, opportunities) => {
  if (!model) {
    throw new Error('Gemini AI is not configured');
  }

  const prompt = `
    Given this student profile:
    Skills: ${userProfile.skills.join(', ')}
    College: ${userProfile.college}
    Year: ${userProfile.year}
    Interests: ${userProfile.bio}
    
    And these opportunities:
    ${JSON.stringify(opportunities, null, 2)}
    
    Recommend the top 5 most suitable opportunities with reasoning.
    Return as JSON array with: opportunityId, score (0-100), reason
  `;

  try {
    const response = await generateAIResponse(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Recommendation error:', error);
    throw new Error('Failed to generate recommendations');
  }
};

/**
 * Generate cover letter based on user profile and opportunity
 * @param {object} userProfile - User profile
 * @param {object} opportunity - Opportunity details
 * @returns {Promise<string>} - Generated cover letter
 */
export const generateCoverLetter = async (userProfile, opportunity) => {
  if (!model) {
    throw new Error('Gemini AI is not configured');
  }

  const prompt = `
    Write a professional cover letter for this student:
    Name: ${userProfile.fullName}
    College: ${userProfile.college}
    Skills: ${userProfile.skills.join(', ')}
    Bio: ${userProfile.bio}
    
    Applying for:
    Position: ${opportunity.title}
    Company: ${opportunity.company}
    Requirements: ${opportunity.skillsRequired.join(', ')}
    
    Make it concise (200-250 words), professional, and highlight relevant skills.
  `;

  try {
    const response = await generateAIResponse(prompt);
    return response;
  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw new Error('Failed to generate cover letter');
  }
};

export { genAI, model };
export default { generateAIResponse, parseResume, matchSkills, recommendOpportunities, generateCoverLetter };
