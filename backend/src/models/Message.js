import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // Sender & Receiver
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
    },

    // Message Content
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'link'],
      default: 'text',
    },

    // Attachments (if any)
    attachments: [
      {
        name: String,
        url: String,
        type: String, // image, pdf, etc.
        size: Number, // in bytes
      },
    ],

    // Message Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Context (optional - for linking to opportunities/collaborations)
    relatedTo: {
      type: {
        type: String,
        enum: ['opportunity', 'collaboration', 'event', 'general'],
        default: 'general',
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedTo.type',
      },
    },
  },
  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

// ============================================
// MIDDLEWARE
// ============================================

// Populate sender and receiver
messageSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'sender',
    select: 'fullName email avatar',
  }).populate({
    path: 'receiver',
    select: 'fullName email avatar',
  });
  next();
});

// ============================================
// INSTANCE METHODS
// ============================================

// Mark message as read
messageSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Delete message for user
messageSchema.methods.deleteForUser = function (userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);
  }
  
  // If both users deleted, mark as deleted
  if (this.deletedBy.length >= 2) {
    this.isDeleted = true;
  }
  
  return this.save();
};

// ============================================
// STATIC METHODS
// ============================================

// Get conversation between two users
messageSchema.statics.getConversation = function (user1Id, user2Id, limit = 50) {
  return this.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
    deletedBy: { $nin: [user1Id] },
  })
    .sort('-createdAt')
    .limit(limit);
};

// Get unread count for user
messageSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({
    receiver: userId,
    isRead: false,
    deletedBy: { $nin: [userId] },
  });
};

// Get all conversations for user
messageSchema.statics.getUserConversations = async function (userId) {
  // Convert userId to ObjectId if it's a string
  const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  
  const conversations = await this.aggregate([
    {
      $match: {
        $or: [{ sender: userObjectId }, { receiver: userObjectId }],
        deletedBy: { $nin: [userObjectId] },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', userObjectId] },
            '$receiver',
            '$sender',
          ],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', userObjectId] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        user: {
          _id: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
        },
        lastMessage: 1,
        unreadCount: 1,
      },
    },
    {
      $sort: { 'lastMessage.createdAt': -1 },
    },
  ]);

  return conversations;
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
