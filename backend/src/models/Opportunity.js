import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Please provide opportunity title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      trim: true,
    },
    companyLogo: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    description: {
      type: String,
      required: [true, 'Please provide opportunity description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },

    // Opportunity Details
    type: {
      type: String,
      required: [true, 'Please specify opportunity type'],
      enum: {
        values: ['internship', 'job', 'freelance', 'project', 'volunteer'],
        message: 'Type must be: internship, job, freelance, project, or volunteer',
      },
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: [
        'Software Development',
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Machine Learning',
        'UI/UX Design',
        'Digital Marketing',
        'Content Writing',
        'Business Development',
        'Sales',
        'HR',
        'Finance',
        'Operations',
        'Other',
      ],
    },
    mode: {
      type: String,
      required: [true, 'Please specify work mode'],
      enum: {
        values: ['remote', 'onsite', 'hybrid'],
        message: 'Mode must be: remote, onsite, or hybrid',
      },
      default: 'remote',
    },

    // Location
    location: {
      city: {
        type: String,
        required: [true, 'Please provide city'],
      },
      state: String,
      country: {
        type: String,
        default: 'India',
      },
      isLocal: {
        type: Boolean,
        default: true, // For Asansol/Durgapur local opportunities
      },
    },

    // Duration & Timeline
    duration: {
      value: Number, // in months
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'months',
      },
      text: String, // e.g., "3-6 months"
    },
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide application deadline'],
    },

    // Compensation
    stipend: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR',
      },
      isPaid: {
        type: Boolean,
        default: true,
      },
      text: String, // e.g., "₹5,000 - ₹10,000/month"
    },

    // Requirements
    skillsRequired: {
      type: [String],
      required: [true, 'Please specify required skills'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one skill is required',
      },
    },
    eligibility: {
      minYear: {
        type: Number,
        min: 1,
        max: 5,
      },
      maxYear: {
        type: Number,
        min: 1,
        max: 5,
      },
      branches: [String], // Eligible branches
      minCGPA: Number,
    },
    experienceRequired: {
      type: String,
      enum: ['fresher', 'beginner', 'intermediate', 'advanced'],
      default: 'fresher',
    },

    // Application Details
    applicationUrl: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    applicationEmail: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    applicationProcess: {
      type: String,
      maxlength: [1000, 'Application process cannot be more than 1000 characters'],
    },

    // Applicants
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'shortlisted', 'rejected', 'selected', 'accepted', 'declined'],
          default: 'pending',
        },
        coverLetter: String,
        resumeUrl: String,
      },
    ],

    // Posted By
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyContact: {
      name: String,
      email: String,
      phone: String,
    },

    // Status & Visibility
    status: {
      type: String,
      enum: ['active', 'closed', 'draft', 'expired'],
      default: 'active',
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin verification
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Engagement Metrics
    views: {
      type: Number,
      default: 0,
    },
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Additional Info
    benefits: [String], // e.g., ["Certificate", "Letter of Recommendation"]
    tags: [String],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
opportunitySchema.index({ title: 'text', description: 'text', company: 'text' });
opportunitySchema.index({ type: 1, status: 1 });
opportunitySchema.index({ 'location.city': 1 });
opportunitySchema.index({ skillsRequired: 1 });
opportunitySchema.index({ deadline: 1 });
opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ postedBy: 1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Total applicants count
opportunitySchema.virtual('applicantCount').get(function () {
  return this.applicants.length;
});

// Is deadline passed
opportunitySchema.virtual('isExpired').get(function () {
  return this.deadline < new Date();
});

// Days remaining
opportunitySchema.virtual('daysRemaining').get(function () {
  const diff = this.deadline - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ============================================
// MIDDLEWARE
// ============================================

// Auto-update status to expired if deadline passed
opportunitySchema.pre('save', function (next) {
  if (this.deadline < new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Populate postedBy user details
opportunitySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'postedBy',
    select: 'fullName email college avatar',
  });
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Check if user has applied (and not rejected/declined)
opportunitySchema.methods.hasUserApplied = function (userId) {
  return this.applicants.some(
    applicant => 
      applicant.user.toString() === userId.toString() &&
      !['rejected', 'declined'].includes(applicant.status)  // Exclude rejected/declined
  );
};

// Add applicant
opportunitySchema.methods.addApplicant = function (userId, coverLetter, resumeUrl) {
  if (this.hasUserApplied(userId)) {
    throw new Error('User has already applied to this opportunity');
  }

  // Check if user had previously applied and was rejected/declined
  const previousApplicant = this.applicants.find(
    applicant => 
      applicant.user.toString() === userId.toString() &&
      ['rejected', 'declined'].includes(applicant.status)
  );

  if (previousApplicant) {
    // Re-apply: update existing entry
    previousApplicant.coverLetter = coverLetter;
    previousApplicant.resumeUrl = resumeUrl;
    previousApplicant.appliedAt = new Date();
    previousApplicant.status = 'pending';
  } else {
    // New application: add to array
    this.applicants.push({
      user: userId,
      coverLetter,
      resumeUrl,
      appliedAt: new Date(),
      status: 'pending',
    });
  }

  return this.save();
};

// Update applicant status
opportunitySchema.methods.updateApplicantStatus = function (userId, status) {
  const applicant = this.applicants.find(
    app => app.user.toString() === userId.toString()
  );

  if (!applicant) {
    throw new Error('Applicant not found');
  }

  applicant.status = status;
  return this.save();
};

// Increment views
opportunitySchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Find active opportunities
opportunitySchema.statics.findActive = function () {
  return this.find({
    status: 'active',
    deadline: { $gte: new Date() },
  }).sort('-createdAt');
};

// Find by location
opportunitySchema.statics.findByLocation = function (city) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    status: 'active',
  });
};

// Find by skills
opportunitySchema.statics.findBySkills = function (skills) {
  return this.find({
    skillsRequired: { $in: skills },
    status: 'active',
  });
};

// Get trending opportunities (most applied)
opportunitySchema.statics.getTrending = function (limit = 10) {
  return this.aggregate([
    { $match: { status: 'active' } },
    { $addFields: { applicantCount: { $size: '$applicants' } } },
    { $sort: { applicantCount: -1, views: -1 } },
    { $limit: limit },
  ]);
};

// Get opportunity statistics
opportunitySchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgApplicants: { $avg: { $size: '$applicants' } },
      },
    },
  ]);

  return stats;
};

const Opportunity = mongoose.model('Opportunity', opportunitySchema);

export default Opportunity;
