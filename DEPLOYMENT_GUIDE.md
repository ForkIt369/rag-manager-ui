# RAG Manager UI - Deployment Guide

This guide will help you deploy the RAG Manager UI to various platforms.

## 🚀 Quick Deployment on Vercel (Recommended)

### Prerequisites
- Vercel account
- GitHub repository with your code
- Convex deployment URL

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: RAG Manager UI"
   git branch -M main
   git remote add origin https://github.com/yourusername/rag-manager-ui.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL

3. **Environment Variables**
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## 🐳 Docker Deployment

### Dockerfile
Create a `Dockerfile` in the project root:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Commands
```bash
# Build the image
docker build -t rag-manager-ui .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_CONVEX_URL=your-convex-url rag-manager-ui
```

## 🌐 Manual Deployment

### Prerequisites
- Node.js 18+
- PM2 (optional, for process management)

### Steps

1. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/rag-manager-ui.git
   cd rag-manager-ui
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Convex URL
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Production Server**
   ```bash
   npm start
   # Or with PM2
   pm2 start npm --name "rag-manager-ui" -- start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes | `https://hopeful-hamster-123.convex.cloud` |
| `NODE_ENV` | Environment mode | No | `production` |

### Convex Backend Integration

Ensure your Convex backend has the following functions deployed:

#### Required Functions
- `documents:upload` - Document upload handler
- `documents:list` - List documents with filtering
- `documents:get` - Get single document
- `documents:delete` - Delete document
- `vectorSearch:search` - Basic vector search
- `vectorSearchV2:search` - Enhanced vector search
- `documentSections:list` - Get document sections
- `files:list` - List uploaded files
- `files:delete` - Delete files

#### Optional Functions (for full functionality)
- `memories:list` - List memories
- `memories:create` - Create new memory

### Custom Domain (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all environment variables are set correctly
   - Ensure Node.js version is 18 or higher
   - Clear node_modules: `rm -rf node_modules && npm install`

2. **Convex Connection Issues**
   - Verify `NEXT_PUBLIC_CONVEX_URL` is correct
   - Check Convex deployment is active
   - Ensure required functions are deployed

3. **Styling Issues**
   - Clear Next.js cache: `rm -rf .next`
   - Rebuild: `npm run build`

4. **Performance Issues**
   - Enable compression in your hosting platform
   - Configure CDN for static assets
   - Implement caching strategies

### Health Check Endpoint

The application doesn't include a built-in health check, but you can test with:

```bash
curl http://your-domain.com
```

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance metrics
- Track user engagement

### Custom Monitoring
Consider implementing:
- Error tracking (Sentry, Bugsnag)
- Performance monitoring (DataDog, New Relic)
- User analytics (Google Analytics, Mixpanel)

## 🔒 Security Considerations

### Production Checklist
- [ ] API keys stored securely (not in client-side code)
- [ ] HTTPS enabled
- [ ] Content Security Policy configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error messages don't expose sensitive data

### Security Headers
Add these headers to your deployment:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 📈 Scaling

### Performance Optimization
- Enable Edge Caching
- Implement Service Workers
- Optimize images with next/image
- Use dynamic imports for code splitting

### Infrastructure Scaling
- Use CDN for static assets
- Implement horizontal scaling
- Consider serverless deployment
- Monitor and optimize database queries

## 🎯 Next Steps

After deployment:
1. Set up monitoring and alerting
2. Configure backup strategies
3. Implement CI/CD pipelines
4. Set up staging environments
5. Plan for disaster recovery

---

For additional support, check the main README.md or create an issue in the repository.