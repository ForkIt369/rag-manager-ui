# File Format Processors

## Overview

Each file format requires specialized processing to extract content effectively. This document details the implementation for each supported format.

## PDF Processing

### Strategy: Visual + Text Hybrid

PDFs are processed using a dual approach:
1. **Visual Processing**: Convert pages to high-resolution images for multimodal embedding
2. **Text Extraction**: Fallback for simple text-based PDFs

```typescript
// convex/actions/parsers/pdfParser.ts
import { fromPath } from 'pdf2pic'
import * as pdfParse from 'pdf-parse'
import * as pdfjsLib from 'pdfjs-dist'

export class PDFProcessor {
  async process(file: Blob): Promise<ProcessedContent> {
    const strategy = await this.detectStrategy(file)
    
    if (strategy === 'visual') {
      return this.processVisual(file)
    } else {
      return this.processText(file)
    }
  }

  private async processVisual(file: Blob) {
    // Convert PDF to images
    const pdf2pic = fromPath(file.path, {
      density: 300,           // 300 DPI for high quality
      saveFilename: 'page',
      savePath: './temp',
      format: 'png',
      width: 2550,           // A4 at 300 DPI
      height: 3300
    })

    const pageCount = await this.getPageCount(file)
    const pages: ProcessedPage[] = []

    for (let i = 1; i <= pageCount; i++) {
      const image = await pdf2pic(i)
      
      // Extract text using OCR if needed
      const text = await this.extractTextFromImage(image.path)
      
      pages.push({
        pageNumber: i,
        content: text,
        image: image.path,
        type: 'visual'
      })
    }

    return {
      pages,
      metadata: await this.extractMetadata(file),
      processingType: 'visual'
    }
  }

  private async processText(file: Blob) {
    const buffer = await file.arrayBuffer()
    const data = await pdfParse(Buffer.from(buffer))
    
    return {
      pages: [{
        pageNumber: 1,
        content: data.text,
        type: 'text'
      }],
      metadata: {
        ...data.info,
        pageCount: data.numpages
      },
      processingType: 'text'
    }
  }

  private async detectStrategy(file: Blob): Promise<'visual' | 'text'> {
    // Check if PDF contains complex layouts, images, or tables
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument(buffer).promise
    const page = await pdf.getPage(1)
    
    const operators = await page.getOperatorList()
    const hasImages = operators.fnArray.includes(
      pdfjsLib.OPS.paintImageXObject
    )
    
    // Use visual processing for complex PDFs
    return hasImages ? 'visual' : 'text'
  }
}
```

### Chunking Strategy for PDFs

```typescript
export class PDFChunker {
  chunk(pages: ProcessedPage[]): Chunk[] {
    const chunks: Chunk[] = []
    
    for (const page of pages) {
      if (page.type === 'visual') {
        // For visual pages, create one chunk per page
        chunks.push({
          content: page.content,
          metadata: {
            pageNumber: page.pageNumber,
            type: 'visual',
            imagePath: page.image
          },
          embedding: null // Will be filled by multimodal embedding
        })
      } else {
        // For text pages, apply semantic chunking
        const pageChunks = this.semanticChunk(page.content, {
          maxTokens: 1000,
          overlap: 100
        })
        
        chunks.push(...pageChunks.map((chunk, index) => ({
          content: chunk,
          metadata: {
            pageNumber: page.pageNumber,
            chunkIndex: index,
            type: 'text'
          },
          embedding: null
        })))
      }
    }
    
    return chunks
  }
}
```

## DOCX Processing

### Strategy: Rich Text Extraction

```typescript
// convex/actions/parsers/docxParser.ts
import * as mammoth from 'mammoth'

export class DOCXProcessor {
  async process(file: Blob): Promise<ProcessedContent> {
    const buffer = await file.arrayBuffer()
    
    // Extract with formatting
    const result = await mammoth.convertToHtml({
      arrayBuffer: buffer,
      options: {
        includeDefaultStyleMap: true,
        convertImage: mammoth.images.imgElement((image) => {
          return image.read("base64").then((imageBuffer) => {
            return {
              src: `data:${image.contentType};base64,${imageBuffer}`
            }
          })
        })
      }
    })
    
    // Extract plain text for embeddings
    const textResult = await mammoth.extractRawText({
      arrayBuffer: buffer
    })
    
    // Parse structure
    const structure = this.parseDocumentStructure(result.value)
    
    return {
      content: textResult.value,
      html: result.value,
      structure,
      metadata: {
        warnings: result.messages,
        hasImages: result.value.includes('<img')
      }
    }
  }

  private parseDocumentStructure(html: string) {
    const $ = cheerio.load(html)
    const structure = {
      headings: [] as Heading[],
      paragraphs: [] as string[],
      lists: [] as List[],
      tables: [] as Table[]
    }
    
    // Extract headings with hierarchy
    $('h1, h2, h3, h4, h5, h6').each((i, el) => {
      structure.headings.push({
        level: parseInt(el.tagName[1]),
        text: $(el).text(),
        index: i
      })
    })
    
    // Extract tables
    $('table').each((i, el) => {
      const rows = []
      $(el).find('tr').each((j, tr) => {
        const cells = []
        $(tr).find('td, th').each((k, td) => {
          cells.push($(td).text())
        })
        rows.push(cells)
      })
      structure.tables.push({ rows, index: i })
    })
    
    return structure
  }
}
```

