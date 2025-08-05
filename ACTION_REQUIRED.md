# ⚠️ ACTION REQUIRED: Set Environment Variables

## Issue Identified
Your PDFs are not being processed correctly because the PDF.co API key is not set in your Convex production environment.

## What's Happening
- Documents are being uploaded ✅
- PDF content extraction is failing ❌ 
- Chunks contain placeholder text instead of real content
- Embeddings cannot be generated without real content

## Solution: Set Environment Variables in Convex Dashboard

### 1. Go to Convex Dashboard
Open this URL in your browser:
**https://dashboard.convex.dev/d/artful-ibis-284/settings/environment-variables**

### 2. Add These Environment Variables

Click "Add environment variable" and add:

#### PDFCO_API_KEY
```
will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a
```

#### VOYAGE_API_KEY  
```
pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P
```

### 3. Save Changes
Click "Save" after adding both variables.

## After Setting Variables

Run these commands to re-process your documents:

```bash
# Delete existing documents and re-upload
node delete-all-documents.js

# Or re-process existing documents
node reprocess-documents.js

# Wait 1 minute, then check status
node check-uploaded-docs.js
```

## Verification
After reprocessing, chunks should contain actual PDF text like:
- "In this book, I share the principles that have..." (from Principles.pdf)
- "Marketing is the strategy you use for..." (from Marketing Plan)
- "Agile marketing is about adapting quickly..." (from Hacking Marketing)

Instead of placeholder text like:
- "Content from Principles.pdf"

## Current Status
- ✅ PDF parser code is fixed and deployed
- ✅ Improved fallback extraction implemented
- ⏳ Waiting for environment variables to be set
- ⏳ Documents need to be re-processed after setting variables

## Need Help?
If you've set the environment variables and documents still aren't processing:
1. Check the Convex logs: `npx convex logs`
2. Run the diagnostic: `node test-pdfco-api.js`
3. Verify API keys are correct in the dashboard