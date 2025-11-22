# 🧪 API TESTING GUIDE - Campus Connect Backend

## Complete guide to test all API endpoints

---

## 🚀 Quick Start

### 1. Start Server
```bash
cd backend
npm run dev
```

Server runs on: **http://localhost:5000**

### 2. Install Thunder Client (VS Code)
1. Open VS Code Extensions (Ctrl+Shift+X)
2. Search "Thunder Client"
3. Click Install

---

## 📝 Authentication Endpoints

### Base URL: `http://localhost:5000/api/v1/auth`

### 1. Register User ✅
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "college": "Asansol Engineering College",
  "year": 3,
  "branch": "Computer Science",
  "phone": "9876543210",
  "skills": ["JavaScript", "React", "Node.js"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "...",
      "fullName": "John Doe",
      "email": "john@example.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token!** You'll need it for protected routes.

---

### 2. Login User ✅
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User ✅
```http
GET /api/v1/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### 4. Update Profile Details ✅
```http
PUT /api/v1/auth/update-details
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "fullName": "John Updated",
  "bio": "Passionate developer",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe"
  }
}
```

---

### 5. Update Password ✅
```http
PUT /api/v1/auth/update-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

---

### 6. Forgot Password ✅
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

---

### 7. Reset Password ✅
```http
PUT /api/v1/auth/reset-password/RESET_TOKEN_FROM_EMAIL
Content-Type: application/json

{
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

---

### 8. Logout ✅
```http
POST /api/v1/auth/logout
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 9. Delete Account ✅
```http
DELETE /api/v1/auth/delete-account
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "password": "password123"
}
```

---

## 👥 User Endpoints

### Base URL: `http://localhost:5000/api/v1/users`

### 1. Get All Users ✅
```http
GET /api/v1/users
```

**With Filters:**
```http
GET /api/v1/users?page=1&limit=10&college=Asansol&year=3&skills=JavaScript,React
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `college` - Filter by college name
- `year` - Filter by year (1-5)
- `skills` - Comma-separated skills
- `search` - Search by name, email, or college

---

### 2. Get User by ID ✅
```http
GET /api/v1/users/USER_ID_HERE
```

---

### 3. Search Users by Skills ✅
```http
GET /api/v1/users/search/skills?skills=JavaScript,React,Node.js
```

---

### 4. Get Users by College ✅
```http
GET /api/v1/users/college/Asansol?page=1&limit=10
```

---

### 5. Get Recommended Users ✅
```http
GET /api/v1/users/me/recommendations
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 6. Update User Profile ✅
```http
PUT /api/v1/users/USER_ID_HERE
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "bio": "Updated bio",
  "skills": ["JavaScript", "React", "Node.js"],
  "location": {
    "city": "Asansol",
    "state": "West Bengal"
  }
}
```

---

### 7. Upload Avatar ✅
```http
POST /api/v1/users/upload-avatar
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

avatar: [SELECT FILE]
```

**In Thunder Client:**
1. Select "Form" tab
2. Add field: `avatar` (type: File)
3. Choose image file

---

### 8. Upload Resume ✅
```http
POST /api/v1/users/upload-resume
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: multipart/form-data

resume: [SELECT FILE]
```

---

### 9. Get User Statistics (Admin) ✅
```http
GET /api/v1/users/admin/stats
Authorization: Bearer ADMIN_TOKEN_HERE
```

---

### 10. Delete User (Admin) ✅
```http
DELETE /api/v1/users/USER_ID_HERE
Authorization: Bearer ADMIN_TOKEN_HERE
```

---

## 🔐 Authentication Headers

For all **protected routes**, add this header:

```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**In Thunder Client:**
1. Go to "Auth" tab
2. Select "Bearer"
3. Paste your token

---

## 🧪 Testing Flow

### Complete User Journey:

#### 1. Register New User
```http
POST /api/v1/auth/register
```
✅ Save the token

#### 2. Login (if needed)
```http
POST /api/v1/auth/login
```
✅ Get fresh token

#### 3. Get Your Profile
```http
GET /api/v1/auth/me
Authorization: Bearer TOKEN
```

#### 4. Update Profile
```http
PUT /api/v1/auth/update-details
Authorization: Bearer TOKEN
```

#### 5. Upload Avatar
```http
POST /api/v1/users/upload-avatar
Authorization: Bearer TOKEN
```

#### 6. Search Other Users
```http
GET /api/v1/users?skills=JavaScript
```

#### 7. Get Recommendations
```http
GET /api/v1/users/me/recommendations
Authorization: Bearer TOKEN
```

---

## ✅ Expected Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (create) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (email exists) |
| 500 | Server Error | Something went wrong |

---

## 🐛 Common Errors & Solutions

### Error: "User with this email already exists"
**Solution:** Use a different email or login with existing account

### Error: "Invalid token"
**Solution:** 
1. Login again to get fresh token
2. Make sure token is in Authorization header
3. Format: `Bearer YOUR_TOKEN`

### Error: "Not authorized to access this route"
**Solution:** Add Authorization header with valid token

### Error: "Validation failed"
**Solution:** Check request body matches required format

### Error: "Cannot connect to database"
**Solution:** 
1. Check MongoDB is running
2. Verify MONGODB_URI in .env
3. Check internet connection (if using Atlas)

---

## 📊 Response Format

All responses follow this format:

### Success Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message here",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🎯 Testing Checklist

### Authentication ✅
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user profile
- [ ] Update profile details
- [ ] Update password
- [ ] Forgot password
- [ ] Logout
- [ ] Try accessing protected route without token (should fail)

### Users ✅
- [ ] Get all users
- [ ] Get user by ID
- [ ] Search users by skills
- [ ] Get users by college
- [ ] Get recommendations
- [ ] Update own profile
- [ ] Upload avatar
- [ ] Upload resume
- [ ] Try updating another user's profile (should fail)

---

## 💡 Pro Tips

### 1. Save Tokens
Create environment variables in Thunder Client:
- `AUTH_TOKEN` = your JWT token
- `BASE_URL` = http://localhost:5000/api/v1

### 2. Use Collections
Organize requests in Thunder Client collections:
- Auth Collection
- User Collection
- Opportunity Collection (coming next)

### 3. Test Error Cases
Don't just test happy paths:
- Try invalid data
- Try without authentication
- Try with expired tokens
- Try accessing other users' data

### 4. Check Console Logs
Watch the server console for:
- Request logs
- Error messages
- Database queries

---

## 🚀 Next Steps

After testing Auth & Users:
1. Test Opportunity endpoints (coming next)
2. Test Collaboration endpoints
3. Test Event endpoints
4. Test Message endpoints

---

## 📞 Need Help?

### Check:
1. Server is running (`npm run dev`)
2. MongoDB is connected (check console)
3. Token is valid and in Authorization header
4. Request body matches expected format
5. Content-Type header is set correctly

### Common Issues:
- **401 Unauthorized**: Add/refresh token
- **400 Bad Request**: Check request body
- **404 Not Found**: Check URL and route
- **500 Server Error**: Check server console logs

---

**Happy Testing! 🧪✨**

Your Auth and User APIs are now fully functional and ready to test!