## EPUB Processing

### Strategy: Chapter-Based Extraction

```typescript
// convex/actions/parsers/epubParser.ts
import * as EPub from 'epub2'

export class EPUBProcessor {
  async process(file: Blob): Promise<ProcessedContent> {
    const buffer = await file.arrayBuffer()
    const epub = await EPub.createAsync(buffer)
    
    const metadata = {
      title: epub.metadata.title,
      creator: epub.metadata.creator,
      language: epub.metadata.language,
      publisher: epub.metadata.publisher,
      description: epub.metadata.description
    }
    
    const chapters: Chapter[] = []
    
    // Process each chapter
    for (const chapter of epub.flow) {
      const content = await epub.getChapterAsync(chapter.id)
      const text = this.htmlToText(content)
      
      chapters.push({
        id: chapter.id,
        title: chapter.title,
        order: chapter.order,
        content: text,
        level: chapter.level
      })
    }
    
    return {
      chapters,
      metadata,
      tableOfContents: epub.toc
    }
  }

  private htmlToText(html: string): string {
    const $ = cheerio.load(html)
    
    // Remove scripts and styles
    $('script, style').remove()
    
    // Preserve paragraph breaks
    $('p').append('\n\n')
    $('br').replaceWith('\n')
    
    return $.text().trim()
  }
}
```

### EPUB Chunking Strategy

```typescript
export class EPUBChunker {
  chunk(chapters: Chapter[]): Chunk[] {
    const chunks: Chunk[] = []
    
    for (const chapter of chapters) {
      // Respect chapter boundaries
      if (chapter.content.length < 2000) {
        // Small chapters as single chunks
        chunks.push({
          content: chapter.content,
          metadata: {
            chapterTitle: chapter.title,
            chapterOrder: chapter.order,
            type: 'chapter'
          }
        })
      } else {
        // Large chapters need sub-chunking
        const subChunks = this.semanticChunk(chapter.content, {
          maxTokens: 1000,
          preserveParagraphs: true
        })
        
        chunks.push(...subChunks.map((chunk, index) => ({
          content: chunk,
          metadata: {
            chapterTitle: chapter.title,
            chapterOrder: chapter.order,
            subChunkIndex: index,
            type: 'chapter-section'
          }
        })))
      }
    }
    
    return chunks
  }
}
```

## Spreadsheet Processing (XLSX/CSV)

### Strategy: Table to Markdown

```typescript
// convex/actions/parsers/spreadsheetParser.ts
import * as XLSX from 'xlsx'
import { parse } from 'csv-parse'

export class SpreadsheetProcessor {
  async process(file: Blob, type: 'xlsx' | 'csv'): Promise<ProcessedContent> {
    if (type === 'xlsx') {
      return this.processExcel(file)
    } else {
      return this.processCSV(file)
    }
  }

  private async processExcel(file: Blob) {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    const sheets: ProcessedSheet[] = []
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON for analysis
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '' 
      })
      
      // Generate markdown table
      const markdown = this.jsonToMarkdownTable(jsonData)
      
      // Analyze data types
      const analysis = this.analyzeSheet(jsonData)
      
      sheets.push({
        name: sheetName,
        markdown,
        rowCount: jsonData.length,
        columnCount: jsonData[0]?.length || 0,
        analysis
      })
    }
    
    return { sheets }
  }

  private jsonToMarkdownTable(data: any[][]): string {
    if (data.length === 0) return ''
    
    const headers = data[0]
    const rows = data.slice(1)
    
    // Build markdown table
    let markdown = '| ' + headers.join(' | ') + ' |\n'
    markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'
    
    for (const row of rows) {
      markdown += '| ' + row.join(' | ') + ' |\n'
    }
    
    return markdown
  }

  private analyzeSheet(data: any[][]) {
    return {
      hasHeaders: this.detectHeaders(data),
      dataTypes: this.detectColumnTypes(data),
      summary: this.generateSummary(data)
    }
  }
}
```

## Image Processing

### Strategy: Direct Multimodal Embedding

