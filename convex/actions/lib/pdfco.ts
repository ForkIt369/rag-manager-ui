"use node"

import pLimit from 'p-limit'
import { logger } from './monitoring'

interface PDFCoConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
}

interface PDFCoExtractOptions {
  async?: boolean
  inline?: boolean
  password?: string
  pages?: string // e.g., "0-2,5,7-"
  unwrap?: boolean
  rect?: string // "x,y,width,height"
  lang?: string // OCR language
  profile?: string // Custom extraction profile
}

interface PDFCoResponse {
  url?: string
  pageCount?: number
  body?: string
  error?: boolean
  message?: string
  status?: string
  jobId?: string
  remainingCredits?: number
}

interface ExtractedContent {
  text: string
  pages: Array<{
    pageNumber: number
    text: string
    tables?: any[]
  }>
  metadata: {
    pageCount: number
    title?: string
    author?: string
    subject?: string
    keywords?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }
}

export class PDFCoClient {
  private apiKey: string
  private baseUrl: string
  private timeout: number
  private rateLimiter: ReturnType<typeof pLimit>
  
  constructor(config: PDFCoConfig) {
    this.apiKey = config.apiKey || process.env.PDFCO_API_KEY || ''
    this.baseUrl = config.baseUrl || 'https://api.pdf.co/v1'
    this.timeout = config.timeout || 30000
    
    // PDF.co rate limits: 2 requests per second for free tier
    // Adjust based on your plan
    this.rateLimiter = pLimit(2)
    
    if (!this.apiKey) {
      throw new Error('PDF.co API key is required')
    }
  }
  
