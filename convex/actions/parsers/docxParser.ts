"use node"

import mammoth from 'mammoth'
import { 
  FileProcessor, 
  ProcessedContent, 
  ProcessingOptions 
} from '../../lib/types/processing'
import { logger } from '../lib/monitoring'

export class DOCXParser implements FileProcessor {
  canProcess(fileType: string): boolean {
    return fileType === 'docx' || 
           fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  
  async process(
    fileBuffer: Buffer,
    options: ProcessingOptions
  ): Promise<ProcessedContent> {
    try {
      // Convert DOCX to HTML and plain text
      const result = await mammoth.convertToHtml({ buffer: fileBuffer })
      const textResult = await mammoth.extractRawText({ buffer: fileBuffer })
      
      // Extract metadata from the document
      const messages = result.messages
      const metadata = {
        conversionMessages: messages,
        wordCount: textResult.value.split(/\s+/).length
      }
      
      // Extract tables if enabled
      let tables = undefined
      if (options.extractTables) {
        tables = this.extractTablesFromHtml(result.value)
      }
      
      return {
        content: textResult.value,
        metadata,
        tables
      }
    } catch (error) {
      logger.error({ error }, 'Failed to parse DOCX')
      throw new Error(`DOCX parsing failed: ${error}`)
    }
  }
  
  private extractTablesFromHtml(html: string): any[] {
    const tables: any[] = []
    
    // Simple regex-based table extraction
    const tableRegex = /<table[^>]*>(.*?)<\/table>/gs
    const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs
    const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gs
    
    let tableMatch
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const tableHtml = tableMatch[1]
      const rows: string[][] = []
      let headers: string[] = []
      
      let rowMatch
      let isFirstRow = true
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        const rowHtml = rowMatch[1]
        const cells: string[] = []
        
        let cellMatch
        while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
          // Remove HTML tags from cell content
          const cellText = cellMatch[1].replace(/<[^>]*>/g, '').trim()
          cells.push(cellText)
        }
        
        if (isFirstRow) {
          headers = cells
          isFirstRow = false
        } else {
          rows.push(cells)
        }
      }
      
      if (headers.length > 0 || rows.length > 0) {
        tables.push({
          headers,
          rows,
          metadata: {
            extracted: true,
            source: 'docx'
          }
        })
      }
    }
    
    return tables
  }
}

export function createDOCXParser(): FileProcessor {
  return new DOCXParser()
}