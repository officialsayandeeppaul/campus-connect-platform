# 🚀 Campus Connect Platform - Backend API

Complete backend API for the Campus Connect Platform - A local internship and collaboration platform for students.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **AI Integration**: Google Gemini API
- **Email**: NodeMailer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # MongoDB connection
│   │   ├── cloudinary.js # Cloudinary setup
│   │   └── gemini.js     # Google Gemini AI
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Opportunity.js
│   │   ├── Collaboration.js
│   │   ├── Event.js
│   │   └── Message.js
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── opportunityController.js
│   │   ├── collaborationController.js
│   │   └── eventController.js
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── opportunity.routes.js
│   │   ├── collaboration.routes.js
│   │   └── event.routes.js
│   ├── middleware/       # Custom middleware
│   │   ├── auth.js       # JWT verification
│   │   ├── error.js      # Error handler
│   │   ├── upload.js     # File upload
│   │   └── validators/   # Request validation
│   ├── services/         # Business logic
│   │   ├── emailService.js
│   │   ├── aiService.js
│   │   └── uploadService.js
│   ├── utils/            # Helper functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   └── asyncHandler.js
│   └── database/         # Database utilities
│       ├── schema-generator.js
│       ├── migrate.js
│       └── seeders/
├── server.js             # Entry point
├── package.json
└── .env.example
```

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Environment Setup

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
```

### Step 3: Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Start MongoDB service
mongod

# Database will auto-create on first run
```

**Option B: MongoDB Atlas (Recommended)**
1. Go to https://cloud.mongodb.com/
2. Create free cluster (512MB)
3. Create database user
4. Whitelist IP (0.0.0.0/0 for development)
5. Get connection string
6. Update MONGODB_URI in .env

### Step 4: Generate Database Schema

```bash
npm run db:generate
```

This creates the schema file and shows you the MongoDB structure.

### Step 5: Seed Database (Optional)

```bash
npm run db:seed
```

Adds sample data for testing.

### Step 6: Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on: http://localhost:5000

## 📚 API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |
| POST | `/auth/forgot-password` | Request password reset |
| PUT | `/auth/reset-password/:token` | Reset password |

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users (with filters) |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update user profile |
| DELETE | `/users/:id` | Delete user |
| POST | `/users/upload-avatar` | Upload profile picture |

### Opportunity Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/opportunities` | Get all opportunities |
| GET | `/opportunities/:id` | Get opportunity by ID |
| POST | `/opportunities` | Create opportunity |
| PUT | `/opportunities/:id` | Update opportunity |
| DELETE | `/opportunities/:id` | Delete opportunity |
| POST | `/opportunities/:id/apply` | Apply to opportunity |

### Collaboration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/collaborations` | Get all collaboration requests |
| POST | `/collaborations` | Create collaboration request |
| PUT | `/collaborations/:id` | Update collaboration |
| DELETE | `/collaborations/:id` | Delete collaboration |
| POST | `/collaborations/:id/interest` | Express interest |

### Event Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | Get all events |
| POST | `/events` | Create event |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |
| POST | `/events/:id/rsvp` | RSVP to event |

## 🗄️ Database Schema

### Users Collection
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  college: String,
  year: Number,
  branch: String,
  skills: [String],
  bio: String,
  avatar: String (URL),
  resume: String (URL),
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String
  },
  role: String (student/admin),
  isVerified: Boolean,
  createdAt: Date
}
```

### Opportunities Collection
```javascript
{
  title: String,
  company: String,
  description: String,
  location: String,
  type: String (internship/job/freelance),
  duration: String,
  stipend: String,
  skillsRequired: [String],
  postedBy: ObjectId (User),
  applicants: [ObjectId],
  status: String (active/closed),
  deadline: Date,
  createdAt: Date
}
```

## 🚀 Deployment

### Deploy to Render.com (Free)

1. Push code to GitHub
2. Go to https://render.com/
3. New > Web Service
4. Connect GitHub repo
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables
7. Deploy!

### Deploy to Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

## 🔐 Security Features

- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ XSS protection
- ✅ MongoDB injection prevention
- ✅ Input validation

## 📧 Support

For issues or questions:
- Email: support@campusconnect.com
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

## 📄 License

MIT License - See LICENSE file for details
