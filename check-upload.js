const { ConvexHttpClient } = require("convex/browser");

// Check if NEXT_PUBLIC_CONVEX_URL is set
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

console.log("🔍 Checking for uploaded book in Convex database...");

const client = new ConvexHttpClient(convexUrl);

async function checkUpload() {
  try {
    // Get all documents
    const result = await client.query("documents:listDocuments");
    const documents = result?.documents || [];
    
    console.log(`📊 Found ${documents.length} total documents in database`);
    
    if (documents.length === 0) {
      console.log("❌ No documents found in database");
      console.log("\n💡 This suggests:");
      console.log("   - The book upload might not have been processed");
      console.log("   - The upload might have failed silently");
      console.log("   - The database might be empty");
      return;
    }

    // Look for book-like documents
    const bookLikeDocuments = documents.filter(doc => 
      doc.fileName && (
        doc.fileName.toLowerCase().includes('book') ||
        doc.fileName.toLowerCase().includes('.pdf') ||
        doc.fileName.toLowerCase().includes('.epub') ||
        doc.fileName.toLowerCase().includes('.txt') ||
        doc.fileSize > 100000 // Files larger than 100KB
      )
    );

    console.log(`📚 Found ${bookLikeDocuments.length} book-like documents`);

    // Show all documents with details
    console.log("\n📄 All documents in database:");
    documents.forEach((doc, index) => {
      const statusEmoji = doc.status === 'completed' ? '✅' : 
                         doc.status === 'pending' ? '⏳' : 
                         doc.status === 'processing' ? '⚙️' : 
                         doc.status === 'error' ? '❌' : '❓';
      
      const sizeKB = doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : '0';
      const createdDate = new Date(doc.createdAt).toLocaleString();
      
      console.log(`   ${index + 1}. ${statusEmoji} ${doc.title || doc.fileName || 'Untitled'}`);
      console.log(`      📁 File: ${doc.fileName || 'N/A'}`);
      console.log(`      📏 Size: ${sizeKB} KB`);
      console.log(`      📅 Created: ${createdDate}`);
      console.log(`      🏷️ Status: ${doc.status || 'unknown'}`);
      console.log(`      🔗 Source: ${doc.source || 'unknown'}`);
      console.log(`      📝 Has Content: ${doc.content ? 'Yes' : 'No'}`);
      console.log(`      📎 Has File ID: ${doc.fileId ? 'Yes' : 'No'}`);
      if (doc.tags && doc.tags.length > 0) {
        console.log(`      🏷️ Tags: ${doc.tags.join(', ')}`);
      }
      console.log("");
    });

    // Check for chunks
    try {
      const chunksResult = await client.query("chunks:getAllChunks");
      const chunks = chunksResult?.chunks || [];
      console.log(`🧩 Found ${chunks.length} total chunks in database`);
      
      if (chunks.length > 0) {
        // Group chunks by document
        const chunksByDoc = chunks.reduce((acc, chunk) => {
          if (!acc[chunk.documentId]) {
            acc[chunk.documentId] = [];
          }
          acc[chunk.documentId].push(chunk);
          return acc;
        }, {});

        console.log("\n📊 Chunks per document:");
        Object.entries(chunksByDoc).forEach(([docId, docChunks]) => {
          const doc = documents.find(d => d._id === docId);
          const docTitle = doc ? (doc.title || doc.fileName) : 'Unknown Document';
          const chunksWithEmbeddings = docChunks.filter(c => c.embedding && c.embedding.length > 0).length;
          console.log(`   📄 ${docTitle}: ${docChunks.length} chunks (${chunksWithEmbeddings} with embeddings)`);
        });
      }
    } catch (error) {
      console.log("⚠️ Could not retrieve chunks:", error.message);
    }

    // Check specific issues
    const pendingDocs = documents.filter(d => d.status === 'pending');
    const processingDocs = documents.filter(d => d.status === 'processing');
    const errorDocs = documents.filter(d => d.status === 'error');
    const completedDocs = documents.filter(d => d.status === 'completed');

    if (pendingDocs.length > 0) {
      console.log(`\n⏳ ${pendingDocs.length} documents are still pending processing`);
    }

    if (processingDocs.length > 0) {
      console.log(`\n⚙️ ${processingDocs.length} documents are currently processing`);
    }

    if (errorDocs.length > 0) {
      console.log(`\n❌ ${errorDocs.length} documents have errors`);
      errorDocs.forEach(doc => {
        console.log(`   - ${doc.title || doc.fileName}: ${doc.status}`);
      });
    }

    if (completedDocs.length > 0) {
      console.log(`\n✅ ${completedDocs.length} documents completed successfully`);
    }

  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. Convex is running: npx convex dev");
    console.log("   2. Your functions are deployed");
    console.log("   3. NEXT_PUBLIC_CONVEX_URL is correct");
  }
}

checkUpload().then(() => {
  console.log("\n🏁 Upload check completed!");
}).catch(error => {
  console.error("💥 Check failed:", error);
  process.exit(1);
});