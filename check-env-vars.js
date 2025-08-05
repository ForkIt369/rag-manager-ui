#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Use production URL
const PRODUCTION_URL = "https://artful-ibis-284.convex.cloud";
const client = new ConvexClient(PRODUCTION_URL);

async function checkEnvVars() {
  console.log("🔍 Checking Environment Variables\n");
  console.log("=" .repeat(60));
  
  console.log("\n📋 Required Environment Variables:");
  console.log("1. VOYAGE_API_KEY - For embeddings");
  console.log("2. PDFCO_API_KEY - For PDF processing\n");
  
  console.log("⚠️ IMPORTANT: Environment variables must be set in Convex Dashboard");
  console.log("   URL: https://dashboard.convex.dev/d/artful-ibis-284/settings/environment-variables\n");
  
  console.log("✅ Expected Values:");
  console.log("   VOYAGE_API_KEY: pa-R02PH3qx5COlTDPTuKCoh2aQCsBsacXBrECRJGWZI_P");
  console.log("   PDFCO_API_KEY: will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a\n");
  
  console.log("=" .repeat(60));
  console.log("\n📝 To set environment variables:");
  console.log("1. Go to the Convex Dashboard URL above");
  console.log("2. Click 'Add environment variable'");
  console.log("3. Add both VOYAGE_API_KEY and PDFCO_API_KEY with the values above");
  console.log("4. Save the changes\n");
  
  console.log("🔄 After setting the variables:");
  console.log("1. The changes take effect immediately");
  console.log("2. Re-process documents by running: node reprocess-documents.js");
  console.log("3. Check status with: node check-uploaded-docs.js\n");
  
  process.exit(0);
}

checkEnvVars().catch(console.error);