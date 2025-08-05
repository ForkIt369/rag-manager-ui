"use node"

import XLSX from 'xlsx'
import { parse as csvParse } from 'csv-parse/sync'
import { 
  FileProcessor, 
  ProcessedContent, 
  ProcessingOptions,
  ProcessedTable 
} from '../../lib/types/processing'
import { logger } from '../lib/monitoring'

export class SpreadsheetParser implements FileProcessor {
  canProcess(fileType: string): boolean {
    return ['xlsx', 'xls', 'csv'].includes(fileType) ||
           fileType.includes('spreadsheet') ||
           fileType === 'text/csv'
  }
  
  async process(
    fileBuffer: Buffer,
    options: ProcessingOptions
  ): Promise<ProcessedContent> {
    try {
      const fileType = this.detectSpreadsheetType(fileBuffer)
      
      if (fileType === 'csv') {
        return this.processCSV(fileBuffer, options)
      } else {
        return this.processExcel(fileBuffer, options)
      }
    } catch (error) {
      logger.error({ error }, 'Failed to parse spreadsheet')
      throw new Error(`Spreadsheet parsing failed: ${error}`)
    }
  }
  
  private detectSpreadsheetType(buffer: Buffer): string {
    // Check for CSV by looking at first few bytes
    const start = buffer.toString('utf-8', 0, Math.min(1000, buffer.length))
    if (this.looksLikeCSV(start)) {
      return 'csv'
    }
    return 'excel'
  }
  
  private looksLikeCSV(content: string): boolean {
    // Simple heuristic: contains commas and newlines, mostly printable
    const lines = content.split('\n').slice(0, 5)
    return lines.some(line => line.includes(',')) &&
           lines.length > 1
  }
  
  private async processCSV(
    fileBuffer: Buffer,
    options: ProcessingOptions
  ): Promise<ProcessedContent> {
    const content = fileBuffer.toString('utf-8')
    
    const records = csvParse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true
    })
    
    const headers = records.length > 0 ? Object.keys(records[0]) : []
    const rows = records.map(record => Object.values(record).map(String))
    
    const table: ProcessedTable = {
      headers,
      rows,
      metadata: {
        format: 'csv',
        rowCount: rows.length,
        columnCount: headers.length
      }
    }
    
    // Convert to text representation
    const textContent = this.tableToText(table)
    
    return {
      content: textContent,
      metadata: {
        format: 'csv',
        rowCount: rows.length,
        columnCount: headers.length
      },
      tables: [table]
    }
  }
  
  private async processExcel(
    fileBuffer: Buffer,
    options: ProcessingOptions
  ): Promise<ProcessedContent> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
    
    const tables: ProcessedTable[] = []
    let allContent = ''
    
    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON for easier processing
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: ''
      }) as string[][]
      
      if (jsonData.length === 0) continue
      
      const headers = jsonData[0].map(h => String(h || ''))
      const rows = jsonData.slice(1).map(row => 
        row.map(cell => String(cell || ''))
      )
      
      const table: ProcessedTable = {
        headers,
        rows,
        metadata: {
          sheetName,
          format: 'excel',
          rowCount: rows.length,
          columnCount: headers.length
        }
      }
      
      tables.push(table)
      
      // Add to text content
      allContent += `\n\nSheet: ${sheetName}\n`
      allContent += this.tableToText(table)
    }
    
    return {
      content: allContent.trim(),
      metadata: {
        format: 'excel',
        sheetCount: workbook.SheetNames.length,
        sheets: workbook.SheetNames
      },
      tables
    }
  }
  
  private tableToText(table: ProcessedTable): string {
    let text = ''
    
    // Add headers
    if (table.headers.length > 0) {
      text += table.headers.join(' | ') + '\n'
      text += table.headers.map(() => '---').join(' | ') + '\n'
    }
    
    // Add rows
    for (const row of table.rows) {
      text += row.join(' | ') + '\n'
    }
    
    return text
  }
}

export function createSpreadsheetParser(): FileProcessor {
  return new SpreadsheetParser()
}