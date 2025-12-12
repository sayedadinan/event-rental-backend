# 🚀 Oracle Cloud Free Tier Deployment Guide

## Why Oracle Cloud?
- ✅ **TRUE Always Free** (not trial - free forever)
- ✅ **2 AMD Compute VMs** (1GB RAM each) OR **4 ARM Ampere A1 cores + 24GB RAM**
- ✅ **200GB Block Storage**
- ✅ **10GB Object Storage**
- ✅ **2 Autonomous Databases** (20GB each)
- ✅ **No credit card auto-charge** (must manually upgrade)

---

## Step 1: Create Oracle Cloud Account

1. **Go to:** https://www.oracle.com/cloud/free/
2. Click **Start for free**
3. Fill in details:
   - Country/Territory: India (or your location)
   - Email & password
   - **Cloud Account Name:** Choose unique name (e.g., `rental-shop-xyz`)
4. **Payment verification:**
   - Credit/debit card required for verification
   - ⚠️ **₹2 will be charged and refunded** (just verification)
   - You won't be charged unless you manually upgrade
5. Complete registration
6. Wait for email confirmation (2-5 minutes)

---

## Step 2: Setup Autonomous Database (Free MongoDB Alternative)

Oracle doesn't have MongoDB in free tier, but we'll use **Autonomous JSON Database** (works like MongoDB):

### Option A: Use Autonomous JSON Database (MongoDB-like)

1. **Login to Oracle Cloud Console**
2. Go to **Menu** → **Oracle Database** → **Autonomous JSON Database**
3. Click **Create Autonomous Database**
   - **Compartment:** Keep default (root)
   - **Display name:** `event-rental-db`
   - **Database name:** `eventdb`
   - **Workload type:** **JSON**
   - **Deployment type:** **Shared Infrastructure**
   - **Always Free:** ✅ **Check this box!**
   - **Password:** Create strong password (SAVE IT!)
   - **License type:** License included
4. Click **Create Autonomous Database**
5. Wait 2-3 minutes for provisioning

### Option B: Use MySQL (Easier - Recommended)

Oracle also has **MySQL Database Service** in free tier:

1. Go to **Menu** → **Databases** → **MySQL** → **DB Systems**
2. Click **Create DB System**
   - **Name:** `event-rental-mysql`
   - **Shape:** **MySQL.Free** (Always Free eligible)
   - **Username:** `admin`
   - **Password:** Create strong password
   - **Standalone:** Yes
3. Click **Create**

---

## Step 3: Deploy Backend to Oracle Compute (Free VM)

### 3.1 Create Compute Instance

1. **Go to:** Menu → **Compute** → **Instances**
2. Click **Create Instance**
   - **Name:** `event-rental-backend`
   - **Image:** **Ubuntu 22.04** (or latest)
   - **Shape:** 
     - Click "Change Shape"
     - Select **VM.Standard.E2.1.Micro** (Always Free)
     - 1GB RAM, 1 OCPU
   - **Always Free Eligible:** ✅ Verify this shows
   - **Boot Volume:** 50GB (default)
   - **SSH Keys:** Download private key (SAVE IT!)
3. Click **Create**
4. Wait 2-3 minutes
5. **Note the Public IP** (e.g., `123.45.67.89`)

### 3.2 Configure Firewall

1. On instance page, click **Subnet** link
2. Click **Default Security List**
3. Click **Add Ingress Rules**
   - **Source CIDR:** `0.0.0.0/0`
   - **Destination Port:** `5000`
   - **Description:** `Node.js API`
4. Click **Add Ingress Rules**

### 3.3 Connect to VM via SSH

**Windows (PowerShell):**
```powershell
# Move downloaded SSH key to safe location
Move-Item ~\Downloads\ssh-key-*.key ~\.ssh\oracle_key
icacls ~\.ssh\oracle_key /inheritance:r /grant:r "$($env:USERNAME):(R)"

# Connect (replace with your public IP)
ssh -i ~\.ssh\oracle_key ubuntu@YOUR_PUBLIC_IP
```

### 3.4 Setup Backend on VM

Once connected to VM:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install Git
sudo apt install -y git

# Clone your repository
git clone https://github.com/sayedadinan/event-rental-backend.git
cd event-rental-backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Paste this into `.env`** (press Ctrl+X, Y, Enter to save):
```env
NODE_ENV=production
PORT=5000

# We'll use MongoDB Atlas (still free) for database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/event-rental-shop?retryWrites=true&w=majority

CORS_ORIGIN=*
WHATSAPP_ENABLED=false
```

**Setup MongoDB Atlas (Quick):**
```bash
# While still in VM, we need a database
# Easiest: Use MongoDB Atlas free tier
# Go to: https://cloud.mongodb.com (from your computer)
# Create account → Create FREE M0 cluster
# Get connection string and update .env
```

**Install PM2 (keeps app running):**
```bash
sudo npm install -g pm2

# Start application
pm2 start server.js --name event-rental-api

# Make it auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs
```

### 3.5 Test Your API

```bash
# From VM
curl http://localhost:5000/health

# From your computer (replace with your public IP)
curl http://YOUR_PUBLIC_IP:5000/health
```

---

## Step 4: Setup Domain (Optional - Free)

Use **DuckDNS** for free subdomain:

1. Go to https://www.duckdns.org
2. Login with GitHub/Google
3. Create subdomain: `event-rental-api.duckdns.org`
4. Point to your Oracle VM public IP
5. Update in VM:
```bash
sudo apt install -y nginx

# Configure nginx as reverse proxy
sudo nano /etc/nginx/sites-available/api
```

Paste:
```nginx
server {
    listen 80;
    server_name event-rental-api.duckdns.org;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Your API: `http://event-rental-api.duckdns.org`

---

## Summary: What You Get FREE Forever

| Resource | Free Tier | Your Use |
|----------|-----------|----------|
| **Compute VM** | 2x E2.1.Micro (1GB each) | Backend hosting |
| **MongoDB Atlas** | 512MB | Database |
| **Block Storage** | 200GB | For backups/files |
| **Bandwidth** | 10TB/month | API traffic |
| **Public IP** | 2 IPs | API access |

**Total Cost:** ₹0/month **Forever**

---

## Quick Commands Reference

```bash
# SSH to VM
ssh -i ~\.ssh\oracle_key ubuntu@YOUR_PUBLIC_IP

# Check backend status
pm2 status
pm2 logs event-rental-api

# Restart backend
pm2 restart event-rental-api

# Update code
cd event-rental-backend
git pull
npm install
pm2 restart event-rental-api

# Check system resources
htop
df -h
```

---

## Your Final Setup

1. **Backend:** http://YOUR_ORACLE_IP:5000
2. **Database:** MongoDB Atlas (free 512MB)
3. **Cost:** ₹0/month
4. **Performance:** 1GB RAM, 1 vCPU (enough for small business)

---

Would you like me to help you set this up? Just follow Step 1 first and let me know when you have the Oracle account ready!
