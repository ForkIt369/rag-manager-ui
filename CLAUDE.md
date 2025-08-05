# Claude Memory - RAG Manager Project

## Project Overview
This is a sophisticated RAG (Retrieval-Augmented Generation) system built with:
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (BaaS platform with real-time database)
- **Document Processing**: PDF.co API for PDF extraction
- **Embeddings**: Voyage AI (voyage-3 model, 1024 dimensions)
- **Vector Search**: Convex native vector indexing with cosine similarity
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)

## Key URLs
- **Production App**: https://rag-manager-o4cpuaud3-will31s-projects.vercel.app
- **Convex Dashboard**: https://dashboard.convex.dev/d/artful-ibis-284
- **GitHub**: https://github.com/ForkIt369/rag-manager-ui

## Deployment Information
- **Dev Deployment**: gallant-owl-121
- **Prod Deployment**: artful-ibis-284
- **Vercel Project**: rag-manager-ui

## Critical API Keys (Set in Production)
- **PDFCO_API_KEY**: will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a
- **VOYAGE_API_KEY**: pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P

## Convex CLI Commands (Most Important)

### Environment Variable Management
```bash
# ALWAYS use --prod flag for production operations
npx convex env set KEY_NAME "value" --prod
npx convex env list --prod
npx convex env get KEY_NAME --prod
npx convex env remove KEY_NAME --prod
```

### Deployment
```bash
# Deploy to production (default)
npx convex deploy --yes

# Deploy with frontend build
npx convex deploy --cmd "npm run build"

# Start dev server
npx convex dev
```

### Data Operations
```bash
# View tables
npx convex data documents
npx convex data chunks

# Export/Import
npx convex export --path backup.zip --prod
npx convex import --table documents data.jsonl
```

### Monitoring
```bash
# Production logs
npx convex logs --prod --history 50

# Run functions directly
npx convex run functionName '{"arg": "value"}' --prod
```

## Document Processing Pipeline

### Architecture
1. **Upload**: Files stored in Convex storage
2. **Parse**: PDF.co API extracts text (with OCR support)
3. **Chunk**: Semantic chunking (1000 tokens, 200 overlap)
4. **Embed**: Voyage AI generates 1024-dim embeddings
5. **Store**: Chunks with embeddings in vector-indexed table
6. **Search**: Cosine similarity search on embeddings

### File Support
- ✅ PDF (via PDF.co with OCR)
- ✅ DOCX, XLSX, CSV (via custom parsers)
- ✅ TXT, MD, HTML, JSON (text-based)
- ❌ EPUB (not supported)

### Rate Limits
- PDF.co: 2 requests/second
- Voyage AI: 30 requests/second

## Common Tasks

### Reset and Re-process Documents
```bash
# Delete all documents
node delete-all-documents.js

# Re-upload via dashboard
# https://rag-manager-o4cpuaud3-will31s-projects.vercel.app/dashboard/upload

# Check status
node check-uploaded-docs.js
```

### Test Search
```bash
node test-search.js
```

### Debug PDF Processing
```bash
node test-pdfco-api.js
```

## Project Structure
```
rag-manager-ui/
├── src/
│   ├── app/                 # Next.js app router
│   │   └── dashboard/       # Main UI pages
│   ├── components/          # React components
│   └── lib/                 # Utilities
├── convex/
│   ├── _generated/         # Auto-generated Convex types
│   ├── actions/            # Convex actions (Node.js)
│   │   ├── documentProcessor.ts
│   │   ├── vectorSearch.ts
│   │   ├── parsers/        # File parsers
│   │   ├── chunkers/       # Text chunking
│   │   └── lib/            # Utilities (voyage, pdfco)
│   ├── schema.ts           # Database schema
│   ├── documents.ts        # Document mutations/queries
│   ├── chunks.ts           # Chunk operations
│   └── processingJobs.ts   # Job tracking
└── docs/                   # Documentation
```

## Known Issues & Solutions

### Issue: PDFs show placeholder text
**Cause**: PDF.co API key not set in production
**Solution**: 
```bash
npx convex env set PDFCO_API_KEY "key" --prod
npx convex env set VOYAGE_API_KEY "key" --prod
```

### Issue: No embeddings generated
**Cause**: Voyage API key not set or invalid content
**Solution**: Check API key and verify chunks have real content

### Issue: Vector search errors
**Cause**: Incorrect vector search syntax
**Solution**: Use proper Convex vector search with filter:
```typescript
.withIndex("vector_search", (q) => 
  q.vectorSearch("embedding", queryEmbedding)
   .filter((q) => q.eq(q.field("documentId"), docId))
)
```

## Testing Commands
```bash
# Core functionality tests
npm run lint          # Linting
npm run typecheck    # Type checking
npm test            # Run tests

# RAG-specific tests
node test-pipeline.js              # Test full pipeline
node test-search.js               # Test vector search
node check-uploaded-docs.js      # Check document status
node test-pdfco-api.js           # Test PDF.co directly
```

## Deployment Process
1. Make changes locally
2. Test with `npx convex dev`
3. Deploy backend: `npx convex deploy --yes`
4. Deploy frontend: `vercel --prod`
5. Verify at production URL

## Important Notes
- **ALWAYS** use `--prod` flag for production Convex operations
- Environment variables must be set via Convex CLI or dashboard, not in code
- PDF.co requires uploading files to their temporary storage first
- Convex storage URLs are not publicly accessible (need authentication)
- Vector dimensions must be 1024 for Voyage AI voyage-3 model

## Recent Updates (2025-08-05)
- Fixed PDF extraction fallback mechanism
- Added comprehensive error logging
- Set production environment variables via CLI
- Created diagnostic scripts for troubleshooting
- Improved chunk content validation
- Successfully configured PDF.co and Voyage AI integration

---
*This file helps Claude understand the project context and remember important details across conversations.*