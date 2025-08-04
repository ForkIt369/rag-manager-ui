import { ConvexHttpClient } from "convex/browser";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
}

export const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// API client functions for the RAG system
export class RAGApiClient {
  private client: ConvexHttpClient;

  constructor(client: ConvexHttpClient) {
    this.client = client;
  }

  // Document operations
  async uploadDocument(file: File, metadata?: any) {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    // This would typically use the Convex file storage API
    // For now, we'll simulate the upload process
    try {
      return await this.client.mutation("documents:upload" as any, { 
        filename: file.name,
        size: file.size,
        type: file.type,
        metadata 
      });
    } catch (error) {
      // Mock response for development
      return { documentId: `doc_${Date.now()}` };
    }
  }

  async getDocuments(filter?: any) {
    try {
      return await this.client.query("documents:list" as any, filter || {});
    } catch (error) {
      console.warn("Documents not available:", error);
      return [];
    }
  }

  async getDocument(id: string) {
    try {
      return await this.client.query("documents:get" as any, { id });
    } catch (error) {
      console.warn("Document not available:", error);
      return null;
    }
  }

  async deleteDocument(id: string) {
    try {
      return await this.client.mutation("documents:delete" as any, { id });
    } catch (error) {
      console.warn("Delete document not available:", error);
      return null;
    }
  }

  async updateDocument(id: string, updates: any) {
    try {
      return await this.client.mutation("documents:update" as any, { id, ...updates });
    } catch (error) {
      console.warn("Update document not available:", error);
      return null;
    }
  }

  // Search operations
  async search(query: string, options?: any) {
    try {
      return await this.client.action("vectorSearch:search" as any, { 
        query, 
        ...options 
      });
    } catch (error) {
      console.warn("Vector search not available:", error);
      return [];
    }
  }

  async searchV2(query: string, options?: any) {
    try {
      return await this.client.action("vectorSearchV2:search" as any, { 
        query, 
        ...options 
      });
    } catch (error) {
      console.warn("Vector search V2 not available:", error);
      return [];
    }
  }

  // Document sections
  async getDocumentSections(documentId: string) {
    try {
      return await this.client.query("documentSections:list" as any, { documentId });
    } catch (error) {
      console.warn("Document sections not available:", error);
      return [];
    }
  }

  // Files
  async getFiles() {
    try {
      return await this.client.query("files:list" as any, {});
    } catch (error) {
      console.warn("Files not available:", error);
      return [];
    }
  }

  async deleteFile(id: string) {
    try {
      return await this.client.mutation("files:delete" as any, { id });
    } catch (error) {
      console.warn("Delete file not available:", error);
      return null;
    }
  }

  // Memory operations (if available)
  async getMemories() {
    try {
      return await this.client.query("memories:list" as any, {});
    } catch (error) {
      console.warn("Memories not available:", error);
      return [];
    }
  }

  async createMemory(content: string, metadata?: any) {
    try {
      return await this.client.mutation("memories:create" as any, { content, metadata });
    } catch (error) {
      console.warn("Create memory not available:", error);
      throw error;
    }
  }

  // Analytics (mock for now - would need to be implemented in Convex)
  async getAnalytics() {
    // This would be implemented as Convex queries
    // For now, return mock data
    return {
      totalDocuments: 0,
      totalSections: 0,
      totalQueries: 0,
      storageUsed: 0,
      avgQueryTime: 0,
      topQueries: [],
      documentStats: [],
      timeSeriesData: []
    };
  }
}

export const ragApi = new RAGApiClient(convex);