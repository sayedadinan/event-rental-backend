# 🚀 Deployment Guide - Free Hosting

## Prerequisites Checklist
- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier)
- [ ] Render.com account (free tier)

---

## Step 1: Setup MongoDB Atlas (Free Database)

### 1.1 Create Account & Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a **FREE Shared Cluster** (M0 - 512MB)
4. Choose region closest to you (Singapore, Mumbai, etc.)
5. Cluster name: `event-rental-cluster`

### 1.2 Database Access
1. Go to **Database Access** → **Add New Database User**
2. Username: `rentaladmin` (or your choice)
3. Password: Generate a strong password (SAVE THIS!)
4. Built-in Role: **Read and write to any database**
5. Click **Add User**

### 1.3 Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access From Anywhere** (0.0.0.0/0)
   - This is needed for Render to connect
3. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** → **Connect**
2. Select **Connect your application**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string:
   ```
   mongodb+srv://rentaladmin:<password>@event-rental-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your database user password
6. Add database name after `.net/`: 
   ```
   mongodb+srv://rentaladmin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/event-rental-shop?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render.com

### 2.1 Push Code to GitHub
```powershell
# In your backend folder
git init
git add .
git commit -m "Initial commit - production ready"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/event-rental-backend.git
git branch -M main
git push -u origin main
```

### 2.2 Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### 2.3 Create New Web Service
1. Click **New** → **Web Service**
2. Connect your `event-rental-backend` repository
3. Fill in details:
   - **Name**: `event-rental-api` (or your choice)
   - **Region**: Choose closest (Singapore/Oregon)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### 2.4 Add Environment Variables
Click **Advanced** → **Add Environment Variable**

Add these one by one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `CORS_ORIGIN` | `*` (or your frontend URL) |
| `WHATSAPP_ENABLED` | `false` |

### 2.5 Deploy
1. Click **Create Web Service**
2. Wait 2-5 minutes for deployment
3. Your backend will be live at: `https://event-rental-api.onrender.com`

---

## Step 3: Test Your Deployment

### 3.1 Health Check
Open in browser:
```
https://event-rental-api.onrender.com/health
```
Should return: `{"status":"OK","timestamp":"..."}`

### 3.2 API Root
```
https://event-rental-api.onrender.com/
```
Should return: `{"success":true,"message":"Event Rental Shop API","version":"1.0.0"}`

### 3.3 Test API Endpoints
```
GET https://event-rental-api.onrender.com/api/products
GET https://event-rental-api.onrender.com/api/customers
GET https://event-rental-api.onrender.com/api/bookings
```

---

## Step 4: Configure Flutter App

Update your Flutter app's API base URL:

```dart
// lib/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://event-rental-api.onrender.com/api';
}
```

---

## Important Notes

### ⚠️ Free Tier Limitations

**Render.com Free Tier:**
- ✅ 750 hours/month (enough for 24/7)
- ⚠️ Sleeps after 15 minutes of inactivity
- ⚠️ Cold start: 30-60 seconds wake-up time
- ✅ Auto-deploys on git push

**MongoDB Atlas Free Tier:**
- ✅ 512MB storage (enough for thousands of bookings)
- ✅ Shared RAM & CPU
- ✅ No credit card required

### 🔄 Auto-Deploy Setup
Every time you push to GitHub `main` branch:
```powershell
git add .
git commit -m "Update message"
git push origin main
```
Render will automatically redeploy (takes 2-3 minutes).

### 📊 Monitoring
- **Render Dashboard**: View logs, metrics, deployments
- **MongoDB Atlas**: View database size, connections

---

## Troubleshooting

### Backend won't start:
1. Check Render logs in dashboard
2. Verify `MONGODB_URI` is correct
3. Ensure MongoDB Atlas whitelist is 0.0.0.0/0

### Can't connect to database:
1. Check MongoDB Atlas connection string
2. Verify database user has read/write permissions
3. Check Network Access allows all IPs

### API returns 502/503:
- Free tier is sleeping, wait 30-60 seconds for wake-up
- Check Render logs for errors

---

## Alternative Free Hosting Options

If Render doesn't work for you:

### 1. Railway.app
- $5 free credit/month
- Similar setup to Render
- [Railway Docs](https://docs.railway.app)

### 2. Fly.io
- Free tier available
- Global deployment
- [Fly.io Docs](https://fly.io/docs)

### 3. Cyclic.sh (Now merged with Render)
- Good Node.js support

---

## Production Checklist

Before going live:
- [ ] MongoDB Atlas cluster created
- [ ] Database user with strong password
- [ ] Network access configured
- [ ] Code pushed to GitHub
- [ ] Render web service deployed
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] API endpoints tested
- [ ] Flutter app updated with production URL
- [ ] CORS configured (if needed)

---

## Cost Summary

| Service | Free Tier | Enough For |
|---------|-----------|------------|
| MongoDB Atlas | 512MB | ~10,000 bookings |
| Render.com | 750hrs/month | 24/7 operation |
| **Total Cost** | **$0/month** | Small to medium business |

---

## Need Help?

- Render Community: https://community.render.com
- MongoDB Forum: https://www.mongodb.com/community/forums
- Express.js Docs: https://expressjs.com

---

**Your backend is now production-ready and free to host! 🎉**
