# User Authentication Setup Guide

This guide explains how to set up user authentication with email OTP verification for the HomeLine Teams application.

## Features Implemented

### Backend Features
1. **User Registration with Email OTP**
   - Users register with name, email, phone, and password
   - Email verification via OTP sent to registered email
   - Password hashing with bcrypt
   - JWT token-based authentication

2. **User Authentication**
   - Login with email and password
   - JWT token generation and validation
   - Cookie-based session management
   - Password reset functionality

3. **User Profile Management**
   - Update profile information
   - Manage multiple addresses
   - Set default address
   - User preferences (newsletter, notifications)

4. **Order Management**
   - Orders linked to user accounts
   - Guest checkout still supported
   - User-specific order history

### Frontend Features
1. **Authentication UI**
   - Registration form with email OTP verification
   - Login form
   - Forgot password functionality
   - User profile management modal

2. **User Experience**
   - Auto-populate checkout form with user data
   - "My Orders" page for order history
   - User profile with address management
   - Responsive design for mobile and desktop

## Setup Instructions

### 1. Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install nodemailer
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory with:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/homelineteams

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here

   # Email Configuration (for OTP and notifications)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Origins (comma-separated)
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. **Email Setup (Gmail)**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password:
     - Go to Google Account settings
     - Security → 2-Step Verification → App passwords
     - Generate a password for "Mail"
     - Use this password as `EMAIL_PASS`

4. **Start Backend Server**
   ```bash
   npm start
   ```

### 2. Frontend Setup

1. **Install Dependencies** (if not already installed)
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### User Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/verify-email` - Verify email with OTP
- `POST /api/users/resend-email-otp` - Resend verification OTP
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with token

### User Profile
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `POST /api/users/addresses` - Add new address (protected)
- `PUT /api/users/addresses/:id` - Update address (protected)
- `DELETE /api/users/addresses/:id` - Delete address (protected)

### Orders
- `GET /api/orders/user/:userId` - Get user orders (protected)
- `POST /api/orders` - Create order (supports both guest and user)

## Usage

### For Users

1. **Registration**
   - Click "Sign In" button in navbar
   - Select "Create Account"
   - Fill in registration form
   - Check email for OTP
   - Enter OTP to verify email
   - User is automatically logged in

2. **Login**
   - Click "Sign In" button in navbar
   - Enter email and password
   - User is logged in and redirected

3. **Profile Management**
   - Click on user name in navbar
   - Update profile information
   - Manage addresses
   - Set preferences

4. **Order History**
   - Click "My Orders" in navbar
   - View all past orders
   - Track order status

### For Developers

1. **User Context**
   ```jsx
   import { useUser } from '@/contexts/UserContext';
   
   const { user, isAuthenticated, login, logout } = useUser();
   ```

2. **API Service**
   ```javascript
   import api from '@/services/api';
   
   // Register user
   const result = await api.registerUser(userData);
   
   // Login user
   const result = await api.loginUser(credentials);
   
   // Get user profile
   const profile = await api.getUserProfile();
   ```

## Security Features

1. **Password Security**
   - Passwords are hashed using bcrypt
   - Minimum 6 characters required
   - Password reset via email token

2. **JWT Authentication**
   - Secure token-based authentication
   - Token expiration (7 days)
   - Cookie and header-based token support

3. **Email Verification**
   - OTP-based email verification
   - 10-minute OTP expiration
   - Resend OTP functionality

4. **Input Validation**
   - Email format validation
   - Phone number validation
   - Required field validation

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check EMAIL_USER and EMAIL_PASS in .env
   - Ensure Gmail App Password is correct
   - Check Gmail 2FA is enabled

2. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure cookies are enabled

3. **Database Issues**
   - Verify MONGODB_URI is correct
   - Check MongoDB is running
   - Ensure database connection

### Testing

1. **Test Registration Flow**
   - Register with valid email
   - Check email for OTP
   - Verify email with OTP
   - Login with credentials

2. **Test Order Flow**
   - Add items to cart
   - Proceed to checkout
   - Login or checkout as guest
   - Complete order
   - Check "My Orders" page

## Next Steps

1. **Email Templates**
   - Customize email templates
   - Add branding to emails
   - Implement email queue system

2. **SMS Integration**
   - Add SMS OTP for phone verification
   - Integrate with SMS service provider

3. **Social Login**
   - Add Google/Facebook login
   - Implement OAuth integration

4. **Advanced Features**
   - Two-factor authentication
   - Account verification
   - User roles and permissions


