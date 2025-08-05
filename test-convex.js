const { ConvexHttpClient } = require("convex/browser");

// Check if NEXT_PUBLIC_CONVEX_URL is set
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL is not set");
  process.exit(1);
}

console.log("🔧 Testing Convex connection...");
console.log("📡 Convex URL:", convexUrl);

const client = new ConvexHttpClient(convexUrl);

async function runTests() {
  try {
    console.log("\n🧪 Running diagnostics...");
    
    // Test basic connection
    try {
      const diagnostics = await client.query("diagnostics:systemDiagnostics");
      console.log("✅ Convex connection successful!");
      console.log("\n📊 System Summary:");
      console.log(`   📄 Total Documents: ${diagnostics.summary.totalDocuments}`);
      console.log(`   🧩 Total Chunks: ${diagnostics.summary.totalChunks}`);
      console.log(`   📁 Total Files: ${diagnostics.summary.totalFiles}`);
      console.log(`   🔍 Total Queries: ${diagnostics.summary.totalQueries}`);
      console.log(`   💾 Storage Used: ${(diagnostics.summary.totalStorageUsed / 1024 / 1024).toFixed(2)} MB`);
      
      console.log("\n📋 Document Status Breakdown:");
      Object.entries(diagnostics.documentStatuses).forEach(([status, count]) => {
        if (count > 0) {
          const emoji = status === 'completed' ? '✅' : status === 'pending' ? '⏳' : status === 'processing' ? '⚙️' : status === 'error' ? '❌' : '❓';
          console.log(`   ${emoji} ${status}: ${count}`);
        }
      });

      if (diagnostics.issues.length > 0) {
        console.log("\n⚠️ Issues Detected:");
        diagnostics.issues.forEach(issue => {
          console.log(`   ⚠️ ${issue}`);
        });
      } else {
        console.log("\n✅ No issues detected!");
      }

      if (diagnostics.recentDocuments.length > 0) {
        console.log("\n📚 Recent Documents:");
        diagnostics.recentDocuments.slice(0, 5).forEach(doc => {
          const statusEmoji = doc.status === 'completed' ? '✅' : doc.status === 'pending' ? '⏳' : doc.status === 'processing' ? '⚙️' : doc.status === 'error' ? '❌' : '❓';
          console.log(`   ${statusEmoji} ${doc.title} (${doc.status})`);
        });
      }

    } catch (error) {
      console.error("❌ Diagnostics failed:", error.message);
      
      // Try individual functions to see what's available
      console.log("\n🔍 Testing individual functions...");
      
      try {
        const docs = await client.query("documents:listDocuments");
        console.log("✅ documents:listDocuments works - found", docs?.documents?.length || 0, "documents");
      } catch (e) {
        console.log("❌ documents:listDocuments failed:", e.message);
      }

      try {
        const analytics = await client.query("analytics:getSystemAnalytics");
        console.log("✅ analytics:getSystemAnalytics works");
      } catch (e) {
        console.log("❌ analytics:getSystemAnalytics failed:", e.message);
      }

      try {
        const chunks = await client.query("chunks:getAllChunks");
        console.log("✅ chunks:getAllChunks works - found", chunks?.chunks?.length || 0, "chunks");
      } catch (e) {
        console.log("❌ chunks:getAllChunks failed:", e.message);
      }

      try {
        const files = await client.query("files:list");
        console.log("✅ files:list works - found", files?.length || 0, "files");
      } catch (e) {
        console.log("❌ files:list failed:", e.message);
      }
    }

  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n💡 Troubleshooting steps:");
    console.log("   1. Make sure your Convex deployment is running: npx convex dev");
    console.log("   2. Check that NEXT_PUBLIC_CONVEX_URL is set correctly");
    console.log("   3. Verify your Convex functions are deployed");
  }
}

runTests().then(() => {
  console.log("\n🏁 Test completed!");
}).catch(error => {
  console.error("💥 Test failed:", error);
  process.exit(1);
});