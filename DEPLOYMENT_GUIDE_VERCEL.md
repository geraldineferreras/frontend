# Real-Time Notifications Deployment Guide for Vercel

## 🚨 **The Problem**

Your SCMS system is deployed on Vercel (`scmsupdatedbackup.vercel.app`), but **Vercel cannot run Socket.IO servers** because:

- Vercel is serverless (functions timeout after 10-60 seconds)
- No persistent WebSocket connections
- Functions are stateless and isolated

## 🔧 **Solutions**

### **Option 1: Deploy Notification Server Separately (Recommended)**

Deploy your `notification-server.js` to a platform that supports persistent servers:

#### **A. Railway (Recommended)**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Create new project
railway init

# 4. Set environment variables
railway variables set DB_HOST=your-mysql-host
railway variables set DB_USER=your-mysql-user
railway variables set DB_PASSWORD=your-mysql-password
railway variables set DB_NAME=scms_db
railway variables set ALLOWED_ORIGINS=https://scmsupdatedbackup.vercel.app

# 5. Deploy
railway up
```

#### **B. Heroku**
```bash
# 1. Install Heroku CLI
# 2. Login to Heroku
heroku login

# 3. Create app
heroku create your-notification-server

# 4. Set environment variables
heroku config:set DB_HOST=your-mysql-host
heroku config:set DB_USER=your-mysql-user
heroku config:set DB_PASSWORD=your-mysql-password
heroku config:set DB_NAME=scms_db
heroku config:set ALLOWED_ORIGINS=https://scmsupdatedbackup.vercel.app

# 5. Deploy
git push heroku main
```

#### **C. DigitalOcean Droplet**
```bash
# 1. Create a $5/month droplet
# 2. Install Node.js and MySQL
# 3. Clone your repo
# 4. Install dependencies
# 5. Set environment variables
# 6. Use PM2 to run the server
pm2 start notification-server.js --name "scms-notifications"
pm2 startup
pm2 save
```

### **Option 2: Configure Vercel Environment Variables**

Update your Vercel deployment with the notification server URL:

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add these variables:**
```env
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api
REACT_APP_SSE_URL=https://your-notification-server.railway.app/api/notifications/stream
REACT_APP_NOTIFICATION_SERVER_URL=https://your-notification-server.railway.app
```

3. **Redeploy your Vercel app**

### **Option 3: Use Polling Instead (Quick Fix)**

If you want to keep everything on Vercel, modify your notification system to use polling:

1. **Update your API endpoints** to return notifications
2. **Modify the frontend** to poll for notifications every 30 seconds
3. **Remove Socket.IO dependency** from the frontend

## 🚀 **Recommended Setup**

### **Step 1: Deploy Notification Server to Railway**

1. Create a Railway account
2. Connect your GitHub repository
3. Deploy the `notification-server.js` file
4. Set environment variables
5. Get the Railway URL (e.g., `https://your-app.railway.app`)

### **Step 2: Update Vercel Environment Variables**

In your Vercel dashboard, add:
```env
REACT_APP_SSE_URL=https://your-app.railway.app/api/notifications/stream
REACT_APP_NOTIFICATION_SERVER_URL=https://your-app.railway.app
```

### **Step 3: Test the System**

1. Open `test_deployed_notifications.html` in your browser
2. Test the deployed API endpoints
3. Verify notifications are working

## 📋 **Database Setup**

Make sure your notification server can access your MySQL database:

```sql
-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  recipient_role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  data JSON,
  is_read BOOLEAN DEFAULT FALSE,
  is_broadcast BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,
  INDEX idx_recipient (recipient_id, recipient_role),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read)
);

-- Create push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  subscription_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (user_id),
  INDEX idx_user_role (user_id, user_role)
);
```

## 🔍 **Testing Your Deployment**

1. **Test Notification Server:**
```bash
curl https://your-notification-server.railway.app/health
```

2. **Test Vercel App:**
   - Open `https://scmsupdatedbackup.vercel.app`
   - Check browser console for notification connection status
   - Try creating a post to trigger notifications

3. **Use Test File:**
   - Open `test_deployed_notifications.html`
   - Run all test cases
   - Verify notifications are working

## 🎯 **Expected Results**

After proper deployment:
- ✅ Notification server running on Railway/Heroku/DigitalOcean
- ✅ Vercel app connecting to notification server
- ✅ Real-time notifications working in browser
- ✅ Database storing notification history
- ✅ Push notifications working (with browser permission)

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors:**
   - Ensure `ALLOWED_ORIGINS` includes your Vercel URL
   - Check notification server CORS configuration

2. **Database Connection:**
   - Verify database credentials in environment variables
   - Ensure database server allows external connections

3. **Environment Variables:**
   - Double-check all environment variables are set correctly
   - Redeploy after changing environment variables

4. **Network Issues:**
   - Test notification server health endpoint
   - Check browser network tab for failed requests

### **Debug Commands:**
```bash
# Check notification server health
curl https://your-notification-server.railway.app/health

# Check notification server status
curl https://your-notification-server.railway.app/api/notifications/status

# Test CORS
curl -H "Origin: https://scmsupdatedbackup.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-notification-server.railway.app/api/notifications/status
```

## 📞 **Support**

If you need help with deployment:
1. Check the test file results
2. Verify environment variables
3. Test notification server endpoints
4. Check browser console for errors

The notification system **will work** once properly deployed to a platform that supports persistent servers!
