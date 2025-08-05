import { query } from "./_generated/server";

// Comprehensive diagnostic function to check system status
export const systemDiagnostics = query({
  handler: async (ctx) => {
    try {
      // Get all documents
      const documents = await ctx.db
        .query("documents")
        .take(1000);

      // Get all chunks
      const chunks = await ctx.db
        .query("chunks")
        .take(1000);

      // Get all files
      const files = await ctx.db
        .query("files")
        .take(1000);

      // Get all queries
      const queries = await ctx.db
        .query("queries")
        .take(1000);

      // Analyze document statuses
      const statusCounts = {
        pending: documents.filter(d => d.status === "pending").length,
        processing: documents.filter(d => d.status === "processing").length,
        completed: documents.filter(d => d.status === "completed").length,
        error: documents.filter(d => d.status === "error").length,
        unknown: documents.filter(d => !["pending", "processing", "completed", "error"].includes(d.status)).length
      };

      // Get recent documents
      const recentDocuments = documents
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10)
        .map(doc => ({
          id: doc._id,
          title: doc.title,
          fileName: doc.fileName,
          status: doc.status,
          fileSize: doc.fileSize,
          fileType: doc.fileType,
          createdAt: new Date(doc.createdAt).toISOString(),
          updatedAt: new Date(doc.updatedAt).toISOString(),
          hasContent: !!doc.content,
          hasFileId: !!doc.fileId,
          tags: doc.tags,
          source: doc.source
        }));

      // Check for orphaned chunks (chunks without documents)
      const orphanedChunks = [];
      for (const chunk of chunks) {
        const docExists = documents.find(d => d._id === chunk.documentId);
        if (!docExists) {
          orphanedChunks.push({
            chunkId: chunk._id,
            documentId: chunk.documentId,
            chunkIndex: chunk.chunkIndex
          });
        }
      }

      // Check embedding status
      const chunksWithEmbeddings = chunks.filter(c => c.embedding && c.embedding.length > 0).length;
      const chunksWithoutEmbeddings = chunks.filter(c => !c.embedding || c.embedding.length === 0).length;

      // Calculate storage usage
      const totalStorageUsed = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

      // Check for documents without chunks
      const documentsWithoutChunks = [];
      for (const doc of documents) {
        const docChunks = chunks.filter(c => c.documentId === doc._id);
        if (docChunks.length === 0 && doc.status === "completed") {
          documentsWithoutChunks.push({
            id: doc._id,
            title: doc.title,
            status: doc.status,
            createdAt: new Date(doc.createdAt).toISOString()
          });
        }
      }

      // Find potential stuck documents (old pending/processing documents)
      const now = Date.now();
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      const stuckDocuments = documents
        .filter(doc => 
          (doc.status === "pending" || doc.status === "processing") && 
          doc.createdAt < oneDayAgo
        )
        .map(doc => ({
          id: doc._id,
          title: doc.title,
          status: doc.status,
          createdAt: new Date(doc.createdAt).toISOString(),
          hoursStuck: Math.floor((now - doc.createdAt) / (60 * 60 * 1000))
        }));

      return {
        timestamp: new Date().toISOString(),
        summary: {
          totalDocuments: documents.length,
          totalChunks: chunks.length,
          totalFiles: files.length,
          totalQueries: queries.length,
          totalStorageUsed,
          documentsWithoutChunks: documentsWithoutChunks.length,
          orphanedChunks: orphanedChunks.length,
          stuckDocuments: stuckDocuments.length
        },
        documentStatuses: statusCounts,
        embeddingStatus: {
          chunksWithEmbeddings,
          chunksWithoutEmbeddings,
          embeddingCoverage: chunks.length > 0 ? (chunksWithEmbeddings / chunks.length * 100).toFixed(2) + "%" : "0%"
        },
        recentDocuments,
        documentsWithoutChunks,
        orphanedChunks,
        stuckDocuments,
        issues: [
          ...(orphanedChunks.length > 0 ? [`Found ${orphanedChunks.length} orphaned chunks`] : []),
          ...(documentsWithoutChunks.length > 0 ? [`Found ${documentsWithoutChunks.length} completed documents without chunks`] : []),
          ...(stuckDocuments.length > 0 ? [`Found ${stuckDocuments.length} documents stuck in processing`] : []),
          ...(chunksWithoutEmbeddings > 0 ? [`Found ${chunksWithoutEmbeddings} chunks without embeddings`] : [])
        ]
      };
    } catch (error) {
      return {
        error: "Failed to run diagnostics",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      };
    }
  }
});

// Get documents by status for debugging
export const getDocumentsByStatus = query({
  args: {},
  handler: async (ctx) => {
    const allDocuments = await ctx.db
      .query("documents")
      .take(1000);

    const groupedByStatus = {
      pending: allDocuments.filter(d => d.status === "pending"),
      processing: allDocuments.filter(d => d.status === "processing"),
      completed: allDocuments.filter(d => d.status === "completed"),
      error: allDocuments.filter(d => d.status === "error"),
      unknown: allDocuments.filter(d => !["pending", "processing", "completed", "error"].includes(d.status))
    };

    return {
      statusCounts: {
        pending: groupedByStatus.pending.length,
        processing: groupedByStatus.processing.length,
        completed: groupedByStatus.completed.length,
        error: groupedByStatus.error.length,
        unknown: groupedByStatus.unknown.length
      },
      documents: groupedByStatus
    };
  }
});

// Search for documents by title or filename
export const searchDocuments = query({
  args: {},
  handler: async (ctx) => {
    const documents = await ctx.db
      .query("documents")
      .take(1000);

    return documents.map(doc => ({
      id: doc._id,
      title: doc.title,
      fileName: doc.fileName,
      status: doc.status,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
      tags: doc.tags,
      source: doc.source,
      hasContent: !!doc.content,
      hasFileId: !!doc.fileId,
      contentLength: doc.content ? doc.content.length : 0
    }));
  }
});