  /**
   * Extract text from PDF with OCR support
   */
  async extractText(
    fileUrl: string,
    options: PDFCoExtractOptions = {}
  ): Promise<ExtractedContent> {
    return this.rateLimiter(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/pdf/convert/to/text`, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fileUrl,
            async: options.async || false,
            inline: options.inline || true,
            password: options.password || '',
            pages: options.pages || '',
            unwrap: options.unwrap || false,
            rect: options.rect || '',
            lang: options.lang || 'eng',
            profiles: options.profile || ''
          }),
          signal: AbortSignal.timeout(this.timeout)
        })
        
        const result: PDFCoResponse = await response.json()
        
        if (result.error) {
          throw new Error(result.message || 'PDF.co API error')
        }
        
        // If async mode, we need to poll for the result
        if (options.async && result.jobId) {
          return await this.waitForJob(result.jobId)
        }
        
        // Parse the extracted text
        return this.parseTextResponse(result)
      } catch (error) {
        logger.error({ error, fileUrl }, 'PDF.co text extraction failed')
        throw error
      }
    })
  }
  
  /**
   * Extract structured data from PDF to JSON
   */
  async extractToJSON(
    fileUrl: string,
    options: PDFCoExtractOptions = {}
  ): Promise<any> {
    return this.rateLimiter(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/pdf/convert/to/json`, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fileUrl,
            async: options.async || false,
            inline: true,
            password: options.password || '',
            pages: options.pages || ''
          }),
          signal: AbortSignal.timeout(this.timeout)
        })
        
        const result: PDFCoResponse = await response.json()
        
        if (result.error) {
          throw new Error(result.message || 'PDF.co API error')
        }
        
        // If async mode, we need to poll for the result
        if (options.async && result.jobId) {
          return await this.waitForJob(result.jobId)
        }
        
        // Parse JSON response
        if (result.body) {
          return JSON.parse(result.body)
        }
        
        return result
      } catch (error) {
        logger.error({ error, fileUrl }, 'PDF.co JSON extraction failed')
        throw error
      }
    })
  }
  
  /**
   * Extract tables from PDF
   */
  async extractTables(
    fileUrl: string,
    options: PDFCoExtractOptions = {}
  ): Promise<any[]> {
    return this.rateLimiter(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/pdf/convert/to/csv`, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fileUrl,
            async: options.async || false,
            inline: true,
            password: options.password || '',
            pages: options.pages || ''
          }),
          signal: AbortSignal.timeout(this.timeout)
        })
        
        const result: PDFCoResponse = await response.json()
        
        if (result.error) {
          throw new Error(result.message || 'PDF.co API error')
        }
        
        // Parse CSV to tables
        if (result.body) {
          return this.parseCSVToTables(result.body)
        }
        
        return []
      } catch (error) {
        logger.error({ error, fileUrl }, 'PDF.co table extraction failed')
        throw error
      }
    })
  }
  
  /**
   * Convert PDF pages to images for multimodal processing
   */
  async convertToImages(
    fileUrl: string,
    options: { pages?: string; resolution?: number } = {}
  ): Promise<string[]> {
    return this.rateLimiter(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/pdf/convert/to/png`, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fileUrl,
            pages: options.pages || '0-2', // First 3 pages by default
            resolution: options.resolution || 150
          }),
          signal: AbortSignal.timeout(this.timeout)
        })
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.message || 'PDF.co API error')
        }
        
        // Returns array of image URLs
        return result.urls || []
      } catch (error) {
        logger.error({ error, fileUrl }, 'PDF.co image conversion failed')
        throw error
      }
    })
  }
  
  /**
   * Use Document Parser for advanced extraction with templates
   */
  async parseDocument(
    fileUrl: string,
    templateId?: string,
    templateData?: any
  ): Promise<any> {
    return this.rateLimiter(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/pdf/documentparser`, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fileUrl,
            templateId: templateId,
            template: templateData,
            outputFormat: 'JSON',
            generateCsvHeaders: true,
            async: false,
            inline: true
          }),
          signal: AbortSignal.timeout(this.timeout)
        })
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.message || 'PDF.co API error')
        }
        
        if (result.body) {
          return JSON.parse(result.body)
        }
        
        return result
      } catch (error) {
        logger.error({ error, fileUrl }, 'PDF.co document parsing failed')
        throw error
      }
    })
  }
  
  /**
   * Get PDF metadata and info
   */
  async getInfo(fileUrl: string): Promise<any> {
    return this.rateLimiter(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/pdf/info`, {
          method: 'POST',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fileUrl
          }),
          signal: AbortSignal.timeout(this.timeout)
        })
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.message || 'PDF.co API error')
        }
        
        return result.info || {}
      } catch (error) {
        logger.error({ error, fileUrl }, 'PDF.co info extraction failed')
        throw error
      }
    })
  }
  
  /**
   * Upload file to PDF.co temporary storage
   */
  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    return this.rateLimiter(async () => {
      try {
        // First, get presigned URL for upload
        const presignedResponse = await fetch(`${this.baseUrl}/file/upload/get-presigned-url`, {
          method: 'GET',
          headers: {
            'x-api-key': this.apiKey
          },
          signal: AbortSignal.timeout(this.timeout)
        })
        
        const presignedData = await presignedResponse.json()
        
        if (presignedData.error) {
          throw new Error(presignedData.message || 'Failed to get upload URL')
        }
        
        // Upload file to presigned URL
        const uploadResponse = await fetch(presignedData.presignedUrl, {
          method: 'PUT',
          headers: {
            'x-api-key': this.apiKey,
            'Content-Type': 'application/octet-stream'
          },
          body: buffer,
          signal: AbortSignal.timeout(this.timeout)
        })
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to PDF.co')
        }
        
        // Return the URL where file is available
        return presignedData.url
      } catch (error) {
        logger.error({ error, fileName }, 'PDF.co file upload failed')
        throw error
      }
    })
  }
  
  /**
   * Wait for async job to complete
   */
  private async waitForJob(jobId: string, maxAttempts: number = 30): Promise<any> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      
      const response = await fetch(`${this.baseUrl}/job/check`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
      })
      
      const result = await response.json()
      
      if (result.status === 'success') {
        return result
      } else if (result.status === 'error') {
        throw new Error(result.message || 'Job failed')
      }
      
      attempts++
    }
    
    throw new Error('Job timeout')
  }
  
  /**
   * Parse text response into structured format
   */
  private parseTextResponse(response: PDFCoResponse): ExtractedContent {
    const text = response.body || ''
    const pages = this.splitIntoPages(text)
    
    return {
      text,
      pages: pages.map((pageText, index) => ({
        pageNumber: index + 1,
        text: pageText
      })),
      metadata: {
        pageCount: response.pageCount || pages.length
      }
    }
  }
  
  /**
   * Split text into pages
   */
  private splitIntoPages(text: string): string[] {
    // PDF.co typically separates pages with form feed character or page markers
    const pages = text.split(/\f|\[Page \d+\]/)
      .map(page => page.trim())
      .filter(page => page.length > 0)
    
    return pages.length > 0 ? pages : [text]
  }
  
  /**
   * Parse CSV to table arrays
   */
  private parseCSVToTables(csv: string): any[] {
    const lines = csv.split('\n')
    const tables: any[] = []
    let currentTable: string[][] = []
    
    for (const line of lines) {
      if (line.trim()) {
        const cells = line.split(',').map(cell => 
          cell.trim().replace(/^"|"$/g, '')
        )
        currentTable.push(cells)
      } else if (currentTable.length > 0) {
        // Empty line indicates table boundary
        tables.push(currentTable)
        currentTable = []
      }
    }
    
    if (currentTable.length > 0) {
      tables.push(currentTable)
    }
    
    return tables
  }
}

// Factory function
export function createPDFCoClient(apiKey?: string): PDFCoClient {
  return new PDFCoClient({
    apiKey: apiKey || process.env.PDFCO_API_KEY || ''
  })
}