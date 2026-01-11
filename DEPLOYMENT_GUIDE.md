# Deployment Guide: Backend on Render & Frontend on Netlify

This guide provides step-by-step instructions to deploy your Land Registry application with the backend on Render and frontend on Netlify.

---

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Netlify Account** - Sign up at [netlify.com](https://netlify.com)
4. **MongoDB Atlas Account** - For database hosting (sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas))

---

## Part 1: Deploy Backend to Render

### Step 1: Prepare Your Backend Code

1. Ensure your backend is in the `server/` folder
2. Verify `server/package.json` has a `start` script:
   ```json
   "scripts": {
     "start": "node app.js"
   }
   ```

### Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free cluster
2. Create a database user (note the username and password)
3. Whitelist IP addresses:
   - For development: Add your current IP
   - For Render: Add `0.0.0.0/0` (allow all IPs) or Render's IP range
4. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`)
   - Replace `<password>` with your database password

### Step 3: Deploy to Render

1. **Log in to Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Sign in with GitHub

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your code

3. **Configure the Service:**
   - **Name:** `land-registry-backend` (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `server` (important!)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or upgrade if needed)

4. **Set Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   
   ```
   MongoURI = mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
   ```
   (Use your actual MongoDB connection string)
   
   ```
   JWT_SECRET = your_very_secure_random_string_here
   ```
   (Generate a secure random string, e.g., use `openssl rand -hex 32`)
   
   ```
   NODE_ENV = production
   ```
   
   ```
   PORT = 10000
   ```
   (Render automatically sets PORT, but you can specify it)

5. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Note Your Backend URL:**
   - Once deployed, your backend URL will be: `https://land-registry-backend.onrender.com`
   - **Important:** Copy this URL - you'll need it for the frontend

7. **Update CORS Settings (if needed):**
   - In your `server/app.js`, ensure CORS is configured to allow your Netlify domain:
   ```javascript
   app.use(cors({
     origin: ['https://your-frontend-name.netlify.app', 'http://localhost:5173'],
     credentials: true
   }));
   ```

---

## Part 2: Deploy Frontend to Netlify

### Step 1: Update Frontend Code

1. **Update API URL in Auth.jsx:**
   - The code has been updated to use `VITE_API_URL` environment variable
   - Create a `.env` file in the frontend root (not in server folder):
   ```env
   VITE_API_URL=https://your-backend-name.onrender.com
   ```
   Replace with your actual Render backend URL.

2. **Commit and Push Changes:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify Dashboard (Recommended for first time)

1. **Log in to Netlify:**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in with GitHub

2. **Create a New Site:**
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository

3. **Configure Build Settings:**
   - **Base directory:** `frontend` (or leave empty if frontend is root)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Click "Add variable"
   - Add:
     ```
     VITE_API_URL = https://your-backend-name.onrender.com
     ```
     (Replace with your actual Render backend URL)

5. **Deploy:**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend
   - Wait for deployment to complete

6. **Update Site Name (Optional):**
   - Go to Site settings → General
   - Change site name to something like `land-registry-app`

7. **Get Your Frontend URL:**
   - Your site will be available at: `https://your-site-name.netlify.app`

#### Option B: Deploy via Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Initialize Netlify:**
   ```bash
   cd frontend
   netlify init
   ```
   Follow the prompts:
   - Create & configure a new site
   - Set build command: `npm run build`
   - Set publish directory: `dist`

4. **Set Environment Variable:**
   ```bash
   netlify env:set VITE_API_URL https://your-backend-name.onrender.com
   ```

5. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### Step 3: Update Backend CORS (Important!)

1. **Update your backend CORS configuration** to include your Netlify URL:
   
   Edit `server/app.js`:
   ```javascript
   const cors = require('cors');
   
   app.use(cors({
     origin: [
       'https://your-site-name.netlify.app',
       'http://localhost:5173'  // For local development
     ],
     credentials: true
   }));
   ```

2. **Commit and push the changes:**
   ```bash
   git add server/app.js
   git commit -m "Update CORS for Netlify"
   git push origin main
   ```

3. **Render will automatically redeploy** with the new CORS settings

---

## Part 3: Verify Deployment

### Test Backend:

1. Visit: `https://your-backend-name.onrender.com`
   - Should see: "Hello from server."

2. Test an endpoint:
   - `https://your-backend-name.onrender.com/login`
   - Use Postman or curl to test

### Test Frontend:

1. Visit: `https://your-site-name.netlify.app`
2. Try logging in or signing up
3. Check browser console for any errors

### Common Issues & Solutions:

#### Issue 1: CORS Error
- **Solution:** Ensure your backend CORS includes your Netlify URL
- Check that `credentials: true` is set if you're using cookies

#### Issue 2: API Calls Failing
- **Solution:** Verify `VITE_API_URL` is set correctly in Netlify environment variables
- Check that your backend URL doesn't have a trailing slash

#### Issue 3: Backend Not Starting
- **Solution:** Check Render logs for errors
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct

#### Issue 4: Build Failures
- **Solution:** Check build logs in Render/Netlify
- Verify Node version (use Node 18 or 20)
- Ensure all dependencies are in `package.json`

---

## Part 4: Update Environment Variables After Deployment

### If You Need to Update Frontend Environment Variables:

1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables
2. Edit or add variables
3. Trigger a new deploy (or wait for auto-deploy if Git is connected)

### If You Need to Update Backend Environment Variables:

1. Go to Render Dashboard → Your Service → Environment
2. Edit or add variables
3. Click "Save Changes" - Render will automatically redeploy

---

## Part 5: Set Up Custom Domains (Optional)

### For Netlify:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS

### For Render:

1. Go to your service → Settings
2. Add your custom domain
3. Update DNS records as instructed

---

## Important Notes:

1. **Free Tier Limitations:**
   - Render free tier: Services sleep after 15 minutes of inactivity
   - Netlify free tier: 100GB bandwidth, 300 build minutes/month

2. **Backend Sleep on Render:**
   - First request after sleep may take 30-60 seconds to wake up
   - Consider upgrading to paid plan for always-on service

3. **Environment Variables:**
   - Never commit `.env` files to Git
   - Always use environment variables for sensitive data

4. **MongoDB Atlas:**
   - Free tier has limitations (512MB storage, shared cluster)
   - Monitor your usage in Atlas dashboard

5. **Security:**
   - Use strong JWT secrets
   - Never expose MongoDB credentials
   - Use HTTPS in production (automatic with Render and Netlify)

---

## Quick Reference:

- **Backend URL:** `https://your-backend-name.onrender.com`
- **Frontend URL:** `https://your-site-name.netlify.app`
- **Frontend Env Var:** `VITE_API_URL=https://your-backend-name.onrender.com`
- **Backend Env Vars:** `MongoURI`, `JWT_SECRET`, `NODE_ENV`, `PORT`

---

## Need Help?

- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

**Good luck with your deployment! 🚀**
