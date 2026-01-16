# 🚀 Lekhpal Blockchain Land Registry - Production Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
5. [Blockchain Configuration](#blockchain-configuration)
6. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before starting deployment, ensure you have:

- [ ] GitHub account with repository access
- [ ] Render.com account (for backend)
- [ ] Netlify account (for frontend)
- [ ] MongoDB Atlas account (for database)
- [ ] Blockchain network access (testnet or mainnet)
- [ ] Contract addresses deployed on blockchain
- [ ] Admin wallet private key

---

## 🔧 Environment Setup

### 1. Prepare Environment Variables

Create a secure document to store all your production environment variables.

#### **Backend Environment Variables (.env for server)**

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# MongoDB Configuration
MongoURI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# Blockchain Configuration
ADMIN_PRIVATE_KEY=your-admin-wallet-private-key-without-0x
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# Or use other RPC providers like Alchemy:
# BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Contract Addresses (from your deployed contracts)
LAND_REGISTRY_ADDRESS=0x3C4A068c391D242Cd9821539113395657D36741e
ESCROW_ADDRESS=0xC38333feEc975a052628385705b9213eecED305C

# Frontend URL (will be updated after Netlify deployment)
FRONTEND_URL=https://your-app-name.netlify.app

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://your-app-name.netlify.app,http://localhost:5173
```

#### **Frontend Environment Variables**

```env
# Backend API URL (will be updated after Render deployment)
VITE_API_URL=https://your-backend-app.onrender.com
```

---

## 🗄️ Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Build a Database"**
4. Choose **FREE Shared Cluster** (M0)
5. Select cloud provider and region closest to your Render backend
6. Name your cluster (e.g., `lekhpal-cluster`)
7. Click **"Create"**

### Step 2: Create Database User

1. Go to **Database Access** in left sidebar
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Create username and strong password
5. Set privileges to **"Read and write to any database"**
6. Click **"Add User"**

### Step 3: Configure Network Access

1. Go to **Network Access** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is necessary for Render's dynamic IPs
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your credentials
5. Add database name after `.net/`: `mongodb+srv://...mongodb.net/lekhpal?retryWrites=true&w=majority`

---

## 🔗 Blockchain Configuration

### Step 1: Prepare Blockchain Network

#### For Testnet (Recommended for initial deployment):

**Ethereum Sepolia Testnet:**
- RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- Get free Infura key: https://infura.io
- Chain ID: 11155111

**Alternative: Alchemy**
- RPC URL: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
- Get free Alchemy key: https://www.alchemy.com

#### Get Test ETH:
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your admin wallet address
3. Receive test ETH (needed for gas fees)

### Step 2: Verify Smart Contracts

Ensure your contracts are deployed and verified:

1. Check contract addresses in `server/Config/contract.js`
2. Verify contracts on [Etherscan Sepolia](https://sepolia.etherscan.io/)
3. Test contract functions using Etherscan interface

### Step 3: Prepare Admin Wallet

1. **Export Private Key from MetaMask:**
   - Open MetaMask
   - Click menu → Account Details → Export Private Key
   - Enter password → Copy private key
   - **Remove `0x` prefix before storing**

2. **⚠️ SECURITY WARNING:**
   - Never commit private keys to Git
   - Use environment variables only
   - Keep separate wallets for dev/prod
   - Ensure wallet has admin role in smart contract

---

## 🖥️ Backend Deployment (Render)

### Step 1: Prepare Backend Code

1. **Update `server/render.yaml`** (already configured):
   ```yaml
   services:
     - type: web
       name: land-registry-backend
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: PORT
           value: 10000
         - key: MongoURI
           sync: false
         - key: JWT_SECRET
           sync: false
   ```

2. **Verify `server/package.json` has correct start script:**
   ```json
   {
     "scripts": {
       "start": "node app.js"
     }
   }
   ```

3. **Commit changes to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Sign up/Login to [Render](https://render.com)**

2. **Create New Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub account
   - Select your repository: `Lekhpal`
   - Give it a name: `lekhpal-backend`

3. **Configure Build Settings:**
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Add Environment Variables:**
   Click **"Environment"** and add all backend variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MongoURI` | Your MongoDB connection string |
   | `JWT_SECRET` | Your JWT secret (32+ chars) |
   | `ADMIN_PRIVATE_KEY` | Your admin wallet private key (no 0x) |
   | `BLOCKCHAIN_RPC_URL` | Your Infura/Alchemy RPC URL |
   | `LAND_REGISTRY_ADDRESS` | `0x3C4A068c391D242Cd9821539113395657D36741e` |
   | `ESCROW_ADDRESS` | `0xC38333feEc975a052628385705b9213eecED305C` |

5. **Deploy:**
   - Choose **Free** plan
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for deployment

6. **Get Backend URL:**
   - After deployment, note your URL: `https://lekhpal-backend.onrender.com`
   - Test health endpoint: `https://lekhpal-backend.onrender.com/health`

### Step 3: Update CORS Configuration

1. Add Netlify URL to `server/app.js` (will update after frontend deployment):
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://your-app-name.netlify.app', // Add this
     process.env.FRONTEND_URL
   ].filter(Boolean);
   ```

2. Set `FRONTEND_URL` environment variable in Render dashboard

---

## 🌐 Frontend Deployment (Netlify)

### Step 1: Update Frontend Configuration

1. **Update `.env` in root directory:**
   ```env
   VITE_API_URL=https://lekhpal-backend.onrender.com
   ```

2. **Verify `netlify.toml` is correct:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "18"
   ```

3. **Test build locally:**
   ```bash
   npm run build
   ```
   - Ensure no errors
   - Check `dist` folder is created

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Configure production API URL"
   git push origin main
   ```

### Step 2: Deploy on Netlify

1. **Sign up/Login to [Netlify](https://www.netlify.com)**

2. **Import Project:**
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **"GitHub"**
   - Select your repository: `Lekhpal`

3. **Configure Build Settings:**
   - **Base directory:** Leave empty (root)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Branch:** `main`

4. **Add Environment Variables:**
   - Go to **Site settings** → **Environment variables**
   - Add:
     | Key | Value |
     |-----|-------|
     | `VITE_API_URL` | `https://lekhpal-backend.onrender.com` |

5. **Deploy:**
   - Click **"Deploy site"**
   - Wait 3-5 minutes

6. **Get Frontend URL:**
   - Note your URL: `https://random-name-12345.netlify.app`
   - Optionally change it: **Site settings** → **Change site name**

### Step 3: Configure Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow DNS configuration steps
4. Wait for SSL certificate provisioning

---

## 🔄 Final Configuration Updates

### Step 1: Update Backend CORS

1. Go to Render dashboard → Your backend service
2. Update environment variable:
   - `FRONTEND_URL`: `https://your-app-name.netlify.app`
3. Add to `ALLOWED_ORIGINS`:
   - `https://your-app-name.netlify.app,http://localhost:5173`

### Step 2: Redeploy Backend

1. In Render dashboard, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Wait for deployment to complete

---

## ✅ Post-Deployment Verification

### Backend Health Check

```bash
curl https://lekhpal-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-16T..."
}
```

### Frontend Check

1. Visit `https://your-app-name.netlify.app`
2. Verify landing page loads
3. Check browser console for errors

### Full Flow Test

1. **Register User:**
   - Go to frontend → Auth page
   - Sign up with test email
   - Check console for API calls

2. **Login:**
   - Login with test user
   - Verify JWT token is received
   - Check localStorage has token

3. **Admin Dashboard:**
   - Login with admin account
   - Connect wallet
   - Verify blockchain connection
   - Try registering test land

4. **User Dashboard:**
   - Login as regular user
   - Submit land registration request
   - Verify it appears in admin pending requests

### Database Verification

1. Go to MongoDB Atlas → Collections
2. Check for:
   - `users` collection with test users
   - `landrequests` collection with requests

### Blockchain Verification

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io/)
2. Search for contract addresses
3. Verify transactions appear after admin actions

---

## 🐛 Troubleshooting

### Backend Issues

#### 1. **"Cannot connect to MongoDB"**

**Solution:**
- Verify MongoDB connection string format
- Check network access allows 0.0.0.0/0
- Ensure database user has correct permissions
- Test connection string locally

#### 2. **"Admin wallet not found / Insufficient funds"**

**Solution:**
- Check `ADMIN_PRIVATE_KEY` is set correctly (no 0x prefix)
- Verify wallet has test ETH (use faucet)
- Check RPC URL is correct
- Ensure wallet is admin in smart contract

#### 3. **"CORS errors"**

**Solution:**
- Add Netlify URL to `allowedOrigins` in `server/app.js`
- Set `FRONTEND_URL` environment variable
- Redeploy backend after changes
- Clear browser cache

#### 4. **"502 Bad Gateway on Render"**

**Solution:**
- Check Render logs for errors
- Verify `PORT` environment variable is `10000`
- Check all dependencies installed correctly
- Ensure MongoDB is accessible

### Frontend Issues

#### 1. **"Network Error / API calls failing"**

**Solution:**
- Verify `VITE_API_URL` is correct
- Check backend is running (visit health endpoint)
- Inspect browser Network tab for exact error
- Verify CORS is configured on backend

#### 2. **"Build fails on Netlify"**

**Solution:**
- Check build logs for specific errors
- Verify `package.json` dependencies are correct
- Test `npm run build` locally first
- Ensure Node version matches (18+)

#### 3. **"Blank page after deployment"**

**Solution:**
- Check browser console for errors
- Verify `netlify.toml` redirect rules
- Check base URL configuration in `vite.config.js`
- Clear Netlify cache and redeploy

#### 4. **"MetaMask connection issues"**

**Solution:**
- Ensure user is on correct network (Sepolia)
- Check contract addresses are correct
- Verify RPC endpoint is accessible
- Test contract interaction on Etherscan first

### Environment Variable Issues

#### 1. **Variables not loading**

**Solution:**
- Frontend: Variables must start with `VITE_`
- Restart dev server after .env changes
- In production, set variables in hosting dashboard
- Never commit .env files to Git

#### 2. **"JWT_SECRET not found"**

**Solution:**
- Ensure `JWT_SECRET` is set in Render
- Must be at least 32 characters
- Redeploy after adding variable

### Database Issues

#### 1. **"MongoServerError: Authentication failed"**

**Solution:**
- Double-check username and password
- URL encode special characters in password
- Verify database user exists
- Check user permissions

#### 2. **"Connection timeout"**

**Solution:**
- Verify IP whitelist includes 0.0.0.0/0
- Check MongoDB cluster is running
- Try different region/cluster
- Test connection string locally

---

## 🔐 Security Checklist

- [ ] All environment variables set (no hardcoded secrets)
- [ ] MongoDB network access restricted to Render IPs if possible
- [ ] JWT secret is strong (32+ characters)
- [ ] Private keys never committed to Git
- [ ] CORS properly configured (specific origins)
- [ ] HTTPS enabled on both frontend and backend
- [ ] Rate limiting configured on backend
- [ ] Input validation on all endpoints
- [ ] Separate admin and user roles enforced
- [ ] Smart contract admin functions restricted

---

## 📊 Monitoring and Maintenance

### Set Up Monitoring

1. **Render Monitoring:**
   - Enable email alerts for deployment failures
   - Check logs regularly: Dashboard → Logs

2. **Netlify Monitoring:**
   - Enable deploy notifications
   - Set up analytics

3. **MongoDB Atlas:**
   - Enable performance alerts
   - Set up backup schedule

### Regular Maintenance Tasks

- **Weekly:**
  - Check error logs on Render
  - Monitor MongoDB storage usage
  - Verify blockchain transactions

- **Monthly:**
  - Update dependencies (security patches)
  - Review and rotate JWT secrets if needed
  - Check blockchain gas usage/costs

---

## 🎉 Deployment Complete!

Your Lekhpal application is now live:

- **Frontend:** `https://your-app-name.netlify.app`
- **Backend:** `https://lekhpal-backend.onrender.com`
- **Database:** MongoDB Atlas
- **Blockchain:** Ethereum Sepolia Testnet

### Next Steps:

1. Test all features thoroughly
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Document admin procedures
5. Create user onboarding guide

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Ethers.js:** https://docs.ethers.org
- **Infura:** https://docs.infura.io

---

## 📝 Deployment Checklist

Print this checklist and check off items as you complete them:

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with correct permissions
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string tested
- [ ] Smart contracts deployed and verified
- [ ] Admin wallet has test ETH
- [ ] Blockchain RPC URL configured
- [ ] Backend environment variables prepared
- [ ] Backend deployed on Render
- [ ] Backend health endpoint tested
- [ ] Frontend environment variables updated
- [ ] Frontend deployed on Netlify
- [ ] Frontend loads without errors
- [ ] CORS configured with Netlify URL
- [ ] Backend redeployed with CORS updates
- [ ] User registration tested
- [ ] User login tested
- [ ] Admin dashboard tested
- [ ] Blockchain interaction tested
- [ ] Land registration flow tested end-to-end

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Frontend URL:** _____________

**Backend URL:** _____________
