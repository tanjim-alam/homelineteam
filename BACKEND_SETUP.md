# Backend Server Setup Guide

## 🚀 Quick Start

### Option 1: Using the provided scripts
- **Windows**: Double-click `start-backend.bat`
- **Mac/Linux**: Run `chmod +x start-backend.sh && ./start-backend.sh`

### Option 2: Manual setup
```bash
cd backend
npm install
npm start
```

## 🔧 Prerequisites

1. **Node.js** (version 14 or higher)
2. **MongoDB** (local or cloud)
3. **Environment variables** configured

## 📋 Environment Variables

Create a `.env` file in the `backend` directory with:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/homelineteam
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🗄️ Database Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/homelineteam` as MONGODB_URI

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Get connection string
4. Use the connection string as MONGODB_URI

## 🖼️ Cloudinary Setup (for image uploads)

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Add them to your `.env` file

## ✅ Verification

Once the server is running, test these endpoints:

- **Health Check**: http://localhost:5000/api/health
- **Hero Section**: http://localhost:5000/api/hero-section
- **Categories**: http://localhost:5000/api/categories

You should see JSON responses, not HTML pages.

## 🐛 Troubleshooting

### "Failed to fetch" Error
- Make sure the backend server is running on port 5000
- Check if there are any firewall issues
- Verify the API_BASE_URL in frontend environment

### "MongoDB connection failed"
- Check if MongoDB is running
- Verify the MONGODB_URI in your .env file
- Ensure the database name is correct

### "Cloudinary upload failed"
- Verify your Cloudinary credentials
- Check if the image file is valid
- Ensure you have sufficient Cloudinary credits

## 📱 Frontend Integration

The frontend will automatically:
- Detect if the backend is online
- Use fallback data if backend is offline
- Show appropriate loading states
- Handle errors gracefully

## 🔄 Development Mode

For development with auto-restart:
```bash
cd backend
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.
