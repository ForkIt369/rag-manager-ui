#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Use production URL
const PRODUCTION_URL = "https://artful-ibis-284.convex.cloud";
const client = new ConvexClient(PRODUCTION_URL);

async function fixEmbeddings() {
  const { api } = await import("./convex/_generated/api.js");
  
  console.log("🔧 Regenerating Embeddings for Documents\n");
  console.log("=" .repeat(60));
  
  try {
    // Get all chunks without embeddings
    const chunksResult = await client.query(api.chunks.getAllChunks, { limit: 100 });
    
    const chunksWithoutEmbeddings = chunksResult.chunks.filter(
      chunk => !chunk.embedding || chunk.embedding.length === 0
    );
    
    console.log(`Found ${chunksWithoutEmbeddings.length} chunks without embeddings\n`);
    
    if (chunksWithoutEmbeddings.length === 0) {
      console.log("✅ All chunks already have embeddings!");
      return;
    }
    
    // Check if we can manually generate embeddings
    console.log("Checking chunks content:");
    for (const chunk of chunksWithoutEmbeddings) {
      console.log(`\nChunk ${chunk._id}:`);
      console.log(`Document: ${chunk.documentId}`);
      console.log(`Content preview: ${chunk.content.substring(0, 200)}...`);
      console.log(`Content length: ${chunk.content.length} characters`);
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("\n⚠️ Issue Detected:");
    console.log("The chunks were created but embeddings were not generated.");
    console.log("\nPossible reasons:");
    console.log("1. Voyage AI API key not set in production Convex environment");
    console.log("2. PDF content extraction resulted in empty or invalid text");
    console.log("3. Embedding generation timeout");
    
    console.log("\n🔧 Recommended Fix:");
    console.log("1. Verify VOYAGE_API_KEY is set in Convex production:");
    console.log("   https://dashboard.convex.dev/d/artful-ibis-284/settings/environment-variables");
    console.log("\n2. Re-process the documents by running:");
    console.log("   - Delete and re-upload the documents");
    console.log("   - Or manually trigger reprocessing");
    
    // Let's check if the content is actually valid
    const firstChunk = chunksWithoutEmbeddings[0];
    if (firstChunk && firstChunk.content) {
      console.log("\n📄 Content Check:");
      if (firstChunk.content.length < 10) {
        console.log("❌ Content is too short - PDF extraction may have failed");
      } else if (firstChunk.content.includes("�") || firstChunk.content.includes("\ufffd")) {
        console.log("❌ Content contains invalid characters - encoding issue");
      } else {
        console.log("✅ Content appears valid - likely an API key issue");
      }
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
  
  process.exit(0);
}

fixEmbeddings().catch(console.error);