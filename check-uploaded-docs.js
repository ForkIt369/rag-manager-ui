#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Use production URL
const PRODUCTION_URL = "https://artful-ibis-284.convex.cloud";
const client = new ConvexClient(PRODUCTION_URL);

async function checkUploadedDocs() {
  const { api } = await import("./convex/_generated/api.js");
  
  console.log("📄 Checking Uploaded Documents in Production\n");
  console.log("=" .repeat(60));
  
  try {
    // Get all documents
    const docs = await client.query(api.documents.listDocuments, { limit: 10 });
    
    console.log(`\nTotal documents: ${docs.documents.length}\n`);
    
    for (const doc of docs.documents) {
      console.log(`📚 ${doc.fileName}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Size: ${(doc.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   Type: ${doc.fileType}`);
      console.log(`   Chunks: ${doc.chunkCount || 0}`);
      if (doc.processingTime) {
        console.log(`   Processing Time: ${(doc.processingTime / 1000).toFixed(1)}s`);
      }
      if (doc.error) {
        console.log(`   ❌ Error: ${doc.error}`);
      }
      
      // Check processing job
      const job = await client.query(api.processingJobs.getByDocument, { 
        documentId: doc._id 
      });
      
      if (job) {
        console.log(`   Job: ${job.status} - ${job.stage} (${job.progress}%)`);
        if (job.error) {
          console.log(`   Job Error: ${job.error}`);
        }
      }
      
      // If completed, check chunks
      if (doc.status === "completed" && doc.chunkCount > 0) {
        const chunks = await client.query(api.chunks.getDocumentChunks, {
          documentId: doc._id
        });
        console.log(`   ✅ Actual chunks stored: ${chunks.chunks.length}`);
        if (chunks.chunks.length > 0) {
          const hasEmbeddings = chunks.chunks.every(c => c.embedding && c.embedding.length > 0);
          console.log(`   ✅ All chunks have embeddings: ${hasEmbeddings ? 'Yes' : 'No'}`);
        }
      }
      
      console.log();
    }
    
    // Test search on the uploaded documents
    console.log("=" .repeat(60));
    console.log("\n🔍 Testing Search on Uploaded Documents\n");
    
    const testQueries = [
      "marketing strategy",
      "principles",
      "customer acquisition",
      "agile marketing"
    ];
    
    for (const query of testQueries) {
      console.log(`\nSearching: "${query}"`);
      try {
        const results = await client.action(api.actions.vectorSearch.search, {
          query,
          limit: 3,
          threshold: 0.3
        });
        
        if (results.results && results.results.length > 0) {
          console.log(`✅ Found ${results.results.length} results`);
          console.log(`   Top match (score: ${results.results[0].score.toFixed(3)})`);
          console.log(`   "${results.results[0].content.substring(0, 100)}..."`);
        } else {
          console.log(`⚠️ No results found`);
        }
      } catch (error) {
        console.log(`❌ Search failed: ${error.message}`);
      }
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("\n📊 Summary:");
    
    const completedDocs = docs.documents.filter(d => d.status === "completed");
    const processingDocs = docs.documents.filter(d => d.status === "processing");
    const errorDocs = docs.documents.filter(d => d.status === "error");
    
    console.log(`✅ Completed: ${completedDocs.length}`);
    console.log(`⏳ Processing: ${processingDocs.length}`);
    console.log(`❌ Errors: ${errorDocs.length}`);
    
    const totalChunks = completedDocs.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0);
    console.log(`📑 Total chunks: ${totalChunks}`);
    
    if (processingDocs.length > 0) {
      console.log("\n⏳ Documents still processing. Run this script again in a minute.");
    }
    
    if (errorDocs.length > 0) {
      console.log("\n❌ Some documents failed. Check Convex logs for details.");
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
  
  process.exit(0);
}

checkUploadedDocs().catch(console.error);