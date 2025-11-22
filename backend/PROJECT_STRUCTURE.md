# 📁 CAMPUS CONNECT BACKEND - PROJECT STRUCTURE

## Complete Folder & File Organization

```
backend/
│
├── 📄 server.js                    # Main entry point - Express server setup
├── 📄 package.json                 # Dependencies and scripts
├── 📄 .env.example                 # Environment variables template
├── 📄 .env                         # Your actual environment variables (gitignored)
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .eslintrc.json              # ESLint configuration
├── 📄 .prettierrc.json            # Prettier configuration
├── 📄 README.md                    # Project documentation
├── 📄 SETUP_GUIDE.md              # Complete setup instructions
├── 📄 PROJECT_STRUCTURE.md        # This file
│
├── 📁 src/                         # Source code directory
│   │
│   ├── 📁 config/                  # Configuration files
│   │   ├── database.js            # MongoDB connection setup
│   │   ├── cloudinary.js          # Cloudinary file storage config
│   │   └── gemini.js              # Google Gemini AI configuration
│   │
│   ├── 📁 models/                  # Mongoose data models (Database schemas)
│   │   ├── User.js                # User model (students, admins)
│   │   ├── Opportunity.js         # Internship/job opportunities model
│   │   ├── Collaboration.js       # Project collaboration model
│   │   ├── Event.js               # Campus events model
│   │   └── Message.js             # Direct messaging model
│   │
│   ├── 📁 controllers/             # Business logic for routes
│   │   ├── authController.js      # Authentication logic (login, register, etc.)
│   │   ├── userController.js      # User CRUD operations
│   │   ├── opportunityController.js  # Opportunity management
│   │   ├── collaborationController.js # Collaboration management
│   │   ├── eventController.js     # Event management
│   │   └── messageController.js   # Messaging logic
│   │
│   ├── 📁 routes/                  # API route definitions
│   │   ├── auth.routes.js         # /api/v1/auth/* routes
│   │   ├── user.routes.js         # /api/v1/users/* routes
│   │   ├── opportunity.routes.js  # /api/v1/opportunities/* routes
│   │   ├── collaboration.routes.js # /api/v1/collaborations/* routes
│   │   ├── event.routes.js        # /api/v1/events/* routes
│   │   └── message.routes.js      # /api/v1/messages/* routes
│   │
│   ├── 📁 middleware/              # Custom middleware functions
│   │   ├── auth.js                # JWT authentication & authorization
│   │   ├── error.js               # Global error handler
│   │   ├── upload.js              # File upload handling (Multer)
│   │   └── validators/            # Request validation middleware
│   │       ├── authValidator.js   # Validate auth requests
│   │       ├── userValidator.js   # Validate user requests
│   │       └── opportunityValidator.js # Validate opportunity requests
│   │
│   ├── 📁 services/                # External service integrations
│   │   ├── emailService.js        # Email sending (NodeMailer)
│   │   ├── aiService.js           # AI operations (Gemini)
│   │   ├── uploadService.js       # File upload to Cloudinary
│   │   └── notificationService.js # Push notifications
│   │
│   ├── 📁 utils/                   # Helper utilities
│   │   ├── ApiError.js            # Custom error class
│   │   ├── ApiResponse.js         # Standardized response format
│   │   ├── asyncHandler.js        # Async error wrapper
│   │   ├── logger.js              # Logging utility
│   │   └── helpers.js             # Common helper functions
│   │
│   └── 📁 database/                # Database utilities
│       ├── schema-generator.js    # Generate schema documentation
│       ├── migrate.js             # Database migrations
│       ├── reset.js               # Reset database
│       ├── SCHEMA.md              # Generated schema documentation
│       └── seeders/               # Sample data seeders
│           └── index.js           # Main seeder script
│
├── 📁 uploads/                     # Temporary upload directory (gitignored)
├── 📁 logs/                        # Application logs (gitignored)
└── 📁 tests/                       # Test files (future)
    ├── unit/                      # Unit tests
    └── integration/               # Integration tests
```

---

## 📋 File Descriptions

