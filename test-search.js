#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexClient(CONVEX_URL);

async function testSearch() {
  const { api } = await import("./convex/_generated/api.js");
  
  console.log("🔍 Testing Vector Search...\n");
  
  const queries = [
    "RAG Manager features",
    "Voyage AI embeddings",
    "PDF processing",
    "semantic search",
    "Convex backend"
  ];
  
  for (const query of queries) {
    console.log(`\nSearching for: "${query}"`);
    
    try {
      const results = await client.action(api.actions.vectorSearch.search, {
        query,
        limit: 3,
        threshold: 0.3, // Lower threshold to get more results
      });
      
      if (results.results && results.results.length > 0) {
        console.log(`✅ Found ${results.results.length} results`);
        console.log(`   Top score: ${results.results[0].score.toFixed(3)}`);
        console.log(`   Preview: ${results.results[0].content.substring(0, 100)}...`);
        console.log(`   Time: ${results.executionTime}ms`);
      } else {
        console.log("⚠️ No results found");
        if (results.error) {
          console.log(`   Error: ${results.error}`);
        }
      }
    } catch (error) {
      console.log(`❌ Search failed: ${error.message}`);
    }
  }
  
  // Test query history
  console.log("\n📊 Query Statistics:");
  try {
    const stats = await client.query(api.queries.getQueryStats);
    console.log(`- Total queries: ${stats.totalQueries}`);
    console.log(`- Avg response time: ${stats.avgResponseTime}ms`);
    console.log(`- Avg result count: ${stats.avgResultCount}`);
    console.log(`- Avg top score: ${stats.avgTopScore}`);
  } catch (error) {
    console.log(`❌ Could not get query stats: ${error.message}`);
  }
  
  // Get chunks for the successful document
  console.log("\n📄 Document Chunks:");
  try {
    const docs = await client.query(api.documents.listDocuments, { limit: 5 });
    const completedDoc = docs.documents.find(d => d.status === "completed");
    
    if (completedDoc) {
      console.log(`\nDocument: ${completedDoc.fileName} (${completedDoc._id})`);
      console.log(`Chunks: ${completedDoc.chunkCount}`);
      
      const chunks = await client.query(api.chunks.getDocumentChunks, {
        documentId: completedDoc._id
      });
      
      console.log(`\nActual chunks found: ${chunks.chunks.length}`);
      if (chunks.chunks.length > 0) {
        console.log("\nFirst chunk preview:");
        console.log(chunks.chunks[0].content.substring(0, 200) + "...");
        console.log(`Embedding length: ${chunks.chunks[0].embedding?.length || 0}`);
      }
    }
  } catch (error) {
    console.log(`❌ Could not get chunks: ${error.message}`);
  }
  
  process.exit(0);
}

testSearch().catch(console.error);