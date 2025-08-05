#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Use production URL
const PRODUCTION_URL = "https://artful-ibis-284.convex.cloud";
const client = new ConvexClient(PRODUCTION_URL);

async function reprocessDocuments() {
  const { api } = await import("./convex/_generated/api.js");
  
  console.log("🔄 Re-processing Documents in Production\n");
  console.log("=" .repeat(60));
  
  try {
    // Get all documents
    const docs = await client.query(api.documents.listDocuments, { limit: 10 });
    
    console.log(`Found ${docs.documents.length} documents\n`);
    
    for (const doc of docs.documents) {
      console.log(`\n📄 ${doc.fileName}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Chunks: ${doc.chunkCount || 0}`);
      
      if (doc.status === "completed" && doc.fileId) {
        console.log(`   Re-processing document...`);
        
        try {
          // Trigger re-processing
          await client.action(api.actions.documentProcessor.processDocument, {
            documentId: doc._id
          });
          
          console.log(`   ✅ Re-processing triggered`);
        } catch (error) {
          console.log(`   ❌ Failed to trigger re-processing: ${error.message}`);
        }
      }
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("\n⏳ Documents are being re-processed.");
    console.log("Wait 30-60 seconds and then run:");
    console.log("   node check-uploaded-docs.js");
    console.log("\nTo monitor progress in real-time:");
    console.log("   npx convex logs --history 50");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
  
  process.exit(0);
}

reprocessDocuments().catch(console.error);