# Deploy Notification Server to Your Existing Railway Project

## 🎯 **You Already Have Railway Set Up!**

Great! I can see you have:
- ✅ Railway project: "surprising-serenity"
- ✅ Backend service: `scms-backend.up.railway.app`
- ✅ MySQL database connected
- ✅ GitHub integration working

## 🚀 **Add Notification Server as Second Service**

### **Method 1: Railway Dashboard (Recommended)**

1. **Go to your Railway project**: https://railway.app/dashboard
2. **Click on your project**: "surprising-serenity"
3. **Click "+ New Service"**
4. **Select "GitHub Repo"**
5. **Choose your repository**: scms_updated_backup
6. **Railway will auto-detect it as Node.js**

### **Method 2: Deploy the Notification Server Directory**

Since I've created a `notification-server/` directory with all the necessary files, you can:

1. **Push the notification-server folder to your GitHub repo**
2. **In Railway Dashboard, add a new service**
3. **Point it to the `notification-server` directory**

## ⚙️ **Configure Environment Variables**

Once the service is added, set these environment variables in Railway:

### **Database Variables (Same as your backend):**
```env
DB_HOST=${{ MySQL.MYSQLHOST }}
DB_USER=${{ MySQL.MYSQLUSER }}
DB_PASSWORD=${{ MySQL.MYSQLPASSWORD }}
DB_NAME=${{ MySQL.MYSQLDATABASE }}
```

### **Notification Server Variables:**
```env
ALLOWED_ORIGINS=https://scmsupdatedbackup.vercel.app
PORT=4000
```

### **How to Set Variables:**
1. Go to your new notification service
2. Click "Variables" tab
3. Add each variable above
4. For database variables, use the `${{ MySQL.VARIABLE }}` syntax to reference your existing MySQL service

## 🔗 **Update Your Vercel App**

After deployment, you'll get a URL like: `https://your-notification-server.up.railway.app`

### **Update Vercel Environment Variables:**
1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Add/Update:
```env
REACT_APP_SSE_URL=https://your-notification-server.up.railway.app/api/notifications/stream
REACT_APP_NOTIFICATION_SERVER_URL=https://your-notification-server.up.railway.app
```

### **Redeploy Vercel:**
After updating environment variables, redeploy your Vercel app.

## 🧪 **Test the Complete System**

1. **Test Notification Server:**
```bash
curl https://your-notification-server.up.railway.app/health
```

2. **Test from your Vercel app:**
   - Open `https://scmsupdatedbackup.vercel.app`
   - Check browser console for notification connection
   - Try creating a post to trigger notifications

## 📋 **Expected Result**

After setup:
- ✅ Notification server running on Railway
- ✅ Connected to your existing MySQL database
- ✅ Vercel app connecting to notification server
- ✅ Real-time notifications working
- ✅ Both services in same Railway project

## 🆘 **If You Need Help**

### **Step-by-Step Railway Dashboard:**

1. **Login to Railway**: https://railway.app/dashboard
2. **Click your project**: "surprising-serenity"
3. **Click "+ New Service"** (top right)
4. **Select "GitHub Repo"**
5. **Choose your repo**: scms_updated_backup
6. **Railway will auto-detect Node.js**
7. **Set the root directory** to `notification-server` (if you used the folder approach)
8. **Go to Variables tab** and add the environment variables above
9. **Deploy!**

### **Alternative: One-Click Deploy**

If you want to deploy just the notification server separately:

1. **Create a new Railway project**
2. **Connect your GitHub repo**
3. **Set root directory** to `notification-server`
4. **Add environment variables**
5. **Deploy**

## 🎯 **Quick Commands for Testing**

After deployment, test these endpoints:

```bash
# Health check
curl https://your-notification-server.up.railway.app/health

# Connection status
curl https://your-notification-server.up.railway.app/api/notifications/status

# Test CORS (from your Vercel domain)
curl -H "Origin: https://scmsupdatedbackup.vercel.app" \
     https://your-notification-server.up.railway.app/health
```

The notification server will work perfectly with your existing Railway setup! 🚀
