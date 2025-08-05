import { query } from "./_generated/server";

// Get comprehensive analytics for the system
export const getSystemAnalytics = query({
  handler: async (ctx) => {
    // Get document stats
    const documents = await ctx.db
      .query("documents")
      .take(1000);
    
    const totalDocuments = documents.length;
    const completedDocuments = documents.filter(d => d.status === "completed").length;
    const pendingDocuments = documents.filter(d => d.status === "pending").length;
    const processingDocuments = documents.filter(d => d.status === "processing").length;
    
    // Calculate storage used
    const storageUsed = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    
    // Get chunk stats
    const chunks = await ctx.db
      .query("chunks")
      .take(1000);
    
    const totalSections = chunks.length;
    
    // Get query stats
    const queries = await ctx.db
      .query("queries")
      .withIndex("by_created")
      .order("desc")
      .take(1000);
    
    const totalQueries = queries.length;
    const avgQueryTime = totalQueries > 0
      ? queries.reduce((sum, q) => sum + q.responseTimeMs, 0) / totalQueries
      : 0;
    
    // Get top queries
    const queryMap = new Map<string, { count: number; avgScore: number }>();
    queries.forEach((q) => {
      const key = q.queryText.toLowerCase().trim();
      if (queryMap.has(key)) {
        const existing = queryMap.get(key)!;
        existing.count++;
        existing.avgScore = (existing.avgScore + q.topScore) / 2;
      } else {
        queryMap.set(key, { count: 1, avgScore: q.topScore });
      }
    });
    
    const topQueries = Array.from(queryMap.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avgScore: stats.avgScore,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Get document query stats
    const docQueryMap = new Map<string, { title: string; queryCount: number }>();
    queries.forEach((q) => {
      if (q.results && Array.isArray(q.results)) {
        q.results.forEach((result: any) => {
          if (result.documentId) {
            const doc = documents.find(d => d._id === result.documentId);
            if (doc) {
              if (docQueryMap.has(result.documentId)) {
                docQueryMap.get(result.documentId)!.queryCount++;
              } else {
                docQueryMap.set(result.documentId, {
                  title: doc.title,
                  queryCount: 1,
                });
              }
            }
          }
        });
      }
    });
    
    const documentStats = Array.from(docQueryMap.values())
      .sort((a, b) => b.queryCount - a.queryCount)
      .slice(0, 5);
    
    // Generate time series data (last 30 days)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const timeSeriesData = [];
    
    for (let i = 29; i >= 0; i--) {
      const dayStart = now - (i * dayMs);
      const dayEnd = dayStart + dayMs;
      const dateStr = new Date(dayStart).toISOString().split('T')[0];
      
      const dayQueries = queries.filter(q => 
        q.createdAt >= dayStart && q.createdAt < dayEnd
      );
      
      const dayUploads = documents.filter(d => 
        d.createdAt >= dayStart && d.createdAt < dayEnd
      );
      
      timeSeriesData.push({
        date: dateStr,
        queries: dayQueries.length,
        uploads: dayUploads.length,
      });
    }
    
    return {
      totalDocuments,
      completedDocuments,
      pendingDocuments,
      processingDocuments,
      totalSections,
      totalQueries,
      storageUsed,
      avgQueryTime: Math.round(avgQueryTime),
      topQueries,
      documentStats,
      timeSeriesData,
    };
  },
});