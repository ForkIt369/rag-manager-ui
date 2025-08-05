#!/usr/bin/env node

const { ConvexClient } = require("convex/browser");

// Use production URL
const PRODUCTION_URL = "https://artful-ibis-284.convex.cloud";
const client = new ConvexClient(PRODUCTION_URL);

// PDF.co API key from your configuration
const PDFCO_API_KEY = "will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a";

async function testPDFCoAPI() {
  const { api } = await import("./convex/_generated/api.js");
  
  console.log("🧪 Testing PDF.co API with Uploaded Documents\n");
  console.log("=" .repeat(60));
  
  try {
    // Get first document from Convex
    const docs = await client.query(api.documents.listDocuments, { limit: 1 });
    
    if (docs.documents.length === 0) {
      console.log("❌ No documents found in database");
      return;
    }
    
    const doc = docs.documents[0];
    console.log(`📄 Testing with: ${doc.fileName}`);
    console.log(`   File ID: ${doc.fileId}`);
    console.log(`   Status: ${doc.status}\n`);
    
    // Get the file URL from Convex storage
    // Note: We need to construct the URL properly for PDF.co
    const fileUrl = `https://artful-ibis-284.convex.cloud/api/storage/${doc.fileId}`;
    console.log(`📎 File URL: ${fileUrl}\n`);
    
    console.log("Testing PDF.co API directly...\n");
    
    // Test 1: Get PDF info
    console.log("1️⃣ Testing PDF Info Endpoint:");
    try {
      const infoResponse = await fetch("https://api.pdf.co/v1/pdf/info", {
        method: "POST",
        headers: {
          "x-api-key": PDFCO_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: fileUrl
        })
      });
      
      const infoResult = await infoResponse.json();
      if (infoResult.error) {
        console.log(`   ❌ Error: ${infoResult.message}`);
        
        // Try with a public test PDF to verify API key works
        console.log("\n   Testing with public PDF...");
        const testResponse = await fetch("https://api.pdf.co/v1/pdf/info", {
          method: "POST",
          headers: {
            "x-api-key": PDFCO_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: "https://pdfobject.com/pdf/sample.pdf"
          })
        });
        
        const testResult = await testResponse.json();
        if (!testResult.error) {
          console.log("   ✅ API key works with public PDFs");
          console.log("   ⚠️ Issue: Convex storage URLs may not be accessible to PDF.co");
        } else {
          console.log(`   ❌ API key issue: ${testResult.message}`);
        }
      } else {
        console.log(`   ✅ Success: ${infoResult.info?.pageCount || 0} pages`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    
    // Test 2: Try text extraction
    console.log("\n2️⃣ Testing Text Extraction:");
    try {
      const textResponse = await fetch("https://api.pdf.co/v1/pdf/convert/to/text", {
        method: "POST",
        headers: {
          "x-api-key": PDFCO_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: fileUrl,
          inline: true,
          unwrap: true,
          lang: "eng"
        })
      });
      
      const textResult = await textResponse.json();
      if (textResult.error) {
        console.log(`   ❌ Error: ${textResult.message}`);
      } else if (textResult.body) {
        const extractedText = textResult.body.substring(0, 200);
        console.log(`   ✅ Extracted text preview:`);
        console.log(`   "${extractedText}..."`);
      } else {
        console.log(`   ⚠️ No text extracted`);
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log("\n🔍 Diagnosis:");
    console.log("\nThe issue is likely that PDF.co cannot access files from Convex storage URLs.");
    console.log("Convex storage requires authentication that PDF.co doesn't have.\n");
    console.log("💡 Solution: We need to:");
    console.log("1. Download the file from Convex storage");
    console.log("2. Upload it to PDF.co's temporary storage");
    console.log("3. Use PDF.co's temporary URL for processing");
    console.log("\nThis is already implemented in the uploadFile method of PDFCoClient,");
    console.log("but it seems the pdfParser isn't using it correctly.\n");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
  
  process.exit(0);
}

testPDFCoAPI().catch(console.error);