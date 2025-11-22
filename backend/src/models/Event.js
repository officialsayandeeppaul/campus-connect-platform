import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Please provide event title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide event description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    eventType: {
      type: String,
      required: [true, 'Please specify event type'],
      enum: {
        values: [
          'workshop',
          'seminar',
          'webinar',
          'hackathon',
          'competition',
          'company-visit',
          'placement-drive',
          'tech-talk',
          'networking',
          'conference',
          'meetup',
          'other',
        ],
        message: 'Please select a valid event type',
      },
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: [
        'Technical',
        'Career',
        'Placement',
        'Entrepreneurship',
        'Cultural',
        'Sports',
        'Social',
        'Academic',
        'Other',
      ],
    },

    // Date & Time
    startDate: {
      type: Date,
      required: [true, 'Please provide event start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide event end date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },

    // Location
    mode: {
      type: String,
      required: [true, 'Please specify event mode'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be: online, offline, or hybrid',
      },
    },
    venue: {
      name: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      mapLink: String,
    },
    onlineLink: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    meetingPlatform: {
      type: String,
      enum: ['zoom', 'google-meet', 'microsoft-teams', 'webex', 'other'],
    },

    // Organizer Information
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizingBody: {
      name: String, // e.g., "IEEE Student Chapter", "College Name"
      type: {
        type: String,
        enum: ['college', 'club', 'company', 'community', 'individual'],
      },
      logo: String,
      contact: {
        email: String,
        phone: String,
        website: String,
      },
    },
    speakers: [
      {
        name: {
          type: String,
          required: true,
        },
        designation: String,
        company: String,
        bio: String,
        photo: String,
        socialLinks: {
          linkedin: String,
          twitter: String,
        },
      },
    ],

    // Registration
    registrationRequired: {
      type: Boolean,
      default: true,
    },
    registrationDeadline: {
      type: Date,
    },
    registrationLink: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    maxAttendees: {
      type: Number,
      min: 1,
    },
    registrationFee: {
      amount: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      isFree: {
        type: Boolean,
        default: true,
      },
    },

    // Attendees & RSVPs
    attendees: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['registered', 'attended', 'cancelled', 'no-show'],
          default: 'registered',
        },
        paymentStatus: {
          type: String,
          enum: ['pending', 'completed', 'failed', 'refunded'],
          default: 'completed',
        },
      },
    ],

    // Eligibility
    eligibility: {
      openToAll: {
        type: Boolean,
        default: true,
      },
      colleges: [String], // Specific colleges if not open to all
      years: [Number], // Eligible years
      branches: [String], // Eligible branches
    },

    // Event Details
    agenda: [
      {
        time: String,
        title: String,
        description: String,
        speaker: String,
      },
    ],
    topics: [String], // Topics to be covered
    prerequisites: [String], // What attendees should know
    learningOutcomes: [String], // What attendees will learn
    
    // Resources
    poster: {
      type: String, // Image URL
    },
    banner: {
      type: String, // Image URL
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    recordingUrl: {
      type: String, // For recorded sessions
    },
    materialsUrl: {
      type: String, // Study materials, slides, etc.
    },

    // Benefits & Rewards
    benefits: [String], // e.g., ["Certificate", "Networking", "Swag"]
    certificateProvided: {
      type: Boolean,
      default: false,
    },
    prizes: {
      type: String,
      maxlength: [500, 'Prizes description cannot be more than 500 characters'],
    },

    // Status & Visibility
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'],
      default: 'upcoming',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['public', 'college-only', 'private'],
      default: 'public',
    },

    // Engagement Metrics
    views: {
      type: Number,
      default: 0,
    },
    interested: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },

    // Additional Info
    tags: [String],
    socialMediaLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },
    hashtags: [String],
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
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ eventType: 1, status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ 'venue.city': 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ organizer: 1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Total attendees count
eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees.length;
});

// Is registration full
eventSchema.virtual('isRegistrationFull').get(function () {
  if (!this.maxAttendees) return false;
  return this.attendees.length >= this.maxAttendees;
});

// Spots remaining
eventSchema.virtual('spotsRemaining').get(function () {
  if (!this.maxAttendees) return null;
  return Math.max(0, this.maxAttendees - this.attendees.length);
});

