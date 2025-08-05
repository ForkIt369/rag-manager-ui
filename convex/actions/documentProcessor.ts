"use node"

import { action } from "../_generated/server"
import { internal } from "../_generated/api"
import { v } from "convex/values"
import { Id } from "../_generated/dataModel"

import { createPDFParser } from './parsers/pdfParser'
import { createDOCXParser } from './parsers/docxParser'
import { createSpreadsheetParser } from './parsers/spreadsheetParser'
import { createTextParser } from './parsers/textParser'
import { createSemanticChunker } from './chunkers/semanticChunker'

import { VoyageClient } from './lib/voyage'
import { validateFile } from './lib/fileUtils'
import { 
  ProcessingTimer, 
  logProcessingStart, 
  logProcessingComplete,
  logProcessingError,
  recordChunkMetrics,
  logger
} from './lib/monitoring'

import { 
  FileProcessor, 
  ProcessedContent, 
  ProcessingOptions,
  ProcessedChunk 
} from '../lib/types/processing'

// Initialize processors
const processors: Map<string, FileProcessor> = new Map([
  ['pdf', createPDFParser()],
  ['docx', createDOCXParser()],
  ['xlsx', createSpreadsheetParser()],
  ['xls', createSpreadsheetParser()],
  ['csv', createSpreadsheetParser()],
  ['txt', createTextParser()],
  ['md', createTextParser()],
  ['html', createTextParser()],
  ['json', createTextParser()],
])

export const processDocument = action({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const timer = new ProcessingTimer()
    const { documentId } = args
    
    try {
      // Get document from database
      const document = await ctx.runQuery(internal.documents.getById, { 
        id: documentId 
      })
      
      if (!document) {
        throw new Error(`Document ${documentId} not found`)
      }
      
      logProcessingStart(
        documentId,
        document.fileName,
        document.fileType,
        document.fileSize
      )
      
      // Update status to processing
      await ctx.runMutation(internal.documents.updateStatus, {
        id: documentId,
        status: "processing"
      })
      
      // Create processing job
      await ctx.runMutation(internal.processingJobs.create, {
        documentId,
        status: "processing",
        stage: "downloading",
        progress: 0,
        startedAt: Date.now()
      })
      
      // Download file from storage
      timer.startStage('download')
      const fileBlob = await ctx.storage.get(document.fileId as Id<"_storage">)
      
      if (!fileBlob) {
        throw new Error('File not found in storage')
      }
      
      const fileBuffer = Buffer.from(await fileBlob.arrayBuffer())
      timer.endStage('download', document.fileType)
      
      // Update job progress
      await ctx.runMutation(internal.processingJobs.updateProgress, {
        documentId,
        stage: "parsing",
        progress: 20
      })
      
      // Process the document
      timer.startStage('parsing')
      const processedContent = await processFile(
        fileBuffer,
        document.fileName,
        document.fileType
      )
      timer.endStage('parsing', document.fileType)
      
      // Update job progress
      await ctx.runMutation(internal.processingJobs.updateProgress, {
        documentId,
        stage: "chunking",
        progress: 40
      })
      
      // Chunk the content
      timer.startStage('chunking')
      const chunks = await chunkContent(processedContent)
      timer.endStage('chunking', document.fileType)
      
      recordChunkMetrics(document.fileType, chunks.length)
      
      // Update job progress
      await ctx.runMutation(internal.processingJobs.updateProgress, {
        documentId,
        stage: "embedding",
        progress: 60
      })
      
      // Generate embeddings
      timer.startStage('embedding')
      const embeddedChunks = await generateEmbeddings(chunks, processedContent)
      timer.endStage('embedding', document.fileType)
      
      // Update job progress
      await ctx.runMutation(internal.processingJobs.updateProgress, {
        documentId,
        stage: "storing",
        progress: 80
      })
      
      // Store chunks in database
      timer.startStage('storing')
      await storeChunks(ctx, documentId, embeddedChunks)
      timer.endStage('storing', document.fileType)
      
      // Update document with final metadata
      const processingTime = timer.getTotalTime()
      await ctx.runMutation(internal.documents.updateProcessingComplete, {
        id: documentId,
        chunkCount: chunks.length,
        processingTime,
        metadata: processedContent.metadata
      })
      
      // Complete the processing job
      await ctx.runMutation(internal.processingJobs.complete, {
        documentId,
        completedAt: Date.now()
      })
      
      logProcessingComplete(documentId, chunks.length, processingTime)
      
      return {
        success: true,
        chunkCount: chunks.length,
        processingTime
      }
      
    } catch (error: any) {
      logProcessingError(documentId, 'processing', error, document?.fileType)
      
      // Update document status to error
      await ctx.runMutation(internal.documents.updateStatus, {
        id: documentId,
        status: "error",
        error: error.message
      })
      
      // Update job with error
      await ctx.runMutation(internal.processingJobs.setError, {
        documentId,
        error: error.message
      })
      
      throw error
    }
  }
})

