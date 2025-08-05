"use node"

import { 
  FileProcessor, 
  ProcessedContent, 
  ProcessingOptions,
  ProcessedImage 
} from '../../lib/types/processing'
import { logger } from '../lib/monitoring'
import { createPDFCoClient, PDFCoClient } from '../lib/pdfco'

export class PDFParser implements FileProcessor {
  private pdfcoClient: PDFCoClient
  
  constructor() {
    // Initialize PDF.co client with API key
    this.pdfcoClient = createPDFCoClient(
      process.env.PDFCO_API_KEY || 'will@w3dv.com_UnDe4pGi2JRUxuXJhPCJ5k21kdrbJaCyH7gwFcUMpo98Na0x86xHmPSLV4dApy8a'
    )
  }
  
  canProcess(fileType: string): boolean {
    return fileType === 'pdf' || fileType === 'application/pdf'
  }
  
  async process(
    fileBuffer: Buffer,
    options: ProcessingOptions
  ): Promise<ProcessedContent> {
    try {
      logger.info({ size: fileBuffer.length }, 'Processing PDF with PDF.co')
      
      // Upload file to PDF.co temporary storage
      const fileUrl = await this.pdfcoClient.uploadFile(
        fileBuffer,
        `document-${Date.now()}.pdf`
      )
      
      // Extract text and metadata in parallel
      const [extractedContent, pdfInfo, jsonData] = await Promise.all([
        this.pdfcoClient.extractText(fileUrl, {
          unwrap: true, // Unwrap text for better readability
          lang: 'eng'   // OCR language for scanned PDFs
        }),
        this.pdfcoClient.getInfo(fileUrl),
        options.extractStructured 
          ? this.pdfcoClient.extractToJSON(fileUrl)
          : Promise.resolve(null)
      ])
      
      // For multimodal processing, convert first few pages to images
      let images: ProcessedImage[] = []
      if (options.extractImages || options.multimodal) {
        try {
          const imageUrls = await this.pdfcoClient.convertToImages(fileUrl, {
            pages: '0-2', // First 3 pages
            resolution: 150
          })
          
          // Convert URLs to ProcessedImage format
          images = imageUrls.map((url, index) => ({
            url,
            pageNumber: index + 1,
            type: 'page_render',
            mimeType: 'image/png'
          }))
          
          logger.info({ imageCount: images.length }, 'Extracted PDF page images')
        } catch (error) {
          logger.warn({ error }, 'Failed to extract images from PDF')
        }
      }
      
      // Extract tables if requested
      let tables: any[] = []
      if (options.extractTables) {
        try {
          tables = await this.pdfcoClient.extractTables(fileUrl)
          logger.info({ tableCount: tables.length }, 'Extracted tables from PDF')
        } catch (error) {
          logger.warn({ error }, 'Failed to extract tables from PDF')
        }
      }
      
      // Combine all extracted content
      const combinedContent = this.combineContent(
        extractedContent,
        jsonData,
        tables
      )
      
      // Build comprehensive metadata
      const metadata = {
        format: 'pdf',
        pageCount: extractedContent.metadata.pageCount || pdfInfo.pageCount || 1,
        title: pdfInfo.title || extractedContent.metadata.title,
        author: pdfInfo.author || extractedContent.metadata.author,
        subject: pdfInfo.subject || extractedContent.metadata.subject,
        keywords: pdfInfo.keywords || extractedContent.metadata.keywords,
        creator: pdfInfo.creator || extractedContent.metadata.creator,
        producer: pdfInfo.producer || extractedContent.metadata.producer,
        creationDate: pdfInfo.creationDate || extractedContent.metadata.creationDate,
        modificationDate: pdfInfo.modificationDate || extractedContent.metadata.modificationDate,
        hasImages: images.length > 0,
        hasTables: tables.length > 0,
        tableCount: tables.length,
        extractedVia: 'PDF.co API',
        wordCount: combinedContent.split(/\s+/).length,
        fileSize: fileBuffer.length,
        processingOptions: options
      }
      
      // Return structured content with pages
      const processedContent: ProcessedContent = {
        content: combinedContent,
        metadata,
        images,
        pages: extractedContent.pages,
        tables
      }
      
      return processedContent
    } catch (error) {
      logger.error({ error }, 'Failed to parse PDF with PDF.co')
      
      // Fallback to basic extraction if PDF.co fails
      logger.info('Falling back to basic PDF text extraction')
      return this.fallbackExtraction(fileBuffer)
    }
  }
  
  private combineContent(
    extracted: any,
    jsonData: any,
    tables: any[]
  ): string {
    let content = extracted.text || ''
    
    // Add structured data if available
    if (jsonData && jsonData.pages) {
      content += '\n\n--- Structured Data ---\n'
      jsonData.pages.forEach((page: any, index: number) => {
        if (page.text) {
          content += `\nPage ${index + 1}:\n${page.text}\n`
        }
      })
    }
    
    // Add table data if available
    if (tables && tables.length > 0) {
      content += '\n\n--- Tables ---\n'
      tables.forEach((table, index) => {
        content += `\nTable ${index + 1}:\n`
        if (Array.isArray(table)) {
          table.forEach(row => {
            content += row.join(' | ') + '\n'
          })
        }
      })
    }
    
    return content
  }
  
  private fallbackExtraction(buffer: Buffer): ProcessedContent {
    // Very basic text extraction as last resort
    const text = buffer.toString('utf-8', 0, Math.min(100000, buffer.length))
    
    // Extract readable text patterns
    const matches = text.match(/[a-zA-Z0-9\s,.!?;:'"()-]{10,}/g) || []
    const extracted = matches
      .filter(match => match.trim().length > 10)
      .join(' ')
      .slice(0, 5000) // Limit to first 5000 chars
    
    return {
      content: extracted || 'PDF content extraction failed - please check PDF.co API configuration',
      metadata: {
        format: 'pdf',
        pageCount: 1,
        fileSize: buffer.length,
        wordCount: extracted.split(/\s+/).length,
        warning: 'Fallback extraction used - limited functionality',
        extractedVia: 'Basic text pattern matching'
      },
      images: []
    }
  }
}

export function createPDFParser(): FileProcessor {
  return new PDFParser()
}