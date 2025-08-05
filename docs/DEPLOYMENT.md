# Production Deployment Guide

## Prerequisites
- Vercel account
- Convex account (already set up)

## Production URLs
- **Convex Production URL**: `https://artful-ibis-284.convex.cloud`
- **Convex Dev URL**: `https://gallant-owl-121.convex.cloud`

## Environment Variables

### Required for Vercel Production Deployment

Add these environment variables in your Vercel project settings:

```bash
# Convex Production URL
NEXT_PUBLIC_CONVEX_URL=https://artful-ibis-284.convex.cloud

# API Keys (add these in Convex Dashboard > Settings > Environment Variables)
# These should be set in Convex, not Vercel for security
VOYAGE_API_KEY=pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P
PDFCO_API_KEY=will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a
```

## Deployment Steps

### 1. Deploy to Convex Production
```bash
npx convex deploy -y
```

### 2. Set Production Environment Variables in Convex Dashboard

Go to: https://dashboard.convex.dev/d/artful-ibis-284/settings/environment-variables

Add:
- `VOYAGE_API_KEY`: `pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P`
- `PDFCO_API_KEY`: `will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a`

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
vercel --prod
```

#### Option B: Git Push (if connected to GitHub)
```bash
git add .
git commit -m "Deploy RAG Manager to production"
git push origin main
```

### 4. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add for Production environment:
   - `NEXT_PUBLIC_CONVEX_URL`: `https://artful-ibis-284.convex.cloud`

### 5. Verify Deployment

After deployment, test the following:

1. **Document Upload**: Upload a test document
2. **Processing**: Verify document processes successfully
3. **Search**: Test vector search functionality
4. **Analytics**: Check system statistics

## Monitoring

### Check Convex Logs
```bash
# Development logs
npx convex logs

# Production logs (switch to production deployment first)
CONVEX_DEPLOYMENT=artful-ibis-284 npx convex logs
```

### Check Processing Status
```bash
node check-processing-status.js
```

### Test Search
```bash
node test-search.js
```

## Troubleshooting

### If embeddings fail:
1. Check VOYAGE_API_KEY is set in Convex production environment
2. Verify API key is valid at https://dash.voyageai.com

### If PDF processing fails:
1. Check PDFCO_API_KEY is set in Convex production environment
2. Verify API key is valid at https://app.pdf.co/api-console

### If deployment fails:
1. Check `npx convex deploy` output for schema errors
2. Ensure all environment variables are set
3. Verify Convex production URL in vercel.json

## Security Notes

- Never commit API keys to git
- API keys should be stored in Convex environment variables, not in Vercel
- Use `.env.local` for local development only
- Production keys should be different from development keys (when possible)