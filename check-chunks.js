#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = new ConvexClient(CONVEX_URL);

async function checkChunks() {
  const { api } = await import("./convex/_generated/api.js");
  
  console.log("📄 Checking Chunks...\n");
  
  // Get all chunks
  const chunksResult = await client.query(api.chunks.getAllChunks, { limit: 10 });
  
  console.log(`Total chunks found: ${chunksResult.chunks.length}\n`);
  
  for (const chunk of chunksResult.chunks) {
    console.log(`Chunk ID: ${chunk._id}`);
    console.log(`Document ID: ${chunk.documentId}`);
    console.log(`Content: ${chunk.content.substring(0, 100)}...`);
    console.log(`Has embedding: ${chunk.embedding ? 'Yes' : 'No'}`);
    if (chunk.embedding) {
      console.log(`Embedding length: ${chunk.embedding.length}`);
    }
    console.log(`Model: ${chunk.embeddingModel || 'N/A'}`);
    console.log(`Dimension: ${chunk.embeddingDimension || 'N/A'}`);
    console.log('---');
  }
  
  process.exit(0);
}

checkChunks().catch(console.error);