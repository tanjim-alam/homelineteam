#!/bin/bash
echo "Starting Backend Server..."
echo ""
echo "Make sure you have Node.js installed and dependencies installed."
echo "Run 'npm install' in the backend directory if you haven't already."
echo ""
cd backend
echo "Current directory: $(pwd)"
echo ""
echo "Starting server on http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""
npm start
