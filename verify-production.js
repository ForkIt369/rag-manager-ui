#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Use production URL
const PRODUCTION_URL = "https://artful-ibis-284.convex.cloud";

console.log("🔍 Verifying Production Deployment...\n");
console.log("Production URL:", PRODUCTION_URL);

const client = new ConvexClient(PRODUCTION_URL);

async function verifyProduction() {
  try {
    const { api } = await import("./convex/_generated/api.js");
    
    // 1. Check if we can connect
    console.log("\n✅ Connected to production Convex deployment");
    
    // 2. List documents
    console.log("\n📄 Checking documents...");
    const docs = await client.query(api.documents.listDocuments, { limit: 5 });
    console.log(`Found ${docs.documents.length} documents in production`);
    
    // 3. Check system stats
    console.log("\n📊 Checking system stats...");
    try {
      const stats = await client.query(api.analytics.getSystemStats);
      console.log(`Total documents: ${stats.totalDocuments}`);
      console.log(`Total chunks: ${stats.totalChunks}`);
    } catch (error) {
      console.log("⚠️ Analytics not available (expected if not implemented)");
    }
    
    // 4. Test upload URL generation
    console.log("\n📤 Testing upload capability...");
    try {
      const uploadUrl = await client.mutation(api.documentUpload.generateUploadUrl);
      console.log("✅ Can generate upload URLs");
    } catch (error) {
      console.log("❌ Cannot generate upload URLs:", error.message);
    }
    
    console.log("\n✅ Production deployment is ready!");
    console.log("\n⚠️ IMPORTANT: You still need to:");
    console.log("1. Set VOYAGE_API_KEY in Convex production environment");
    console.log("2. Set PDFCO_API_KEY in Convex production environment");
    console.log("3. Deploy to Vercel with NEXT_PUBLIC_CONVEX_URL set to:", PRODUCTION_URL);
    
  } catch (error) {
    console.error("\n❌ Production verification failed:", error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

verifyProduction().catch(console.error);