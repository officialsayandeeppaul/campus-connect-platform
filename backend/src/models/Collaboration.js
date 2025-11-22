import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Please provide collaboration title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    projectType: {
      type: String,
      required: [true, 'Please specify project type'],
      enum: {
        values: [
          'hackathon',
          'research',
          'startup',
          'open-source',
          'academic',
          'competition',
          'personal',
          'other',
        ],
        message: 'Please select a valid project type',
      },
    },

    // Requirements
    skillsNeeded: {
      type: [String],
      required: [true, 'Please specify required skills'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one skill is required',
      },
    },
    rolesNeeded: [
      {
        role: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          default: 1,
          min: 1,
        },
        description: String,
        filled: {
          type: Boolean,
          default: false,
        },
      },
    ],
    teamSize: {
      current: {
        type: Number,
        default: 1, // Creator is first member
      },
      required: {
        type: Number,
        required: [true, 'Please specify required team size'],
        min: 2,
        max: 20,
      },
    },

    // Timeline
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months'],
        default: 'months',
      },
      text: String, // e.g., "2-3 months"
    },
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date, // Deadline to join
    },

    // Project Details
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: [
        'Web Development',
        'Mobile Development',
        'AI/ML',
        'Data Science',
        'Blockchain',
        'IoT',
        'Game Development',
        'UI/UX Design',
        'Research',
        'Business',
        'Other',
      ],
    },
    techStack: [String], // Technologies to be used
    goals: [String], // Project goals/objectives
    expectedOutcome: {
      type: String,
      maxlength: [500, 'Expected outcome cannot be more than 500 characters'],
    },

    // Team & Members
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamMembers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: String,
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['active', 'inactive', 'left'],
          default: 'active',
        },
      },
    ],

    // Interest & Applications
    interestedUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        message: String, // Why they want to join
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],

    // Status & Visibility
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled', 'on-hold'],
      default: 'open',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'college-only', 'private'],
      default: 'public',
    },

    // Communication
    communicationChannels: {
      slack: String,
      discord: String,
      whatsapp: String,
      telegram: String,
      email: String,
    },
    meetingSchedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'as-needed'],
      },
      preferredTime: String,
    },

    // Project Resources
    repository: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    documentation: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],

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
    tags: [String],
    isRemote: {
      type: Boolean,
      default: true,
    },
    location: {
      city: String,
      state: String,
    },
    rewards: {
      type: String, // e.g., "Certificate", "Prize Money", "Publication"
      maxlength: [500, 'Rewards description cannot be more than 500 characters'],
    },
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
collaborationSchema.index({ title: 'text', description: 'text' });
collaborationSchema.index({ projectType: 1, status: 1 });
collaborationSchema.index({ skillsNeeded: 1 });
collaborationSchema.index({ category: 1 });
collaborationSchema.index({ createdAt: -1 });
collaborationSchema.index({ createdBy: 1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Total interested users count
collaborationSchema.virtual('interestCount').get(function () {
  return this.interestedUsers.length;
});

// Is team full
collaborationSchema.virtual('isTeamFull').get(function () {
  return this.teamSize.current >= this.teamSize.required;
});

// Spots remaining
collaborationSchema.virtual('spotsRemaining').get(function () {
  return Math.max(0, this.teamSize.required - this.teamSize.current);
});

// ============================================
// MIDDLEWARE
// ============================================

// Auto-add creator as first team member
collaborationSchema.pre('save', function (next) {
  if (this.isNew && this.teamMembers.length === 0) {
    this.teamMembers.push({
      user: this.createdBy,
      role: 'Creator/Lead',
      joinedAt: new Date(),
      status: 'active',
    });
  }
  next();
});

// Update team size current count
collaborationSchema.pre('save', function (next) {
  this.teamSize.current = this.teamMembers.filter(m => m.status === 'active').length;
  next();
});

// Populate creator and team members
collaborationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'fullName email college avatar skills',
  }).populate({
    path: 'teamMembers.user',
    select: 'fullName email college avatar skills',
  });
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Check if user has expressed interest
collaborationSchema.methods.hasUserInterested = function (userId) {
  return this.interestedUsers.some(
    interest => interest.user.toString() === userId.toString()
  );
};

// Check if user is team member
collaborationSchema.methods.isTeamMember = function (userId) {
  return this.teamMembers.some(
    member => member.user.toString() === userId.toString() && member.status === 'active'
  );
};

// Express interest
collaborationSchema.methods.expressInterest = function (userId, message) {
  if (this.hasUserInterested(userId)) {
    throw new Error('User has already expressed interest');
  }

  if (this.isTeamMember(userId)) {
    throw new Error('User is already a team member');
  }

  if (this.isTeamFull) {
    throw new Error('Team is already full');
  }

  this.interestedUsers.push({
    user: userId,
    message,
    appliedAt: new Date(),
    status: 'pending',
  });

  return this.save();
};

// Accept interest and add to team
collaborationSchema.methods.acceptInterest = function (userId, role = 'Member') {
  const interest = this.interestedUsers.find(
    int => int.user.toString() === userId.toString()
  );

  if (!interest) {
    throw new Error('Interest request not found');
  }

  if (this.isTeamFull) {
    throw new Error('Team is already full');
  }

  // Update interest status
  interest.status = 'accepted';

  // Add to team members
  this.teamMembers.push({
    user: userId,
    role,
    joinedAt: new Date(),
    status: 'active',
  });

  return this.save();
};

// Reject interest
collaborationSchema.methods.rejectInterest = function (userId) {
  const interest = this.interestedUsers.find(
    int => int.user.toString() === userId.toString()
  );

  if (!interest) {
    throw new Error('Interest request not found');
  }

  interest.status = 'rejected';
  return this.save();
};

// Remove team member
collaborationSchema.methods.removeMember = function (userId) {
  const member = this.teamMembers.find(
    m => m.user.toString() === userId.toString()
  );

  if (!member) {
    throw new Error('Team member not found');
  }

  if (member.user.toString() === this.createdBy.toString()) {
    throw new Error('Cannot remove project creator');
  }

  member.status = 'left';
  return this.save();
};

// Increment views
collaborationSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Find open collaborations
collaborationSchema.statics.findOpen = function () {
  return this.find({
    status: 'open',
    isActive: true,
  }).sort('-createdAt');
};

// Find by skills
collaborationSchema.statics.findBySkills = function (skills) {
  return this.find({
    skillsNeeded: { $in: skills },
    status: 'open',
    isActive: true,
  });
};

// Find by project type
collaborationSchema.statics.findByType = function (type) {
  return this.find({
    projectType: type,
    status: 'open',
    isActive: true,
  });
};

// Get trending collaborations
collaborationSchema.statics.getTrending = function (limit = 10) {
  return this.aggregate([
    { $match: { status: 'open', isActive: true } },
    { $addFields: { interestCount: { $size: '$interestedUsers' } } },
    { $sort: { interestCount: -1, views: -1 } },
    { $limit: limit },
  ]);
};

// Get collaboration statistics
collaborationSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$projectType',
        count: { $sum: 1 },
        avgTeamSize: { $avg: '$teamSize.current' },
      },
    },
  ]);

  return stats;
};

const Collaboration = mongoose.model('Collaboration', collaborationSchema);

export default Collaboration;
