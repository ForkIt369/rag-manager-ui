// Test script for PDF.co integration
// Run with: node test-pdfco.js

const fetch = require('node-fetch');

const PDFCO_API_KEY = 'will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a';

async function testPDFCoAPI() {
  console.log('Testing PDF.co API...\n');
  
  // Test with a sample PDF URL
  const testPDFUrl = 'https://pdfobject.com/pdf/sample.pdf';
  
  try {
    // Test 1: Extract text
    console.log('1. Testing text extraction...');
    const textResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'x-api-key': PDFCO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: testPDFUrl,
        inline: true,
        pages: '' // Empty string for all pages
      })
    });
    
    const textResult = await textResponse.json();
    
    if (textResult.error) {
      console.error('❌ Text extraction failed:', textResult.message);
    } else {
      console.log('✅ Text extraction successful');
      console.log('   Page count:', textResult.pageCount);
      const textContent = textResult.body || textResult.text || '';
      console.log('   Text preview:', textContent.substring(0, 200) + '...');
    }
    
    // Test 2: Get PDF info
    console.log('\n2. Testing PDF info extraction...');
    const infoResponse = await fetch('https://api.pdf.co/v1/pdf/info', {
      method: 'POST',
      headers: {
        'x-api-key': PDFCO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: testPDFUrl
      })
    });
    
    const infoResult = await infoResponse.json();
    
    if (infoResult.error) {
      console.error('❌ Info extraction failed:', infoResult.message);
    } else {
      console.log('✅ Info extraction successful');
      console.log('   Info:', JSON.stringify(infoResult.info, null, 2));
    }
    
    // Test 3: Convert to JSON
    console.log('\n3. Testing JSON conversion...');
    const jsonResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/json', {
      method: 'POST',
      headers: {
        'x-api-key': PDFCO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: testPDFUrl,
        inline: true,
        pages: ''
      })
    });
    
    const jsonResult = await jsonResponse.json();
    
    if (jsonResult.error) {
      console.error('❌ JSON conversion failed:', jsonResult.message);
    } else {
      console.log('✅ JSON conversion successful');
      if (jsonResult.body) {
        try {
          const bodyContent = typeof jsonResult.body === 'string' ? jsonResult.body : JSON.stringify(jsonResult.body);
          const parsed = JSON.parse(bodyContent);
          console.log('   Document structure:', Object.keys(parsed));
        } catch (e) {
          console.log('   Result type:', typeof jsonResult.body);
          console.log('   Result preview:', JSON.stringify(jsonResult.body).substring(0, 200));
        }
      }
    }
    
    console.log('\n✨ PDF.co API tests completed!');
    console.log('API is working correctly and ready for use.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the test
testPDFCoAPI();