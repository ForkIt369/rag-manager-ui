const { ConvexClient } = require("convex/browser");

// Production Convex URL
const CONVEX_URL = "https://artful-ibis-284.convex.cloud";

async function checkUpload() {
  console.log("Connecting to production Convex...");
  const client = new ConvexClient(CONVEX_URL);
  
  try {
    // Get all documents
    const documents = await client.query("documents:listDocuments");
    console.log("\n📚 Documents in production:");
    console.log("Total documents:", documents?.documents?.length || 0);
    
    if (documents?.documents?.length > 0) {
      documents.documents.forEach((doc, index) => {
        console.log(`\n${index + 1}. ${doc.title}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   Size: ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Created: ${new Date(doc.createdAt).toLocaleString()}`);
        console.log(`   ID: ${doc._id}`);
      });
      
      // Check for recent uploads (last hour)
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const recentUploads = documents.documents.filter(doc => doc.createdAt > oneHourAgo);
      console.log(`\n⏰ Recent uploads (last hour): ${recentUploads.length}`);
      
      // Check for pending/processing documents
      const pendingDocs = documents.documents.filter(doc => doc.status === 'pending' || doc.status === 'processing');
      if (pendingDocs.length > 0) {
        console.log(`\n⚠️  Documents stuck in pending/processing: ${pendingDocs.length}`);
        pendingDocs.forEach(doc => {
          console.log(`   - ${doc.title} (${doc.status})`);
        });
      }
    } else {
      console.log("No documents found in production!");
    }
    
    // Check chunks
    const chunks = await client.query("chunks:getAllChunks");
    console.log(`\n📄 Total chunks: ${chunks?.chunks?.length || 0}`);
    
    // Check analytics
    const analytics = await client.query("analytics:getSystemAnalytics");
    console.log("\n📊 System Analytics:");
    console.log(`   Total Documents: ${analytics.totalDocuments}`);
    console.log(`   Completed: ${analytics.completedDocuments}`);
    console.log(`   Pending: ${analytics.pendingDocuments}`);
    console.log(`   Processing: ${analytics.processingDocuments}`);
    console.log(`   Total Sections: ${analytics.totalSections}`);
    console.log(`   Storage Used: ${(analytics.storageUsed / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close();
  }
}

checkUpload().catch(console.error);