// Is registration open
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  const deadlinePassed = this.registrationDeadline && this.registrationDeadline < now;
  const eventStarted = this.startDate < now;
  return !deadlinePassed && !eventStarted && !this.isRegistrationFull;
});

// Event duration in hours
eventSchema.virtual('durationInHours').get(function () {
  const diff = this.endDate - this.startDate;
  return Math.round(diff / (1000 * 60 * 60));
});

// ============================================
// MIDDLEWARE
// ============================================

// Auto-update status based on dates
eventSchema.pre('save', function (next) {
  const now = new Date();
  
  if (this.status !== 'cancelled' && this.status !== 'postponed') {
    if (this.startDate > now) {
      this.status = 'upcoming';
    } else if (this.startDate <= now && this.endDate >= now) {
      this.status = 'ongoing';
    } else if (this.endDate < now) {
      this.status = 'completed';
    }
  }
  
  next();
});

// Populate organizer
eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'organizer',
    select: 'fullName email college avatar',
  });
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Check if user is registered (and not cancelled)
eventSchema.methods.isUserRegistered = function (userId) {
  return this.attendees.some(
    attendee => 
      attendee.user.toString() === userId.toString() && 
      attendee.status !== 'cancelled'  // Exclude cancelled registrations
  );
};

// Register user for event
eventSchema.methods.registerUser = function (userId) {
  if (this.isUserRegistered(userId)) {
    throw new Error('User is already registered for this event');
  }

  if (this.isRegistrationFull) {
    throw new Error('Event registration is full');
  }

  if (!this.isRegistrationOpen) {
    throw new Error('Event registration is closed');
  }

  // Check if user had previously cancelled registration
  const cancelledAttendee = this.attendees.find(
    attendee => 
      attendee.user.toString() === userId.toString() && 
      attendee.status === 'cancelled'
  );

  if (cancelledAttendee) {
    // Re-register: update existing cancelled entry
    cancelledAttendee.status = 'registered';
    cancelledAttendee.registeredAt = new Date();
    cancelledAttendee.paymentStatus = this.registrationFee.isFree ? 'completed' : 'pending';
  } else {
    // New registration: add to attendees
    this.attendees.push({
      user: userId,
      registeredAt: new Date(),
      status: 'registered',
      paymentStatus: this.registrationFee.isFree ? 'completed' : 'pending',
    });
  }

  return this.save();
};

// Cancel registration
eventSchema.methods.cancelRegistration = function (userId) {
  const attendee = this.attendees.find(
    att => att.user.toString() === userId.toString()
  );

  if (!attendee) {
    throw new Error('User is not registered for this event');
  }

  attendee.status = 'cancelled';
  return this.save();
};

// Mark attendance
eventSchema.methods.markAttendance = function (userId) {
  const attendee = this.attendees.find(
    att => att.user.toString() === userId.toString()
  );

  if (!attendee) {
    throw new Error('User is not registered for this event');
  }

  attendee.status = 'attended';
  return this.save();
};

// Increment views
eventSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Find upcoming events
eventSchema.statics.findUpcoming = function () {
  return this.find({
    status: 'upcoming',
    isPublished: true,
    startDate: { $gte: new Date() },
  }).sort('startDate');
};

// Find events by date range
eventSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    startDate: { $gte: startDate, $lte: endDate },
    isPublished: true,
  }).sort('startDate');
};

// Find events by type
eventSchema.statics.findByType = function (type) {
  return this.find({
    eventType: type,
    status: 'upcoming',
    isPublished: true,
  });
};

// Get trending events
eventSchema.statics.getTrending = function (limit = 10) {
  return this.aggregate([
    { $match: { status: 'upcoming', isPublished: true } },
    { $addFields: { attendeeCount: { $size: '$attendees' } } },
    { $sort: { attendeeCount: -1, views: -1 } },
    { $limit: limit },
  ]);
};

// Get event statistics
eventSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        avgAttendees: { $avg: { $size: '$attendees' } },
      },
    },
  ]);

  return stats;
};

const Event = mongoose.model('Event', eventSchema);

export default Event;
