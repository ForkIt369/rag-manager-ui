# RAG Manager Production Setup Guide

This guide will walk you through setting up your RAG Manager for production use with Convex backend and document upload functionality.

## 🚀 Prerequisites

1. **Convex Account**: Sign up at [convex.dev](https://convex.dev)
2. **Vercel Account**: For deployment (or any other hosting platform)
3. **API Keys**: OpenAI, Anthropic, or other AI provider keys for embeddings

## 📋 Step 1: Set Up Convex Backend

### 1.1 Install Convex CLI
```bash
npm install -g convex
```

### 1.2 Initialize Convex in Your Project
```bash
cd rag-manager-ui
npx convex dev
```

This will:
- Create a new Convex project
- Generate the `convex/_generated` directory
- Provide you with a deployment URL

### 1.3 Update Environment Variables
Update your `.env.local` and `.env.production` files:

```env
# Replace with your actual Convex deployment URL
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud

# Add your AI provider API keys (for server-side use)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## 📤 Step 2: Deploy Convex Functions

### 2.1 Deploy Schema and Functions
```bash
npx convex deploy
```

This will deploy:
- Database schema (`convex/schema.ts`)
- Document management functions (`convex/documents.ts`)
- Chunk management functions (`convex/chunks.ts`)
- Query tracking functions (`convex/queries.ts`)
- Analytics functions (`convex/analytics.ts`)

## 🔧 Step 3: Configure File Storage

### 3.1 Enable Convex File Storage
In your Convex dashboard:
1. Go to Settings → Storage
2. Enable file storage
3. Note the storage limits for your plan

### 3.2 Update Upload Function
Modify `convex/documents.ts` to handle actual file uploads:

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveFile = mutation({
  args: { 
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert("documents", {
      title: args.fileName,
      fileId: args.storageId,
      fileName: args.fileName,
      fileSize: args.fileSize,
      fileType: args.fileType,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      source: "manual_upload",
    });
    
    // Trigger processing action here
    await ctx.scheduler.runAfter(0, "actions/processDocument", { documentId });
    
    return { documentId };
  },
});
```

## 🤖 Step 4: Set Up Document Processing

### 4.1 Create Processing Action
Create `convex/actions/processDocument.ts`:

```typescript
import { action } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export default action({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    // Get document
    const document = await ctx.runQuery(internal.documents.get, { 
      id: args.documentId 
    });
    
    if (!document || !document.fileId) {
      throw new Error("Document not found");
    }
    
    // Get file content
    const fileUrl = await ctx.storage.getUrl(document.fileId);
    
    // Process document (implement your logic here)
    // 1. Extract text from file
    // 2. Split into chunks
    // 3. Generate embeddings
    // 4. Store chunks with embeddings
    
    // Update document status
    await ctx.runMutation(internal.documents.updateStatus, {
      id: args.documentId,
      status: "completed",
    });
  },
});
```

## 🌐 Step 5: Deploy to Production

### 5.1 Environment Variables on Vercel
1. Go to your Vercel project settings
2. Add environment variables:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `OPENAI_API_KEY` (if using server-side processing)
   - Any other API keys

### 5.2 Deploy
```bash
vercel --prod
```

## 🔐 Step 6: Security Configuration

### 6.1 Set Up Convex Auth (Optional)
If you want to add authentication:

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.AUTH0_DOMAIN,
      applicationID: process.env.AUTH0_CLIENT_ID,
    },
  ],
};
```

### 6.2 Secure Your Functions
Add authentication checks to sensitive mutations:

```typescript
export const deleteDocument = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    
    // Delete logic...
  },
});
```

## 📊 Step 7: Set Up Monitoring

### 7.1 Convex Dashboard
Monitor your app at: https://dashboard.convex.dev
- View function logs
- Monitor database usage
- Track file storage

### 7.2 Error Tracking
Consider adding Sentry or similar:

```bash
npm install @sentry/nextjs
```

## 🧪 Step 8: Test Your Deployment

### 8.1 Test Document Upload
1. Navigate to https://your-app.vercel.app/dashboard/upload
2. Upload a test document
3. Check Convex dashboard for:
   - Document record created
   - File stored in storage
   - Processing status

### 8.2 Test Search
1. Navigate to /dashboard/query
2. Search for content from uploaded documents
3. Verify results are returned

### 8.3 Check Analytics
1. Navigate to /dashboard/analytics
2. Verify stats are updating

## 🚨 Troubleshooting

### Common Issues:

1. **"NEXT_PUBLIC_CONVEX_URL is not set"**
   - Ensure environment variable is set in Vercel
   - Rebuild and redeploy

2. **Document upload fails**
   - Check Convex storage is enabled
   - Verify file size is within limits
   - Check browser console for errors

3. **Search returns no results**
   - Ensure documents are processed (status: "completed")
   - Check embeddings are generated
   - Verify vector search is implemented

4. **Analytics show zeros**
   - Ensure Convex functions are deployed
   - Check function logs for errors
   - Verify queries are being tracked

## 📚 Next Steps

1. **Implement Vector Search**: Add embedding generation and vector search
2. **Add Authentication**: Secure your application with user auth
3. **Optimize Performance**: Add caching and optimize queries
4. **Scale Storage**: Consider external storage for large files

## 🆘 Support

- Convex Documentation: https://docs.convex.dev
- Next.js Documentation: https://nextjs.org/docs
- GitHub Issues: [Your repo]/issues

---

## Production Checklist

- [ ] Convex project created and deployed
- [ ] Environment variables set in production
- [ ] File storage enabled
- [ ] Document processing implemented
- [ ] Search functionality working
- [ ] Analytics tracking properly
- [ ] Error handling in place
- [ ] Security measures implemented
- [ ] Monitoring set up
- [ ] Backup strategy defined