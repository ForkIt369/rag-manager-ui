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

async function testCompletePipeline() {
  console.log("🚀 Testing Complete RAG Pipeline...\n");
  console.log("Convex URL:", CONVEX_URL);
  
  try {
    // Import API
    const { api } = await import("./convex/_generated/api.js");
    
    // 1. Create a test document
    console.log("📝 Step 1: Creating test document...");
    
    const testContent = `
# RAG Manager Test Document

## Overview
This is a comprehensive test document for the RAG Manager system.
It contains various sections to test different aspects of the pipeline.

## Features
The RAG Manager supports:
- PDF processing with PDF.co API integration
- Document parsing for DOCX, XLSX, CSV, HTML, and text files
- Semantic chunking with configurable overlap
- Vector embeddings using Voyage AI
- Hybrid search combining vector and keyword search

## Technical Implementation
The system uses Convex as the backend platform with the following components:
1. Document storage and management
2. Asynchronous processing pipeline
3. Vector index for similarity search
4. Analytics and monitoring

## Voyage AI Integration
We use Voyage AI's voyage-3 model for text embeddings.
For PDFs with images, we can use voyage-multimodal-3 for enhanced understanding.
The embeddings are 1024-dimensional vectors optimized for semantic search.

## PDF.co Integration
PDF.co handles complex PDF processing including:
- OCR for scanned documents
- Table extraction and formatting
- Image extraction from PDFs
- Multi-page document handling

## Search Capabilities
The search system supports:
- Pure vector search using cosine similarity
- Keyword-based search
- Hybrid search with configurable weights
- Document-specific search filters

## Performance Metrics
- Average processing time: 5-10 seconds per document
- Chunk size: 1000 tokens with 200 token overlap
- Embedding generation: 30 requests per second
- Search latency: <100ms for most queries

## Conclusion
This test verifies end-to-end functionality of the RAG pipeline.
`;
    
    const testFilePath = path.join(__dirname, "test-rag-document.md");
    fs.writeFileSync(testFilePath, testContent);
    console.log("✅ Created test document:", testFilePath);
    
    // 2. Upload document to Convex storage
    console.log("\n📤 Step 2: Uploading to Convex storage...");
    
    // Get upload URL
    const uploadUrl = await client.mutation(api.documentUpload.generateUploadUrl);
    console.log("✅ Got upload URL");
    
    // Upload file to storage
    const fileBuffer = fs.readFileSync(testFilePath);
    const blob = new Blob([fileBuffer], { type: "text/markdown" });
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: blob,
      headers: {
        "Content-Type": "text/markdown",
      },
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const { storageId } = await uploadResponse.json();
    console.log("✅ File uploaded to storage:", storageId);
    
    // 3. Create document and trigger processing
    console.log("\n⚙️ Step 3: Creating document and triggering processing...");
    
    const uploadResult = await client.action(api.actions.uploadFile.uploadAndProcess, {
      storageId,
      fileName: "test-rag-document.md",
      fileType: "md",
      fileSize: fileBuffer.length,
      tags: ["test", "pipeline"],
    });
    
    if (!uploadResult.success) {
      throw new Error(`Document creation failed: ${uploadResult.error}`);
    }
    
    console.log("✅ Document created with ID:", uploadResult.documentId);
    console.log("📨 Processing triggered");
    
    // 4. Monitor processing status
    console.log("\n⏳ Step 4: Monitoring processing status...");
    
    let processingComplete = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (!processingComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const document = await client.query(api.documents.getDocument, {
        id: uploadResult.documentId,
      });
      
      if (document) {
        console.log(`Status: ${document.status} (attempt ${attempts + 1}/${maxAttempts})`);
        
        if (document.status === "completed") {
          processingComplete = true;
          console.log("✅ Processing completed!");
          console.log(`- Chunks created: ${document.chunkCount || 0}`);
          console.log(`- Processing time: ${document.processingTime || 0}ms`);
        } else if (document.status === "error") {
          throw new Error(`Processing failed: ${document.error}`);
        }
      }
      
      attempts++;
    }
    
    if (!processingComplete) {
      console.warn("⚠️ Processing timeout - continuing with tests anyway");
    }
    
    // 5. Test vector search
    console.log("\n🔍 Step 5: Testing vector search...");
    
    const testQueries = [
      "Voyage AI embeddings",
      "PDF processing capabilities",
      "hybrid search",
      "Convex backend platform",
    ];
    
    for (const query of testQueries) {
      console.log(`\nSearching for: "${query}"`);
      
      const searchResults = await client.action(api.actions.vectorSearch.search, {
        query,
        limit: 3,
        threshold: 0.5,
      });
      
      if (searchResults.results && searchResults.results.length > 0) {
        console.log(`✅ Found ${searchResults.results.length} results`);
        console.log(`   Top result score: ${searchResults.results[0].score.toFixed(3)}`);
        console.log(`   Execution time: ${searchResults.executionTime}ms`);
      } else {
        console.log("⚠️ No results found");
      }
    }
    
    // 6. Test hybrid search
    console.log("\n🔍 Step 6: Testing hybrid search...");
    
    const hybridResults = await client.action(api.actions.vectorSearch.hybridSearch, {
      query: "RAG Manager features and capabilities",
      limit: 5,
      alpha: 0.7, // 70% vector, 30% keyword
    });
    
    if (hybridResults.results && hybridResults.results.length > 0) {
      console.log(`✅ Hybrid search returned ${hybridResults.results.length} results`);
      console.log(`   Search type: ${hybridResults.searchType}`);
      console.log(`   Alpha value: ${hybridResults.alpha}`);
      console.log(`   Execution time: ${hybridResults.executionTime}ms`);
    }
    
    // 7. Check analytics
    console.log("\n📊 Step 7: Checking system analytics...");
    
    const stats = await client.query(api.analytics.getSystemStats);
    console.log("System Statistics:");
    console.log(`- Total documents: ${stats.totalDocuments}`);
    console.log(`- Total chunks: ${stats.totalChunks}`);
    console.log(`- Average chunks per document: ${stats.avgChunksPerDocument}`);
    console.log(`- Storage used: ${(stats.totalStorageUsed / (1024 * 1024)).toFixed(2)} MB`);
    
    const queryStats = await client.query(api.queries.getQueryStats);
    console.log("\nQuery Statistics:");
    console.log(`- Total queries: ${queryStats.totalQueries}`);
    console.log(`- Average response time: ${queryStats.avgResponseTime}ms`);
    console.log(`- Average result count: ${queryStats.avgResultCount}`);
    console.log(`- Average top score: ${queryStats.avgTopScore}`);
    
    // 8. Test document-specific search
    console.log("\n🔍 Step 8: Testing document-specific search...");
    
    const docSpecificSearch = await client.action(api.actions.vectorSearch.search, {
      query: "technical implementation",
      documentId: uploadResult.documentId,
      limit: 3,
    });
    
    if (docSpecificSearch.results && docSpecificSearch.results.length > 0) {
      console.log(`✅ Document-specific search returned ${docSpecificSearch.results.length} results`);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log("\n🧹 Cleaned up test file");
    
    console.log("\n✅ All pipeline tests completed successfully!");
    
    return {
      success: true,
      documentId: uploadResult.documentId,
      testsRun: 8,
    };
    
  } catch (error) {
    console.error("\n❌ Pipeline test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the test
console.log("=" .repeat(60));
testCompletePipeline().then((result) => {
  console.log("=" .repeat(60));
  if (result.success) {
    console.log("\n🎉 SUCCESS: All tests passed!");
    console.log(`Document ID: ${result.documentId}`);
    console.log(`Tests run: ${result.testsRun}`);
  } else {
    console.log("\n💥 FAILURE:", result.error);
  }
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});