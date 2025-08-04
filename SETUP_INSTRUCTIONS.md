# BroVerse Rag UI - Setup Instructions

## 🚀 Quick Setup Guide

### 1. Create GitHub Repository

Since we hit the API rate limit, please manually create a GitHub repository:

1. Go to https://github.com/new
2. Repository name: `broverse-rag-ui`
3. Description: "BroVerse Rag - The Ultimate Knowledge Intelligence Platform with document management, knowledge base, and analytics"
4. Set as Public repository
5. **DON'T** initialize with README (we already have one)
6. Click "Create repository"

### 2. Push to GitHub

After creating the repository, run these commands in your terminal:

```bash
cd "/Users/digitaldavinci/Personal Projects/Convex Rag/broverse-rag-ui"

# Add your GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/broverse-rag-ui.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Confirm project path
# - Link to existing project or create new
# - Configure project settings
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository: `broverse-rag-ui`
3. Configure environment variables:
   ```
   NEXT_PUBLIC_CONVEX_URL=https://artful-ibis-284.convex.cloud
   ```
4. Click "Deploy"

### 4. Environment Variables

Make sure to set these environment variables in Vercel:

- `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL (https://artful-ibis-284.convex.cloud)
- `NEXT_PUBLIC_APP_URL`: Your Vercel app URL (will be generated after deployment)

### 5. Post-Deployment

After deployment:

1. Visit your Vercel app URL
2. Test the document upload functionality
3. Verify the connection to your Convex backend
4. Check all features are working properly

## 📝 Local Development

To run locally:

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Convex URL
# NEXT_PUBLIC_CONVEX_URL=https://artful-ibis-284.convex.cloud

# Start development server
npm run dev
```

## 🔧 Troubleshooting

### Common Issues:

1. **Convex Connection Error**
   - Verify your Convex URL in environment variables
   - Ensure your Convex backend is deployed and running

2. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (requires 18.x or higher)

3. **Vercel Deployment Issues**
   - Check build logs in Vercel dashboard
   - Ensure all environment variables are set correctly

## 📚 Next Steps

1. Customize the UI theme in `tailwind.config.ts`
2. Add more document parsers if needed
3. Implement additional analytics features
4. Set up custom domain in Vercel

## 🤝 Support

If you encounter any issues:
1. Check the deployment logs
2. Review the README.md for detailed documentation
3. Open an issue in the GitHub repository

---

Happy deploying! 🎉