```typescript
// convex/actions/parsers/imageParser.ts
import sharp from 'sharp'
import Tesseract from 'tesseract.js'

export class ImageProcessor {
  async process(file: Blob): Promise<ProcessedContent> {
    const buffer = await file.arrayBuffer()
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata()
    
    // Optimize for embedding
    const optimized = await this.optimizeForEmbedding(buffer)
    
    // Extract text if present
    const extractedText = await this.extractText(buffer)
    
    return {
      image: optimized,
      text: extractedText,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        hasAlpha: metadata.hasAlpha,
        density: metadata.density
      }
    }
  }

  private async optimizeForEmbedding(buffer: ArrayBuffer) {
    // Resize if too large (max 16M pixels for Voyage)
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    const maxPixels = 16000000
    const currentPixels = metadata.width * metadata.height
    
    if (currentPixels > maxPixels) {
      const scale = Math.sqrt(maxPixels / currentPixels)
      const newWidth = Math.floor(metadata.width * scale)
      const newHeight = Math.floor(metadata.height * scale)
      
      return image
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toBuffer()
    }
    
    return buffer
  }

  private async extractText(buffer: ArrayBuffer): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(
        Buffer.from(buffer),
        'eng',
        {
          logger: m => console.log(m)
        }
      )
      return text
    } catch (error) {
      return ''
    }
  }
}
```

## Text File Processing (TXT, MD, JSON, HTML)

### Strategy: Format-Aware Parsing

```typescript
// convex/actions/parsers/textParser.ts
import { marked } from 'marked'
import * as cheerio from 'cheerio'

export class TextProcessor {
  async process(file: Blob, type: string): Promise<ProcessedContent> {
    const text = await file.text()
    
    switch (type) {
      case 'markdown':
        return this.processMarkdown(text)
      case 'html':
        return this.processHTML(text)
      case 'json':
        return this.processJSON(text)
      default:
        return this.processPlainText(text)
    }
  }

  private processMarkdown(text: string) {
    const html = marked(text)
    const tokens = marked.lexer(text)
    
    return {
      content: text,
      html,
      structure: this.parseMarkdownStructure(tokens),
      metadata: {
        hasCode: text.includes('```'),
        hasTables: text.includes('|'),
        hasImages: text.includes('![')
      }
    }
  }

  private processHTML(html: string) {
    const $ = cheerio.load(html)
    
    // Remove unwanted elements
    $('script, style, nav, header, footer').remove()
    
    // Extract text content
    const text = $('body').text().trim()
    
    // Extract structure
    const structure = {
      title: $('title').text() || $('h1').first().text(),
      headings: $('h1, h2, h3').map((i, el) => ({
        level: parseInt(el.tagName[1]),
        text: $(el).text()
      })).get(),
      links: $('a[href]').map((i, el) => ({
        text: $(el).text(),
        href: $(el).attr('href')
      })).get()
    }
    
    return { content: text, structure }
  }

  private processJSON(text: string) {
    try {
      const data = JSON.parse(text)
      
      // Convert to readable format
      const formatted = JSON.stringify(data, null, 2)
      
      // Extract schema information
      const schema = this.extractJSONSchema(data)
      
      return {
        content: formatted,
        structure: schema,
        metadata: {
          isArray: Array.isArray(data),
          keys: Object.keys(data).length
        }
      }
    } catch (error) {
      // Invalid JSON, treat as text
      return this.processPlainText(text)
    }
  }
}
```

## Common Utilities

### File Type Detection

```typescript
import { fileTypeFromBuffer } from 'file-type'

export async function detectFileType(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer()
  const type = await fileTypeFromBuffer(new Uint8Array(buffer))
  
  if (type) {
    return type.mime
  }
  
  // Fallback to file extension
  const name = file.name || ''
  const ext = name.split('.').pop()?.toLowerCase()
  
  const mimeMap = {
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'epub': 'application/epub+zip',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    'html': 'text/html',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'json': 'application/json'
  }
  
  return mimeMap[ext] || 'application/octet-stream'
}
```

### Processing Router

```typescript
export class ProcessingRouter {
  private processors = {
    'application/pdf': new PDFProcessor(),
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': new DOCXProcessor(),
    'application/epub+zip': new EPUBProcessor(),
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': new SpreadsheetProcessor(),
    'text/csv': new SpreadsheetProcessor(),
    'text/html': new TextProcessor(),
    'text/plain': new TextProcessor(),
    'text/markdown': new TextProcessor(),
    'application/json': new TextProcessor(),
    'image/jpeg': new ImageProcessor(),
    'image/png': new ImageProcessor(),
    'image/webp': new ImageProcessor()
  }

  async route(file: Blob): Promise<ProcessedContent> {
    const mimeType = await detectFileType(file)
    const processor = this.processors[mimeType]
    
    if (!processor) {
      throw new Error(`Unsupported file type: ${mimeType}`)
    }
    
    return processor.process(file)
  }
}
```

## Next Steps

Continue to [Chunking Strategies](./05-chunking-strategies.md) for intelligent content segmentation.