#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Use production URL
const PRODUCTION_URL = "https://artful-ibis-284.convex.cloud";
const client = new ConvexClient(PRODUCTION_URL);

async function deleteAllDocuments() {
  const { api } = await import("./convex/_generated/api.js");
  
  console.log("🗑️  Deleting All Documents in Production\n");
  console.log("=" .repeat(60));
  
  try {
    // Get all documents
    const docs = await client.query(api.documents.listDocuments, { limit: 100 });
    
    console.log(`Found ${docs.documents.length} documents to delete\n`);
    
    if (docs.documents.length === 0) {
      console.log("No documents to delete.");
      return;
    }
    
    for (const doc of docs.documents) {
      console.log(`🗑️  Deleting: ${doc.fileName}`);
      
      try {
        // Delete the document
        await client.mutation(api.documents.deleteDocument, {
          id: doc._id
        });
        
        console.log(`   ✅ Deleted successfully`);
      } catch (error) {
        console.log(`   ❌ Failed to delete: ${error.message}`);
      }
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("\n✅ Document deletion complete.");
    console.log("\n📝 Next Steps:");
    console.log("1. Set environment variables in Convex Dashboard:");
    console.log("   https://dashboard.convex.dev/d/artful-ibis-284/settings/environment-variables");
    console.log("\n2. Add these variables:");
    console.log("   PDFCO_API_KEY: will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a");
    console.log("   VOYAGE_API_KEY: pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P");
    console.log("\n3. Re-upload your documents through the dashboard:");
    console.log("   https://rag-manager-o4cpuaud3-will31s-projects.vercel.app/dashboard/upload");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
  
  process.exit(0);
}

deleteAllDocuments().catch(console.error);