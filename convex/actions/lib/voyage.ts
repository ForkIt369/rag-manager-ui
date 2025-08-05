"use node"

import { VoyageAIClient } from 'voyageai'
import pLimit from 'p-limit'

export class VoyageClient {
  private client: VoyageAIClient
  private rateLimiter: ReturnType<typeof pLimit>
  
  constructor(apiKey: string) {
    this.client = new VoyageAIClient({
      apiKey: apiKey
    })
    
    // Rate limiting: 2000 requests per minute = ~33 per second
    this.rateLimiter = pLimit(30)
  }
  
  async embedTexts(
    texts: string[],
    model: string = 'voyage-3'
  ): Promise<number[][]> {
    try {
      const batchSize = 128
      const batches: string[][] = []
      
      for (let i = 0; i < texts.length; i += batchSize) {
        batches.push(texts.slice(i, i + batchSize))
      }
      
      const results = await Promise.all(
        batches.map(batch => 
          this.rateLimiter(() => this.embedBatch(batch, model))
        )
      )
      
      return results.flat()
    } catch (error) {
      console.error('Error generating embeddings:', error)
      throw new Error(`Failed to generate embeddings: ${error}`)
    }
  }
  
  private async embedBatch(
    texts: string[],
    model: string
  ): Promise<number[][]> {
    const response = await this.client.embed({
      input: texts,
      model: model,
      inputType: 'document'
    })
    
    return response.data?.map(item => item.embedding) || []
  }
  
  async embedMultimodal(
    inputs: Array<{ text?: string; image?: string }>,
    model: string = 'voyage-multimodal-3'
  ): Promise<number[][]> {
    try {
      const response = await this.client.multimodalEmbed({
        inputs: inputs,
        model: model,
        inputType: 'document'
      })
      
      return response.data?.map(item => item.embedding) || []
    } catch (error) {
      console.error('Error generating multimodal embeddings:', error)
      throw new Error(`Failed to generate multimodal embeddings: ${error}`)
    }
  }
  
  async embedCode(
    code: string[],
    model: string = 'voyage-code-3'
  ): Promise<number[][]> {
    return this.embedTexts(code, model)
  }
}