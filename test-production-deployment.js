#!/usr/bin/env node

console.log("🚀 Testing Production Deployment\n");
console.log("=====================================\n");

const productionUrls = {
  vercel: "https://rag-manager-o4cpuaud3-will31s-projects.vercel.app",
  convex: "https://artful-ibis-284.convex.cloud"
};

console.log("Production URLs:");
console.log("- Vercel App:", productionUrls.vercel);
console.log("- Convex Backend:", productionUrls.convex);

async function testProduction() {
  try {
    // Test Vercel deployment
    console.log("\n1. Testing Vercel Deployment...");
    const response = await fetch(productionUrls.vercel);
    if (response.ok) {
      console.log("✅ Vercel deployment is accessible");
      console.log("   Status:", response.status);
      console.log("   Headers:", response.headers.get('content-type'));
    } else {
      console.log("❌ Vercel deployment returned:", response.status);
    }
    
    // Test Convex connection
    console.log("\n2. Testing Convex Connection...");
    const { ConvexClient } = require("convex/browser");
    const client = new ConvexClient(productionUrls.convex);
    const { api } = await import("./convex/_generated/api.js");
    
    // Test basic query
    const docs = await client.query(api.documents.listDocuments, { limit: 5 });
    console.log("✅ Convex connection successful");
    console.log("   Documents in production:", docs.documents.length);
    
    // Test upload capability
    console.log("\n3. Testing Upload Capability...");
    const uploadUrl = await client.mutation(api.documentUpload.generateUploadUrl);
    console.log("✅ Can generate upload URLs");
    
    console.log("\n✅ PRODUCTION DEPLOYMENT SUCCESSFUL!");
    console.log("\n📱 Access your app at:", productionUrls.vercel);
    console.log("\n📊 Dashboard links:");
    console.log("- Upload documents:", productionUrls.vercel + "/dashboard/upload");
    console.log("- Search documents:", productionUrls.vercel + "/dashboard/query");
    console.log("- View analytics:", productionUrls.vercel + "/dashboard/analytics");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

testProduction();