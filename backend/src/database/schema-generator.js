import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Schema Generator
 * Generates SQL-like schema documentation from Mongoose models
 * This is for documentation purposes - MongoDB is schemaless
 */

const generateSchema = () => {
  const schemaDoc = `
# ============================================
# CAMPUS CONNECT PLATFORM - DATABASE SCHEMA
# ============================================
# Database: MongoDB (NoSQL)
# ODM: Mongoose
# Generated: ${new Date().toISOString()}
# ============================================

## OVERVIEW
This platform uses MongoDB as the database with Mongoose as the ODM.
MongoDB is a NoSQL database, so schemas are flexible and can evolve.

## COLLECTIONS

### 1. USERS COLLECTION
Collection Name: users
Description: Stores all user information (students, admins)

Fields:
- _id: ObjectId (Primary Key, Auto-generated)
- fullName: String (Required, Max: 100 chars)
- email: String (Required, Unique, Lowercase)
- password: String (Required, Hashed with bcrypt, Min: 6 chars)
- college: String (Required)
- year: Number (Required, Range: 1-5)
- branch: String (Required)
- rollNumber: String (Optional)
- bio: String (Optional, Max: 500 chars)
- skills: Array<String> (Default: [])
- interests: Array<String> (Default: [])
- avatar: String (URL, Default: placeholder)
- resume: String (URL, Optional)
- phone: String (Optional, 10 digits)
- location: Object
  - city: String
  - state: String
  - country: String (Default: "India")
- socialLinks: Object
  - linkedin: String (URL)
  - github: String (URL)
  - portfolio: String (URL)
  - twitter: String
- role: String (Enum: student/admin/moderator, Default: student)
- isVerified: Boolean (Default: false)
- isActive: Boolean (Default: true)
- profileCompleted: Boolean (Default: false)
- profileCompletionPercentage: Number (0-100)
- emailVerificationToken: String (Hashed)
- emailVerificationExpire: Date
- resetPasswordToken: String (Hashed)
- resetPasswordExpire: Date
- lastLogin: Date
- loginCount: Number (Default: 0)
- preferences: Object
  - emailNotifications: Boolean (Default: true)
  - opportunityAlerts: Boolean (Default: true)
  - collaborationRequests: Boolean (Default: true)
- stats: Object
  - opportunitiesApplied: Number (Default: 0)
  - collaborationsJoined: Number (Default: 0)
  - eventsAttended: Number (Default: 0)
- createdAt: Date (Auto-generated)
- updatedAt: Date (Auto-generated)

Indexes:
- email (Unique)
- college, year (Compound)
- skills
- createdAt

Virtual Fields:
- opportunities (Ref: Opportunity)
- collaborations (Ref: Collaboration)

---

### 2. OPPORTUNITIES COLLECTION
Collection Name: opportunities
Description: Stores internship, job, and freelance opportunities

Fields:
- _id: ObjectId (Primary Key)
- title: String (Required, Max: 200 chars)
- company: String (Required)
- companyLogo: String (URL, Default: placeholder)
- description: String (Required, Max: 2000 chars)
- type: String (Enum: internship/job/freelance/project/volunteer, Required)
- category: String (Enum: Software Development, Web Dev, etc., Required)
- mode: String (Enum: remote/onsite/hybrid, Default: remote)
- location: Object
  - city: String (Required)
  - state: String
  - country: String (Default: "India")
  - isLocal: Boolean (Default: true)
- duration: Object
  - value: Number
  - unit: String (Enum: days/weeks/months)
  - text: String
- startDate: Date
- deadline: Date (Required)
- stipend: Object
  - min: Number
  - max: Number
  - currency: String (Default: "INR")
  - isPaid: Boolean (Default: true)
  - text: String
- skillsRequired: Array<String> (Required, Min: 1)
- eligibility: Object
  - minYear: Number (1-5)
  - maxYear: Number (1-5)
  - branches: Array<String>
  - minCGPA: Number
- experienceRequired: String (Enum: fresher/beginner/intermediate/advanced)
- applicationUrl: String (URL)
- applicationEmail: String (Email)
- applicationProcess: String (Max: 1000 chars)
- applicants: Array<Object>
  - user: ObjectId (Ref: User)
  - appliedAt: Date
  - status: String (Enum: pending/shortlisted/rejected/selected)
  - coverLetter: String
  - resumeUrl: String
- postedBy: ObjectId (Ref: User, Required)
- companyContact: Object
  - name: String
  - email: String
  - phone: String
- status: String (Enum: active/closed/draft/expired, Default: active)
- isVerified: Boolean (Default: false)
- isFeatured: Boolean (Default: false)
- views: Number (Default: 0)
- saves: Array<ObjectId> (Ref: User)
- benefits: Array<String>
- tags: Array<String>
- attachments: Array<Object>
- createdAt: Date
- updatedAt: Date

Indexes:
- title, description, company (Text search)
- type, status (Compound)
- location.city
- skillsRequired
- deadline
- createdAt
- postedBy

Virtual Fields:
- applicantCount
- isExpired
- daysRemaining

---

### 3. COLLABORATIONS COLLECTION
Collection Name: collaborations
Description: Stores project collaboration requests

Fields:
- _id: ObjectId (Primary Key)
- title: String (Required, Max: 200 chars)
- description: String (Required, Max: 2000 chars)
- projectType: String (Enum: hackathon/research/startup/etc., Required)
- skillsNeeded: Array<String> (Required, Min: 1)
- rolesNeeded: Array<Object>
  - role: String (Required)
  - count: Number (Default: 1)
  - description: String
  - filled: Boolean (Default: false)
- teamSize: Object
  - current: Number (Default: 1)
  - required: Number (Required, Min: 2, Max: 20)
- duration: Object
  - value: Number
  - unit: String (Enum: days/weeks/months)
  - text: String
- startDate: Date
- deadline: Date
- category: String (Enum: Web Dev, AI/ML, etc., Required)
- techStack: Array<String>
- goals: Array<String>
- expectedOutcome: String (Max: 500 chars)
- createdBy: ObjectId (Ref: User, Required)
- teamMembers: Array<Object>
  - user: ObjectId (Ref: User)
  - role: String
  - joinedAt: Date
  - status: String (Enum: active/inactive/left)
- interestedUsers: Array<Object>
  - user: ObjectId (Ref: User)
  - message: String
  - appliedAt: Date
  - status: String (Enum: pending/accepted/rejected)
- status: String (Enum: open/in-progress/completed/cancelled/on-hold)
- isActive: Boolean (Default: true)
- visibility: String (Enum: public/college-only/private)
- communicationChannels: Object
  - slack: String
  - discord: String
  - whatsapp: String
  - telegram: String
  - email: String
- meetingSchedule: Object
  - frequency: String (Enum: daily/weekly/etc.)
  - preferredTime: String
- repository: String (URL)
- documentation: String (URL)
- attachments: Array<Object>
- views: Number (Default: 0)
- saves: Array<ObjectId> (Ref: User)
- tags: Array<String>
- isRemote: Boolean (Default: true)
- location: Object
  - city: String
  - state: String
- rewards: String (Max: 500 chars)
- createdAt: Date
- updatedAt: Date

Indexes:
- title, description (Text search)
- projectType, status (Compound)
- skillsNeeded
- category
- createdAt
- createdBy

Virtual Fields:
- interestCount
- isTeamFull
- spotsRemaining

---

### 4. EVENTS COLLECTION
Collection Name: events
Description: Stores campus events, workshops, webinars

Fields:
- _id: ObjectId (Primary Key)
- title: String (Required, Max: 200 chars)
- description: String (Required, Max: 2000 chars)
- eventType: String (Enum: workshop/seminar/hackathon/etc., Required)
- category: String (Enum: Technical/Career/etc., Required)
- startDate: Date (Required)
- endDate: Date (Required)
- startTime: String (Required)
- endTime: String (Required)
- timezone: String (Default: "Asia/Kolkata")
- mode: String (Enum: online/offline/hybrid, Required)
- venue: Object
  - name: String
  - address: String
  - city: String
  - state: String
  - pincode: String
  - mapLink: String
- onlineLink: String (URL)
- meetingPlatform: String (Enum: zoom/google-meet/etc.)
- organizer: ObjectId (Ref: User, Required)
- organizingBody: Object
  - name: String
  - type: String (Enum: college/club/company/etc.)
  - logo: String
  - contact: Object
- speakers: Array<Object>
  - name: String (Required)
  - designation: String
  - company: String
  - bio: String
  - photo: String
  - socialLinks: Object
- registrationRequired: Boolean (Default: true)
- registrationDeadline: Date
- registrationLink: String (URL)
- maxAttendees: Number
- registrationFee: Object
  - amount: Number (Default: 0)
  - currency: String (Default: "INR")
  - isFree: Boolean (Default: true)
- attendees: Array<Object>
  - user: ObjectId (Ref: User)
  - registeredAt: Date
  - status: String (Enum: registered/attended/cancelled/no-show)
  - paymentStatus: String (Enum: pending/completed/failed/refunded)
- eligibility: Object
  - openToAll: Boolean (Default: true)
  - colleges: Array<String>
  - years: Array<Number>
  - branches: Array<String>
- agenda: Array<Object>
  - time: String
  - title: String
  - description: String
  - speaker: String
- topics: Array<String>
- prerequisites: Array<String>
- learningOutcomes: Array<String>
- poster: String (URL)
- banner: String (URL)
- attachments: Array<Object>
- recordingUrl: String (URL)
- materialsUrl: String (URL)
- benefits: Array<String>
- certificateProvided: Boolean (Default: false)
- prizes: String (Max: 500 chars)
- status: String (Enum: upcoming/ongoing/completed/cancelled/postponed)
- isPublished: Boolean (Default: false)
- isFeatured: Boolean (Default: false)
- visibility: String (Enum: public/college-only/private)
- views: Number (Default: 0)
- interested: Array<ObjectId> (Ref: User)
- shares: Number (Default: 0)
- tags: Array<String>
- socialMediaLinks: Object
- hashtags: Array<String>
- createdAt: Date
- updatedAt: Date

Indexes:
- title, description (Text search)
- eventType, status (Compound)
- startDate
- venue.city
- category
- createdAt
- organizer

Virtual Fields:
- attendeeCount
- isRegistrationFull
- spotsRemaining
- isRegistrationOpen
- durationInHours

---

### 5. MESSAGES COLLECTION
Collection Name: messages
Description: Stores direct messages between users

Fields:
- _id: ObjectId (Primary Key)
- sender: ObjectId (Ref: User, Required)
- receiver: ObjectId (Ref: User, Required)
- content: String (Required, Max: 2000 chars)
- messageType: String (Enum: text/image/file/link, Default: text)
- attachments: Array<Object>
  - name: String
  - url: String
  - type: String
  - size: Number
- isRead: Boolean (Default: false)
- readAt: Date
- isDeleted: Boolean (Default: false)
- deletedBy: Array<ObjectId> (Ref: User)
- relatedTo: Object
  - type: String (Enum: opportunity/collaboration/event/general)
  - id: ObjectId
- createdAt: Date
- updatedAt: Date

Indexes:
- sender, receiver (Compound)
- receiver, isRead (Compound)
- createdAt

---

## RELATIONSHIPS

### One-to-Many Relationships:
1. User → Opportunities (One user can post many opportunities)
2. User → Collaborations (One user can create many collaborations)
3. User → Events (One user can organize many events)
4. User → Messages (One user can send many messages)

### Many-to-Many Relationships:
1. Users ↔ Opportunities (Users can apply to many opportunities)
2. Users ↔ Collaborations (Users can join many collaborations)
3. Users ↔ Events (Users can attend many events)
4. Users ↔ Users (Users can message each other)

---

## MONGODB SETUP INSTRUCTIONS

### Option 1: Local MongoDB

1. Install MongoDB:
   - Windows: Download from mongodb.com
   - Mac: brew install mongodb-community
   - Linux: sudo apt-get install mongodb

2. Start MongoDB:
   mongod

3. Update .env:
   MONGODB_URI=mongodb://localhost:27017/campus-connect

### Option 2: MongoDB Atlas (Recommended - Free 512MB)

1. Go to: https://cloud.mongodb.com/
2. Create account (free)
3. Create New Cluster:
   - Choose FREE tier (M0)
   - Select region closest to you
   - Cluster name: campus-connect

4. Create Database User:
   - Security → Database Access
   - Add New Database User
   - Username: campus_admin
   - Password: [Generate secure password]
   - Role: Read and write to any database

5. Whitelist IP:
   - Security → Network Access
   - Add IP Address
   - Allow Access from Anywhere: 0.0.0.0/0 (for development)

6. Get Connection String:
   - Databases → Connect
   - Connect your application
   - Copy connection string
   - Replace <password> with your password
   - Replace <dbname> with: campus-connect

7. Update .env:
   MONGODB_URI_PROD=mongodb+srv://campus_admin:<password>@cluster.mongodb.net/campus-connect

---

## RUNNING MIGRATIONS

The models will auto-create collections when you first insert data.
No manual migration needed for MongoDB!

To seed sample data:
npm run db:seed

To reset database:
npm run db:reset

---

## BACKUP & RESTORE

### Backup:
mongodump --uri="your-mongodb-uri" --out=./backup

### Restore:
mongorestore --uri="your-mongodb-uri" ./backup

---

## MONITORING

### MongoDB Atlas Dashboard:
- Real-time performance metrics
- Query performance insights
- Storage usage
- Connection monitoring

### Mongoose Debug Mode:
Add to your code:
mongoose.set('debug', true);

---

Schema generated successfully!
Check: backend/src/models/ for actual Mongoose schemas
`;

  // Write schema to file
  const outputPath = path.join(__dirname, 'SCHEMA.md');
  fs.writeFileSync(outputPath, schemaDoc);

  console.log('');
  console.log('✅ ============================================');
  console.log('📄 Database Schema Generated Successfully!');
  console.log('✅ ============================================');
  console.log(`📁 Location: ${outputPath}`);
  console.log('');
  console.log('📚 Schema includes:');
  console.log('  ✓ 5 Collections (Users, Opportunities, Collaborations, Events, Messages)');
  console.log('  ✓ Field definitions with types and constraints');
  console.log('  ✓ Indexes for performance');
  console.log('  ✓ Relationships between collections');
  console.log('  ✓ MongoDB setup instructions');
  console.log('  ✓ Atlas configuration guide');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('  1. Read SCHEMA.md for complete database structure');
  console.log('  2. Set up MongoDB Atlas (free 512MB)');
  console.log('  3. Update .env with your MongoDB URI');
  console.log('  4. Run: npm run dev');
  console.log('');
  console.log('💡 Models are in: backend/src/models/');
  console.log('✅ ============================================');
  console.log('');
};

// Run the generator
generateSchema();

export default generateSchema;