async function processFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<ProcessedContent> {
  // Validate file
  const fileInfo = await validateFile(fileBuffer, fileName)
  
  // Find appropriate processor
  const processor = processors.get(fileType.toLowerCase()) || 
                   processors.get('txt') // Default to text parser
  
  if (!processor) {
    throw new Error(`No processor available for file type: ${fileType}`)
  }
  
  const options: ProcessingOptions = {
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1000'),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200'),
    embeddingModel: 'voyage-3',
    includeImages: fileType === 'pdf',
    extractTables: true,
    ocrEnabled: false
  }
  
  return processor.process(fileBuffer, options)
}

async function chunkContent(
  content: ProcessedContent
): Promise<ProcessedChunk[]> {
  const chunker = createSemanticChunker()
  
  const options: ProcessingOptions = {
    chunkSize: parseInt(process.env.CHUNK_SIZE || '1000'),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || '200'),
    embeddingModel: 'voyage-3',
    includeImages: false,
    extractTables: false,
    ocrEnabled: false
  }
  
  const textChunks = await chunker.chunk(content.content, options)
  
  // Add table content as separate chunks if present
  if (content.tables && content.tables.length > 0) {
    for (const table of content.tables) {
      const tableText = `Table:\n${table.headers.join(' | ')}\n${table.rows.map(r => r.join(' | ')).join('\n')}`
      
      textChunks.push({
        content: tableText,
        startIndex: -1,
        endIndex: -1,
        tokens: Math.ceil(tableText.length / 4),
        metadata: {
          type: 'table',
          ...table.metadata
        }
      })
    }
  }
  
  return textChunks
}

async function generateEmbeddings(
  chunks: ProcessedChunk[],
  processedContent: ProcessedContent
): Promise<Array<ProcessedChunk & { embedding: number[] }>> {
  const voyageClient = new VoyageClient(process.env.VOYAGE_API_KEY!)
  
  // Prepare texts for embedding
  const texts = chunks.map(chunk => chunk.content)
  
  // Check if we should use multimodal embeddings
  const useMultimodal = processedContent.images && 
                       processedContent.images.length > 0 &&
                       chunks.length <= 50 // Limit for multimodal
  
  let embeddings: number[][]
  
  if (useMultimodal && processedContent.images) {
    // Combine text chunks with images for multimodal embedding
    const multimodalInputs = chunks.slice(0, 10).map((chunk, i) => ({
      text: chunk.content,
      image: processedContent.images![Math.min(i, processedContent.images!.length - 1)]?.base64
    }))
    
    embeddings = await voyageClient.embedMultimodal(multimodalInputs)
    
    // For remaining chunks, use text embeddings
    if (chunks.length > 10) {
      const textEmbeddings = await voyageClient.embedTexts(
        texts.slice(10),
        'voyage-3'
      )
      embeddings = [...embeddings, ...textEmbeddings]
    }
  } else {
    // Use text embeddings for all chunks
    embeddings = await voyageClient.embedTexts(texts, 'voyage-3')
  }
  
  return chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i] || []
  }))
}

async function storeChunks(
  ctx: any,
  documentId: Id<"documents">,
  chunks: Array<ProcessedChunk & { embedding: number[] }>
): Promise<void> {
  const batchSize = 10
  
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize)
    
    await Promise.all(
      batch.map((chunk, index) =>
        ctx.runMutation(internal.chunks.create, {
          documentId,
          content: chunk.content,
          embedding: chunk.embedding,
          embeddingModel: 'voyage-3',
          embeddingDimension: chunk.embedding.length,
          chunkIndex: i + index,
          tokens: chunk.tokens,
          metadata: chunk.metadata,
          createdAt: Date.now()
        })
      )
    )
  }
}