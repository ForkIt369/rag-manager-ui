"use node"

import { marked } from 'marked'
import { 
  FileProcessor, 
  ProcessedContent, 
  ProcessingOptions 
} from '../../lib/types/processing'
import { logger } from '../lib/monitoring'

export class TextParser implements FileProcessor {
  canProcess(fileType: string): boolean {
    return ['txt', 'md', 'markdown', 'html', 'htm', 'json', 'xml', 'yaml', 'yml'].includes(fileType) ||
           fileType.startsWith('text/')
  }
  
  async process(
    fileBuffer: Buffer,
    options: ProcessingOptions
  ): Promise<ProcessedContent> {
    try {
      const content = fileBuffer.toString('utf-8')
      const fileType = this.detectTextType(content)
      
      let processedText = content
      const metadata: any = {
        format: fileType,
        originalLength: content.length
      }
      
      switch (fileType) {
        case 'markdown':
          processedText = await this.processMarkdown(content)
          metadata.format = 'markdown'
          break
          
        case 'html':
          processedText = this.processHTML(content)
          metadata.format = 'html'
          break
          
        case 'json':
          processedText = this.processJSON(content)
          metadata.format = 'json'
          break
          
        default:
          // Plain text - minimal processing
          processedText = this.cleanPlainText(content)
          metadata.format = 'plain'
      }
      
      metadata.wordCount = processedText.split(/\s+/).length
      metadata.lineCount = processedText.split('\n').length
      
      return {
        content: processedText,
        metadata
      }
    } catch (error) {
      logger.error({ error }, 'Failed to parse text file')
      throw new Error(`Text parsing failed: ${error}`)
    }
  }
  
  private detectTextType(content: string): string {
    // Try to detect file type from content
    const trimmed = content.trim()
    
    // Check for JSON
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed)
        return 'json'
      } catch {
        // Not valid JSON
      }
    }
    
    // Check for HTML
    if (/<html|<body|<div|<p|<h[1-6]/i.test(content)) {
      return 'html'
    }
    
    // Check for Markdown
    if (/^#{1,6}\s|^\*{1,2}[^*]+\*{1,2}|^\[.+\]\(.+\)|^```/m.test(content)) {
      return 'markdown'
    }
    
    return 'plain'
  }
  
  private async processMarkdown(content: string): Promise<string> {
    // Convert markdown to HTML then strip tags
    const html = await marked.parse(content)
    // Simple HTML tag removal
    return html.replace(/<[^>]*>/g, '').trim()
  }
  
  private processHTML(content: string): string {
    // Simple HTML tag removal and structure preservation
    return content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n## $1\n\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()
  }
  
  private processJSON(content: string): string {
    try {
      const parsed = JSON.parse(content)
      
      // Convert JSON to readable text format
      return this.jsonToText(parsed)
    } catch (error) {
      // If JSON parsing fails, return as-is
      return content
    }
  }
  
  private jsonToText(obj: any, indent: number = 0): string {
    const spacing = '  '.repeat(indent)
    let result = ''
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        result += `${spacing}[${index}]:\n`
        result += this.jsonToText(item, indent + 1)
      })
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object') {
          result += `${spacing}${key}:\n`
          result += this.jsonToText(value, indent + 1)
        } else {
          result += `${spacing}${key}: ${value}\n`
        }
      })
    } else {
      result += `${spacing}${obj}\n`
    }
    
    return result
  }
  
  private cleanPlainText(content: string): string {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, '  ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
}

export function createTextParser(): FileProcessor {
  return new TextParser()
}