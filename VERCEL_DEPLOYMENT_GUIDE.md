# Vercel Deployment Guide

## Prerequisites
- Your project is pushed to a GitHub repository
- You have a Vercel account (free tier available)

## Step 1: Fix the PDF Worker Issue ✅
The PDF worker issue has been fixed by updating the postinstall script in `package.json` to use the correct file extension (`.mjs` instead of `.js`).

## Step 2: Configure Environment Variables
Before deploying, you need to set up your environment variables in Vercel:

1. Go to your Vercel dashboard
2. Create a new project or select your existing project
3. Go to Settings → Environment Variables
4. Add the following environment variable:
   - **Name**: `REACT_APP_API_BASE_URL`
   - **Value**: Your production API endpoint (e.g., `https://your-backend-domain.com/api`)
   - **Environment**: Production (and Preview if needed)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a React app
5. Configure the environment variables as mentioned above
6. Click "Deploy"

### Option B: Deploy via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

## Step 4: Configure Custom Domain (Optional)
1. In your Vercel dashboard, go to your project
2. Go to Settings → Domains
3. Add your custom domain
4. Follow the DNS configuration instructions

## Important Notes

### API Configuration
- The app is configured to use environment variables for the API base URL
- In development, it defaults to `http://localhost/scms_new/index.php/api`
- For production, set `REACT_APP_API_BASE_URL` to your actual backend API endpoint

### Build Configuration
- The `vercel.json` file is configured for optimal React app deployment
- Static files are properly routed
- Client-side routing is supported (all routes fall back to `index.html`)

### Troubleshooting

#### If deployment fails:
1. Check the build logs in Vercel dashboard
2. Ensure all environment variables are set correctly
3. Verify that your backend API is accessible from Vercel's servers

#### If the app loads but API calls fail:
1. Check that `REACT_APP_API_BASE_URL` is set correctly
2. Ensure your backend API supports CORS from your Vercel domain
3. Verify your backend is running and accessible

#### If PDF functionality doesn't work:
1. The PDF worker file should be automatically copied during build
2. Check that `pdf.worker.js` exists in the `public` folder after build

## Files Modified for Deployment
- `package.json`: Updated postinstall script to use correct PDF worker file
- `src/services/api.js`: Added environment variable support for API base URL
- `vercel.json`: Added proper configuration for React app deployment
- `env.example`: Created example environment file

## Next Steps
1. Set up your environment variables in Vercel
2. Deploy your project
3. Test all functionality, especially API calls
4. Configure your backend to accept requests from your Vercel domain