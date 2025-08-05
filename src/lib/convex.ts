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
      return await this.client.mutation("documents:createDocument" as any, { 
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        metadata,
        tags: metadata?.tags || [],
        source: metadata?.source || 'manual_upload'
      });
    } catch (error) {
      // Mock response for development
      return { documentId: `doc_${Date.now()}` };
    }
  }

  async getDocuments(filter?: any) {
    try {
      return await this.client.query("documents:listDocuments" as any, filter || {});
    } catch (error) {
      console.warn("Documents not available:", error);
      return [];
    }
  }

  async getDocument(id: string) {
    try {
      return await this.client.query("documents:getDocument" as any, { id });
    } catch (error) {
      console.warn("Document not available:", error);
      return null;
    }
  }

  async deleteDocument(id: string) {
    try {
      return await this.client.mutation("documents:deleteDocument" as any, { id });
    } catch (error) {
      console.warn("Delete document not available:", error);
      return null;
    }
  }

  async updateDocument(id: string, updates: any) {
    try {
      return await this.client.mutation("documents:updateDocument" as any, { id, ...updates });
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

  // Analytics - connected to real Convex data
  async getAnalytics() {
    try {
      // Try to use the dedicated analytics function first
      const analyticsData = await this.client.query("analytics:getSystemAnalytics" as any, {});
      if (analyticsData) {
        return analyticsData;
      }
    } catch (error) {
      console.warn("Analytics function not available, falling back to manual aggregation:", error);
    }

    try {
      // Fallback to manual aggregation
      const [documents, chunks, queries] = await Promise.all([
        this.client.query("documents:listDocuments" as any, { limit: 1000 }),
        this.client.query("chunks:getAllChunks" as any, {}) || { chunks: [] },
        this.client.query("queries:listQueries" as any, { limit: 1000 }) || { queries: [] }
      ]);

      const documentsList = documents?.documents || [];
      const chunksList = chunks?.chunks || [];
      const queriesList = queries?.queries || [];

      // Calculate storage used (approximate)
      let storageUsed = 0;
      documentsList.forEach((doc: any) => {
        if (doc.fileSize) {
          storageUsed += doc.fileSize;
        }
      });

      // Calculate average query time
      const avgQueryTime = queriesList.length > 0 
        ? queriesList.reduce((sum: number, q: any) => sum + (q.responseTimeMs || 0), 0) / queriesList.length 
        : 0;

      // Get top queries (group by query text and count)
      const queryMap = new Map();
      queriesList.forEach((q: any) => {
        const key = q.queryText;
        if (queryMap.has(key)) {
          const existing = queryMap.get(key);
          existing.count++;
          existing.totalScore += q.topScore || 0;
        } else {
          queryMap.set(key, {
            query: key,
            count: 1,
            totalScore: q.topScore || 0
          });
        }
      });

      const topQueries = Array.from(queryMap.values())
        .map((item: any) => ({
          query: item.query,
          count: item.count,
          avgScore: item.count > 0 ? item.totalScore / item.count : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get document stats (queries per document)
      const docQueryMap = new Map();
      queriesList.forEach((q: any) => {
        if (q.results && Array.isArray(q.results)) {
          q.results.forEach((result: any) => {
            const docId = result.documentId;
            if (docId) {
              if (docQueryMap.has(docId)) {
                const existing = docQueryMap.get(docId);
                existing.queryCount++;
                existing.totalScore += result.score || 0;
              } else {
                docQueryMap.set(docId, {
                  documentId: docId,
                  queryCount: 1,
                  totalScore: result.score || 0
                });
              }
            }
          });
        }
      });

      const documentStats = Array.from(docQueryMap.values())
        .map((item: any) => {
          const doc = documentsList.find((d: any) => d._id === item.documentId);
          return {
            documentId: item.documentId,
            title: doc?.title || 'Unknown Document',
            queryCount: item.queryCount,
            avgScore: item.queryCount > 0 ? item.totalScore / item.queryCount : 0
          };
        })
        .sort((a, b) => b.queryCount - a.queryCount)
        .slice(0, 5);

      // Generate time series data (last 30 days)
      const timeSeriesData = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayQueries = queriesList.filter((q: any) => {
          const qDate = new Date(q.createdAt).toISOString().split('T')[0];
          return qDate === dateStr;
        });

        const dayUploads = documentsList.filter((d: any) => {
          const dDate = new Date(d.createdAt).toISOString().split('T')[0];
          return dDate === dateStr;
        });

        timeSeriesData.push({
          date: dateStr,
          queries: dayQueries.length,
          uploads: dayUploads.length
        });
      }

      return {
        totalDocuments: documentsList.length,
        totalSections: chunksList.length,
        totalQueries: queriesList.length,
        storageUsed,
        avgQueryTime: Math.round(avgQueryTime),
        topQueries,
        documentStats,
        timeSeriesData
      };

    } catch (error) {
      console.warn("Analytics data unavailable, using fallback:", error);
      // Fallback to basic counts
      try {
        const documents = await this.client.query("documents:listDocuments" as any, { limit: 1000 });
        return {
          totalDocuments: documents?.documents?.length || 0,
          totalSections: 0,
          totalQueries: 0,
          storageUsed: 0,
          avgQueryTime: 0,
          topQueries: [],
          documentStats: [],
          timeSeriesData: []
        };
      } catch (fallbackError) {
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
  }

  // Query history operations
  async getQueryHistory(limit: number = 20) {
    try {
      const result = await this.client.query("queries:listQueries" as any, { 
        limit,
      });
      
      const queries = result?.queries || [];
      
      return queries.map((q: any) => ({
        id: q._id,
        query: q.queryText,
        timestamp: new Date(q.createdAt).toISOString(),
        resultCount: q.resultCount || 0,
        avgScore: q.topScore || 0,
        executionTime: q.responseTimeMs || 0
      }));
    } catch (error) {
      console.warn("Query history not available:", error);
      return [];
    }
  }

  // Save query to history
  async saveQuery(query: string, results: any[], executionTime: number) {
    try {
      const resultCount = results.length;
      const topScore = results.length > 0 ? Math.max(...results.map(r => r.score || 0)) : 0;
      
      return await this.client.mutation("queries:createQuery" as any, {
        queryText: query,
        resultCount,
        topScore,
        responseTimeMs: executionTime,
        results: results.slice(0, 10), // Store top 10 results
      });
    } catch (error) {
      console.warn("Failed to save query to history:", error);
      return null;
    }
  }
}

export const ragApi = new RAGApiClient(convex);