### Root Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `server.js` | Main application entry point | Rarely - only for major changes |
| `package.json` | Dependencies and npm scripts | When adding new packages |
| `.env` | Environment variables | During setup and deployment |
| `.env.example` | Template for environment variables | When adding new env vars |
| `.gitignore` | Files to ignore in Git | When adding new ignored patterns |
| `README.md` | Project documentation | Keep updated with changes |
| `SETUP_GUIDE.md` | Setup instructions | Reference during setup |

---

### src/config/ - Configuration Files

| File | Purpose | What It Does |
|------|---------|--------------|
| `database.js` | MongoDB connection | Connects to MongoDB Atlas or local |
| `cloudinary.js` | File storage setup | Configures Cloudinary for uploads |
| `gemini.js` | AI integration | Sets up Google Gemini AI API |

**When to edit:** During initial setup or when changing services

---

### src/models/ - Database Models

| File | Collections | Key Features |
|------|-------------|--------------|
| `User.js` | users | Authentication, profiles, skills |
| `Opportunity.js` | opportunities | Internships, jobs, applications |
| `Collaboration.js` | collaborations | Project teams, collaboration requests |
| `Event.js` | events | Workshops, hackathons, registrations |
| `Message.js` | messages | Direct messaging between users |

**Key Concepts:**
- **Schema Definition:** Defines data structure
- **Validation:** Built-in data validation
- **Middleware:** Pre/post save hooks
- **Methods:** Instance and static methods
- **Virtuals:** Computed fields
- **Indexes:** For query performance

---

### src/controllers/ - Business Logic

| File | Handles | Example Functions |
|------|---------|-------------------|
| `authController.js` | Authentication | register, login, logout, forgotPassword |
| `userController.js` | User operations | getUsers, getUserById, updateUser, deleteUser |
| `opportunityController.js` | Opportunities | createOpportunity, getOpportunities, applyToOpportunity |
| `collaborationController.js` | Collaborations | createCollaboration, expressInterest, acceptMember |
| `eventController.js` | Events | createEvent, getEvents, registerForEvent |

**Pattern:**
```javascript
export const functionName = asyncHandler(async (req, res) => {
  // 1. Extract data from req.body, req.params, req.query
  // 2. Validate data
  // 3. Perform database operations
  // 4. Send response
});
```

---

### src/routes/ - API Endpoints

| File | Base Path | Defines Routes For |
|------|-----------|-------------------|
| `auth.routes.js` | `/api/v1/auth` | Login, register, password reset |
| `user.routes.js` | `/api/v1/users` | User CRUD operations |
| `opportunity.routes.js` | `/api/v1/opportunities` | Opportunity management |
| `collaboration.routes.js` | `/api/v1/collaborations` | Collaboration management |
| `event.routes.js` | `/api/v1/events` | Event management |

**Pattern:**
```javascript
import express from 'express';
import { protect } from '../middleware/auth.js';
import { getItems, createItem } from '../controllers/controller.js';

const router = express.Router();

router.route('/')
  .get(getItems)              // Public
  .post(protect, createItem); // Protected

export default router;
```

---

### src/middleware/ - Middleware Functions

| File | Purpose | Used For |
|------|---------|----------|
| `auth.js` | Authentication | Verify JWT, check permissions |
| `error.js` | Error handling | Catch and format errors |
| `upload.js` | File uploads | Handle multipart form data |
| `validators/` | Input validation | Validate request data |

**Common Middleware:**
- `protect` - Requires authentication
- `authorize('admin')` - Requires specific role
- `uploadSingle('avatar')` - Handle single file upload
- `validateRequest` - Validate input data

---

### src/services/ - External Services

| File | Service | Purpose |
|------|---------|---------|
| `emailService.js` | NodeMailer | Send emails (verification, notifications) |
| `aiService.js` | Google Gemini | AI features (resume parsing, recommendations) |
| `uploadService.js` | Cloudinary | Upload images and files |
| `notificationService.js` | Push Notifications | Send push notifications |

**Usage:**
```javascript
import { sendEmail } from '../services/emailService.js';

await sendEmail({
  to: user.email,
  subject: 'Welcome!',
  text: 'Welcome to Campus Connect'
});
```

---

### src/utils/ - Helper Utilities

| File | Purpose | Usage |
|------|---------|-------|
| `ApiError.js` | Custom errors | `throw ApiError.badRequest('Invalid data')` |
| `ApiResponse.js` | Standard responses | `sendSuccess(res, data, 'Success')` |
| `asyncHandler.js` | Async wrapper | Wraps async functions to catch errors |

