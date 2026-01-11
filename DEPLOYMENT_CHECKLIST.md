# Deployment Checklist - Quick Reference

Use this checklist to track your deployment progress.

## ✅ Pre-Deployment Setup

- [ ] Code is pushed to GitHub repository
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and configured
- [ ] MongoDB connection string obtained
- [ ] JWT secret generated (use `openssl rand -hex 32`)

---

## 🔧 Backend Deployment (Render)

- [ ] Render account created and logged in
- [ ] New Web Service created in Render
- [ ] Repository connected to Render
- [ ] Root directory set to `server`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables set:
  - [ ] `MongoURI` = (your MongoDB connection string)
  - [ ] `JWT_SECRET` = (your secure random string)
  - [ ] `NODE_ENV` = `production`
- [ ] Deployment completed successfully
- [ ] Backend URL noted: `https://_________________.onrender.com`
- [ ] Backend tested (visit URL, should see "Hello from server.")

---

## 🎨 Frontend Deployment (Netlify)

- [ ] Netlify account created and logged in
- [ ] New site created from GitHub repository
- [ ] Build settings configured:
  - [ ] Base directory: `frontend` (or leave empty if root)
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] Environment variable set:
  - [ ] `VITE_API_URL` = (your Render backend URL)
- [ ] Deployment completed successfully
- [ ] Frontend URL noted: `https://_________________.netlify.app`
- [ ] Frontend tested (visit URL)

---

## 🔄 Post-Deployment Configuration

- [ ] Backend CORS updated with Netlify URL
- [ ] `FRONTEND_URL` environment variable added to Render (your Netlify URL)
- [ ] Backend redeployed with new CORS settings
- [ ] Tested login/signup functionality
- [ ] Verified API calls work from frontend
- [ ] Checked browser console for errors

---

## 🧪 Testing Checklist

- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] Login functionality works
- [ ] Signup functionality works
- [ ] API calls succeed
- [ ] No CORS errors in browser console
- [ ] MongoDB connection works

---

## 📝 Notes

**Backend URL:** _________________________________

**Frontend URL:** _________________________________

**MongoDB Cluster:** _________________________________

**JWT Secret:** _________________________________

---

## ⚠️ Common Issues to Check

- [ ] CORS errors → Update backend CORS configuration
- [ ] API calls failing → Check `VITE_API_URL` in Netlify
- [ ] Backend not starting → Check Render logs and environment variables
- [ ] Build failures → Check Node version and dependencies
- [ ] Slow first request → Backend may be sleeping (Render free tier)

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed
