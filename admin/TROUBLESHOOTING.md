# Troubleshooting Guide - Admin Panel

## 🚨 CORS Issues

### Problem: "Access to XMLHttpRequest has been blocked by CORS policy"

This error occurs when your frontend (localhost:5173) can't communicate with your backend (localhost:5000).

### Solutions:

#### 1. **Restart Backend Server**
```bash
# Stop the backend server (Ctrl+C)
# Then restart it
cd backend
npm start
```

#### 2. **Check Backend CORS Configuration**
The backend should have this CORS configuration in `server.js`:
```javascript
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

#### 3. **Verify Backend is Running**
- Check if backend is running on port 5000
- Visit `http://localhost:5000/api/health` in browser
- Should see: `{"ok":true,"service":"homelineteam-backend"}`

#### 4. **Test CORS Connection**
- Use the "Test CORS Connection" button on the login page
- Check browser console for detailed error messages
- Look for the CORS test endpoint response

#### 5. **Check Browser Console**
Open browser DevTools (F12) and check:
- Console tab for error messages
- Network tab for failed requests
- Look for CORS preflight requests

### Common Issues & Fixes:

#### Issue: "Credentials mode is 'include'"
**Fix**: Backend CORS must have `credentials: true`

#### Issue: "Origin not allowed"
**Fix**: Add your frontend URL to CORS origins array

#### Issue: "Cookie not being sent"
**Fix**: Check cookie configuration in auth controller

#### Issue: "Preflight request failing"
**Fix**: Ensure OPTIONS method is allowed in CORS

## 🔧 **Step-by-Step Fix**

1. **Stop both frontend and backend**
2. **Update backend CORS configuration** (see above)
3. **Restart backend server**
4. **Test CORS endpoint**: `http://localhost:5000/api/cors-test`
5. **Restart frontend**
6. **Use "Test CORS Connection" button**
7. **Check browser console for errors**

## 📋 **Verification Checklist**

- [ ] Backend running on port 5000
- [ ] CORS properly configured
- [ ] Frontend running on port 5173
- [ ] CORS test endpoint working
- [ ] No CORS errors in console
- [ ] Cookies being sent properly

## 🐛 **Debug Mode**

Enable debug mode by setting environment variable:
```bash
# In admin directory
echo "VITE_DEBUG_MODE=true" > .env
```

This will show detailed API request/response logs in console.

## 📞 **Still Having Issues?**

1. Check backend console for errors
2. Check frontend console for errors
3. Verify both servers are running
4. Check firewall/antivirus settings
5. Try different browser
6. Clear browser cache and cookies

## 🔍 **Useful Commands**

```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Check backend logs
cd backend && npm start

# Check frontend logs
cd admin && npm run dev

# Test backend directly
curl http://localhost:5000/api/health
```

---

**Need more help?** Check the console logs and error messages for specific details.
