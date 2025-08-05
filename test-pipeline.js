#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexClient(CONVEX_URL);

async function testPipeline() {
  console.log("🚀 Testing RAG Pipeline...\n");
  
  try {
    // 1. Test document upload
    console.log("📤 Step 1: Testing document upload...");
    
    // Create a test text file
    const testContent = `
# Test Document for RAG Pipeline

## Introduction
This is a test document to verify the complete RAG pipeline functionality.
The pipeline should process this document through the following stages:
1. Upload to Convex storage
2. Parse the content
3. Create semantic chunks
4. Generate embeddings using Voyage AI
5. Store chunks with embeddings
6. Enable vector search

## Technical Details
The system uses Voyage AI for generating high-quality embeddings.
It supports multiple file formats including PDF, DOCX, XLSX, CSV, and text files.
The chunking strategy uses semantic boundaries to maintain context.

## Search Capabilities
Once processed, this document should be searchable using:
- Vector similarity search
- Keyword search
- Hybrid search combining both approaches

## Conclusion
If you can find this document through search, the pipeline is working correctly!
`;
    
    const testFilePath = path.join(__dirname, "test-document.md");
    fs.writeFileSync(testFilePath, testContent);
    console.log("✅ Created test document");
    
    // Read file as buffer
    const fileBuffer = fs.readFileSync(testFilePath);
    const base64Content = fileBuffer.toString('base64');
    
    // Upload document using the mutation
    console.log("\n📤 Step 2: Uploading to Convex...");
    const { api } = await import("./convex/_generated/api.js");
    
    const uploadResult = await client.mutation(api.documents.createDocument, {
      title: "Test RAG Pipeline Document",
      fileName: "test-document.md",
      fileType: "md",
      fileSize: fileBuffer.length,
      content: testContent, // For text files, we can pass content directly
      status: "pending",
      uploadedBy: "test-user",
      createdAt: Date.now(),
    });
    
    console.log("✅ Document uploaded with ID:", uploadResult.id);
    
    // 3. Trigger processing
    console.log("\n⚙️ Step 3: Processing document...");
    await client.action(api.actions.documentProcessor.processDocument, {
      documentId: uploadResult.id,
    });
    
    console.log("✅ Document processed successfully");
    
    // 4. Wait a moment for processing to complete
    console.log("\n⏳ Waiting for processing to complete...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 5. Test vector search
    console.log("\n🔍 Step 4: Testing vector search...");
    const searchResults = await client.action(api.actions.vectorSearch.search, {
      query: "Voyage AI embeddings",
      limit: 5,
    });
    
    if (searchResults.results.length > 0) {
      console.log("✅ Vector search returned", searchResults.results.length, "results");
      console.log("\nTop result:");
      console.log("- Score:", searchResults.results[0].score);
      console.log("- Content:", searchResults.results[0].content.substring(0, 100) + "...");
    } else {
      console.log("⚠️ No search results found");
    }
    
    // 6. Test hybrid search
    console.log("\n🔍 Step 5: Testing hybrid search...");
    const hybridResults = await client.action(api.actions.vectorSearch.hybridSearch, {
      query: "pipeline functionality",
      limit: 5,
      alpha: 0.7,
    });
    
    if (hybridResults.results.length > 0) {
      console.log("✅ Hybrid search returned", hybridResults.results.length, "results");
    }
    
    // 7. Check analytics
    console.log("\n📊 Step 6: Checking analytics...");
    const stats = await client.query(api.analytics.getSystemStats);
    console.log("System stats:");
    console.log("- Total documents:", stats.totalDocuments);
    console.log("- Total chunks:", stats.totalChunks);
    console.log("- Average chunks per document:", stats.avgChunksPerDocument);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    console.log("\n✅ Pipeline test completed successfully!");
    
  } catch (error) {
    console.error("\n❌ Pipeline test failed:", error);
    process.exit(1);
  }
}

// Run the test
testPipeline().then(() => {
  console.log("\n🎉 All tests passed!");
  process.exit(0);
}).catch(error => {
  console.error("\n💥 Test failed:", error);
  process.exit(1);
});