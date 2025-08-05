#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexClient(CONVEX_URL);

async function checkStatus() {
  const { api } = await import("./convex/_generated/api.js");
  
  // Get recent documents
  const documents = await client.query(api.documents.listDocuments, { limit: 5 });
  
  console.log("\nRecent Documents:");
  for (const doc of documents.documents) {
    console.log(`\n- ${doc.fileName} (${doc._id})`);
    console.log(`  Status: ${doc.status}`);
    console.log(`  Chunks: ${doc.chunkCount || 0}`);
    if (doc.error) console.log(`  Error: ${doc.error}`);
    
    // Get processing job
    const job = await client.query(api.processingJobs.getByDocument, { 
      documentId: doc._id 
    });
    
    if (job) {
      console.log(`  Job Status: ${job.status}`);
      console.log(`  Stage: ${job.stage}`);
      console.log(`  Progress: ${job.progress}%`);
      if (job.error) console.log(`  Job Error: ${job.error}`);
    }
  }
  
  // Get active jobs
  const activeJobs = await client.query(api.processingJobs.getActiveJobs);
  console.log(`\nActive Processing Jobs: ${activeJobs.length}`);
  
  process.exit(0);
}

checkStatus().catch(console.error);