import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },

    // Academic Information
    college: {
      type: String,
      required: [true, 'Please provide your college name'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please provide your current year'],
      min: [1, 'Year must be between 1 and 5'],
      max: [5, 'Year must be between 1 and 5'],
    },
    branch: {
      type: String,
      required: [true, 'Please provide your branch/department'],
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },

    // Profile Information
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    resumeSkills: {
      type: [String],
      default: [],
      // Skills extracted from resume using AI
    },
    resumeData: {
      // Structured data extracted from resume
      experience: [
        {
          company: String,
          role: String,
          duration: String,
          description: String,
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          year: String,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
        },
      ],
      extractedAt: Date,
    },
    interests: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/avatar-placeholder.png',
    },
    resume: {
      type: String, // URL to resume file
    },

    // Contact Information
    phone: {
      type: String,
      // Flexible phone validation - allows international formats
    },
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },

    // Social Links
    socialLinks: {
      linkedin: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?linkedin\.com\/.+/,
          'Please provide a valid LinkedIn URL',
        ],
      },
      github: {
        type: String,
        match: [
          /^https?:\/\/(www\.)?github\.com\/.+/,
          'Please provide a valid GitHub URL',
        ],
      },
      portfolio: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
      },
      twitter: String,
    },

    // User Role & Status
    role: {
      type: String,
      enum: ['student', 'recruiter', 'admin', 'moderator'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Profile Completion
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    profileCompletionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Verification & Security
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Activity Tracking
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },

    // Preferences
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      opportunityAlerts: {
        type: Boolean,
        default: true,
      },
      collaborationRequests: {
        type: Boolean,
        default: true,
      },
    },

    // Statistics
    stats: {
      opportunitiesApplied: {
        type: Number,
        default: 0,
      },
      collaborationsJoined: {
        type: Number,
        default: 0,
      },
      eventsAttended: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES for better query performance
// ============================================
// Note: email index is already created by unique: true
userSchema.index({ college: 1, year: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Virtual for opportunities posted by user
userSchema.virtual('opportunities', {
  ref: 'Opportunity',
  localField: '_id',
  foreignField: 'postedBy',
});

// Virtual for collaborations created by user
userSchema.virtual('collaborations', {
  ref: 'Collaboration',
  localField: '_id',
  foreignField: 'createdBy',
});

// ============================================
// MIDDLEWARE (Hooks)
// ============================================

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Calculate profile completion percentage before saving
userSchema.pre('save', function (next) {
  // Base fields for all users
  let fields = [
    'fullName',
    'email',
    'college',
    'bio',
    'phone',
    'avatar',
    'socialLinks.linkedin',
  ];

  // Add role-specific fields
  if (this.role === 'student') {
    // Students need: year, branch, skills, resume
    fields.push('year', 'branch', 'skills', 'resume', 'socialLinks.github', 'socialLinks.portfolio');
  } else if (this.role === 'recruiter') {
    // Recruiters need: company info, but NOT resume
    // Add company field if it exists in schema, or just use base fields
    fields.push('socialLinks.github', 'socialLinks.portfolio');
  } else {
    // Admin or other roles - use base fields
    fields.push('socialLinks.github', 'socialLinks.portfolio');
  }

  let completed = 0;
  fields.forEach(field => {
    let value;
    if (field.includes('.')) {
      // Handle nested fields like socialLinks.linkedin
      const parts = field.split('.');
      value = this[parts[0]]?.[parts[1]];
    } else {
      value = this[field];
    }

    // Check if field has value
    if (value) {
      if (Array.isArray(value)) {
        // For arrays, check if not empty
        if (value.length > 0) completed++;
      } else if (typeof value === 'string') {
        // For strings, check if not empty after trim
        if (value.trim().length > 0) completed++;
      } else {
        // For other types (number, boolean, object)
        completed++;
      }
    }
  });

  this.profileCompletionPercentage = Math.round((completed / fields.length) * 100);
  this.profileCompleted = this.profileCompletionPercentage >= 80;
  
  console.log('Profile completion calculated:', {
    userId: this._id,
    role: this.role,
    completed: completed,
    total: fields.length,
    percentage: this.profileCompletionPercentage,
    fieldsChecked: fields,
  });

  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpire;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

// ============================================
// STATIC METHODS
// ============================================

// Find users by skills
userSchema.statics.findBySkills = function (skills) {
  return this.find({ skills: { $in: skills } });
};

// Find users by college
userSchema.statics.findByCollege = function (college) {
  return this.find({ college: new RegExp(college, 'i') });
};

// Get user statistics
userSchema.statics.getUserStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: {
          $sum: { $cond: ['$isVerified', 1, 0] },
        },
        activeUsers: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
      },
    },
  ]);

  return stats[0] || { totalUsers: 0, verifiedUsers: 0, activeUsers: 0 };
};

const User = mongoose.model('User', userSchema);

export default User;