---

### src/database/ - Database Utilities

| File | Purpose | Command |
|------|---------|---------|
| `schema-generator.js` | Generate schema docs | `npm run db:generate` |
| `seeders/index.js` | Add sample data | `npm run db:seed` |
| `reset.js` | Clear database | `npm run db:reset` |
| `SCHEMA.md` | Schema documentation | Auto-generated |

---

## 🔄 Request Flow

### Example: User Registration

```
1. Client Request
   POST /api/v1/auth/register
   Body: { fullName, email, password, college, year, branch }
   
2. Express Router (auth.routes.js)
   Matches route → Calls authController.register
   
3. Middleware (if any)
   - Validates request data
   - Checks for duplicates
   
4. Controller (authController.js)
   - Extracts data from req.body
   - Creates user in database
   - Generates JWT token
   
5. Model (User.js)
   - Validates data against schema
   - Hashes password (pre-save hook)
   - Saves to MongoDB
   
6. Response
   {
     "success": true,
     "data": { user, token },
     "message": "User registered successfully"
   }
```

---

## 🎯 Where to Add New Features

### Adding a New Model
1. Create file in `src/models/`
2. Define schema with Mongoose
3. Add validation, methods, virtuals
4. Export model

### Adding a New API Endpoint
1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Add middleware if needed
4. Import routes in `server.js`

### Adding a New Service
1. Create file in `src/services/`
2. Implement service functions
3. Export functions
4. Use in controllers

---

## 📊 Database Collections

| Collection | Documents | Purpose |
|------------|-----------|---------|
| `users` | User profiles | Store all user data |
| `opportunities` | Job/internship listings | Opportunity board |
| `collaborations` | Project collaborations | Find team members |
| `events` | Campus events | Event management |
| `messages` | Direct messages | User-to-user chat |

---

## 🔐 Security Layers

1. **Environment Variables** - Sensitive data in .env
2. **JWT Authentication** - Token-based auth
3. **Password Hashing** - Bcrypt with salt
4. **Input Validation** - Express Validator
5. **Rate Limiting** - Prevent abuse
6. **CORS** - Cross-origin protection
7. **Helmet** - Security headers
8. **XSS Protection** - Prevent XSS attacks
9. **MongoDB Injection** - Sanitize inputs

---

## 📝 Naming Conventions

### Files
- **Models:** PascalCase (User.js, Opportunity.js)
- **Controllers:** camelCase + Controller (authController.js)
- **Routes:** camelCase + .routes (auth.routes.js)
- **Services:** camelCase + Service (emailService.js)
- **Utils:** camelCase (asyncHandler.js)

### Functions
- **Controllers:** camelCase (getUsers, createUser)
- **Models:** camelCase methods (comparePassword, generateToken)
- **Routes:** HTTP verb + resource (GET /users, POST /opportunities)

### Variables
- **Constants:** UPPER_SNAKE_CASE (JWT_SECRET, PORT)
- **Regular:** camelCase (userData, userId)
- **Private:** _camelCase (_privateFunction)

---

## 🚀 npm Scripts

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm start` | Start production server | In production |
| `npm run dev` | Start with nodemon | During development |
| `npm run db:generate` | Generate schema docs | After model changes |
| `npm run db:seed` | Add sample data | For testing |
| `npm run db:reset` | Clear database | Fresh start |
| `npm test` | Run tests | Before deployment |
| `npm run lint` | Check code style | Before commit |

---

## 📚 Learning Resources

### Mongoose (MongoDB ODM)
- Docs: https://mongoosejs.com/docs/guide.html
- Learn: Schema, Models, Queries, Middleware

### Express.js (Web Framework)
- Docs: https://expressjs.com/
- Learn: Routing, Middleware, Error Handling

### JWT (Authentication)
- Docs: https://jwt.io/
- Learn: Token generation, verification

### Cloudinary (File Storage)
- Docs: https://cloudinary.com/documentation
- Learn: Upload, transformation, optimization

---

## 🎉 You're All Set!

This structure provides:
✅ Clear separation of concerns
✅ Scalable architecture
✅ Easy to maintain
✅ Industry best practices
✅ Ready for production

**Next:** Start building your controllers and routes!
