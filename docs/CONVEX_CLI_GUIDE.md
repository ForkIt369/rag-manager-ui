# Convex CLI Complete Guide for RAG Manager

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Environment Management](#environment-management)
3. [Deployment Commands](#deployment-commands)
4. [Data Management](#data-management)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)
7. [RAG-Specific Operations](#rag-specific-operations)

---

## Installation & Setup

### Initial Installation
```bash
npm install convex
```

### First-Time Setup
```bash
npx convex dev
# This will:
# - Prompt for authentication
# - Create a new project or connect to existing
# - Set up convex/ directory
# - Create .env.local with deployment URLs
```

### Login/Logout
```bash
npx convex logout  # Remove credentials
npx convex dev     # Re-authenticate
```

---

## Environment Management

### Managing Environment Variables

#### List All Variables
```bash
# Development environment
npx convex env list

# Production environment  
npx convex env list --prod
```

#### Set Variables
```bash
# Development
npx convex env set KEY_NAME "value"

# Production (IMPORTANT: use --prod flag)
npx convex env set KEY_NAME "value" --prod

# Examples for our RAG system:
npx convex env set PDFCO_API_KEY "your-api-key" --prod
npx convex env set VOYAGE_API_KEY "your-api-key" --prod
```

#### Get Specific Variable
```bash
npx convex env get KEY_NAME
npx convex env get KEY_NAME --prod
```

#### Remove Variables
```bash
npx convex env remove KEY_NAME
npx convex env remove KEY_NAME --prod
```

### Important Environment Variables for RAG
- `PDFCO_API_KEY` - PDF.co API for document processing
- `VOYAGE_API_KEY` - Voyage AI for embeddings
- `CONVEX_CLOUD_URL` - Auto-set deployment URL
- `CONVEX_SITE_URL` - Auto-set site URL for HTTP actions

---

## Deployment Commands

### Development Server
```bash
# Start dev server (watches for changes)
npx convex dev

# With specific log settings
npx convex dev --tail-logs always   # Show all logs
npx convex dev --tail-logs disable  # No logs
```

### Production Deployment
```bash
# Deploy to production (default)
npx convex deploy

# With confirmation skip
npx convex deploy --yes

# With build command
npx convex deploy --cmd "npm run build"

# With custom environment variable for build
npx convex deploy --cmd "npm run build" --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
```

### Preview Deployments
```bash
# Create preview deployment
npx convex deploy --preview-create branch-name

# Run function after preview deployment
npx convex deploy --preview-run seedFunction
```

---

## Data Management

### View Data
```bash
# List all tables
npx convex data

# View specific table
npx convex data documents
npx convex data chunks
npx convex data processingJobs
```

### Import Data
```bash
# Import to specific table
npx convex import --table documents data.jsonl

# Import complete backup
npx convex import backup.zip
```

### Export Data
```bash
# Export to directory
npx convex export --path ./backups

# Export as zip
npx convex export --path backup.zip

# Include file storage
npx convex export --include-file-storage --path backup.zip
```

---

## Development Workflow

### Run Functions Directly
```bash
# Run query/mutation/action
npx convex run functionName '{"arg1": "value1"}'

# Examples for RAG:
npx convex run documents:listDocuments '{"limit": 10}'
npx convex run chunks:getAllChunks '{"limit": 100}'
```

### View Logs
```bash
# Development logs
npx convex logs

# Production logs
npx convex logs --prod

# With history
npx convex logs --history 50
npx convex logs --prod --history 100
```

### Generate Types
```bash
# Update TypeScript types without deploying
npx convex codegen
```

### Open Dashboard
```bash
npx convex dashboard
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Wrong Deployment Target
```bash
# Check current deployment
cat .env.local | grep CONVEX_DEPLOYMENT

# For production operations, always use --prod
npx convex env set KEY "value" --prod
npx convex deploy --yes
```

#### 2. Environment Variables Not Working
```bash
# Verify they're set in production
npx convex env list --prod

# Re-deploy after setting
npx convex deploy --yes
```

#### 3. Authentication Issues
```bash
# Re-authenticate
npx convex logout
npx convex dev
```

#### 4. Check Function Errors
```bash
# View recent errors
npx convex logs --prod --history 50 | grep -i error
```

---

## RAG-Specific Operations

### Document Processing Pipeline

#### 1. Set API Keys (One-time setup)
```bash
npx convex env set PDFCO_API_KEY "your-pdfco-key" --prod
npx convex env set VOYAGE_API_KEY "your-voyage-key" --prod
```

#### 2. Deploy Updated Functions
```bash
npx convex deploy --yes
```

#### 3. Monitor Document Processing
```bash
# Watch logs during processing
npx convex logs --prod

# Check processing jobs
npx convex run processingJobs:list --prod
```

#### 4. Verify Chunks and Embeddings
```bash
# Check chunk count
npx convex data chunks --prod

# Run custom verification
npx convex run chunks:getDocumentChunks '{"documentId": "doc_id"}' --prod
```

### Search Testing
```bash
# Test vector search
npx convex run actions.vectorSearch:search '{"query": "marketing strategy", "limit": 5}' --prod
```

### Maintenance Tasks

#### Clear All Documents
```bash
# Run custom function to clear data
npx convex run documents:deleteAll --prod
```

#### Re-process Documents
```bash
# Trigger reprocessing
npx convex run actions.documentProcessor:processDocument '{"documentId": "id"}' --prod
```

---

## Best Practices

### 1. Always Use --prod for Production
```bash
# ❌ Wrong - affects dev
npx convex env set KEY "value"

# ✅ Correct - affects production
npx convex env set KEY "value" --prod
```

### 2. Verify Before Deploying
```bash
# Check what will be deployed
npx convex deploy --dry-run

# Then deploy
npx convex deploy --yes
```

### 3. Backup Before Major Changes
```bash
npx convex export --path ./backup-$(date +%Y%m%d).zip --prod
```

### 4. Use Environment Files for Different Stages
```bash
# .env.local - development
# .env.prod - production reference (don't commit secrets)
npx convex deploy --env-file .env.prod
```

---

## Quick Reference Card

### Essential Commands for RAG Management
```bash
# Setup
npm install convex
npx convex dev

# Environment Variables (Production)
npx convex env list --prod
npx convex env set PDFCO_API_KEY "key" --prod
npx convex env set VOYAGE_API_KEY "key" --prod

# Deploy
npx convex deploy --yes

# Monitor
npx convex logs --prod
npx convex data documents
npx convex data chunks

# Backup
npx convex export --path backup.zip --prod
```

---

## Deployment URLs

### Development
- Dashboard: Run `npx convex dashboard`
- Logs: `npx convex logs`
- Deployment: gallant-owl-121

### Production
- Dashboard: https://dashboard.convex.dev/d/artful-ibis-284
- App: https://rag-manager-o4cpuaud3-will31s-projects.vercel.app
- Deployment: artful-ibis-284

---

## Notes for Our RAG System

1. **PDF Processing**: Requires PDFCO_API_KEY in production environment
2. **Embeddings**: Requires VOYAGE_API_KEY in production environment
3. **File Storage**: Files are stored in Convex storage, accessible via fileId
4. **Vector Search**: Uses Convex's native vector index with 1024 dimensions
5. **Chunking**: Configured for 1000 tokens with 200 overlap

---

Last Updated: 2025-08-05