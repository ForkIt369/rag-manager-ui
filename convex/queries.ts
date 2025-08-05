import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List recent queries
export const listQueries = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const queries = await ctx.db
      .query("queries")
      .withIndex("by_created")
      .order("desc")
      .take(limit);
    
    return { queries };
  },
});

// Get a single query
export const getQuery = query({
  args: { id: v.id("queries") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new query record
export const createQuery = mutation({
  args: {
    queryText: v.string(),
    resultCount: v.number(),
    topScore: v.float64(),
    responseTimeMs: v.number(),
    results: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    const queryId = await ctx.db.insert("queries", {
      queryText: args.queryText,
      resultCount: args.resultCount,
      topScore: args.topScore,
      responseTimeMs: args.responseTimeMs,
      results: args.results || [],
      createdAt: Date.now(),
    });
    
    return { queryId };
  },
});

// Get query statistics
export const getQueryStats = query({
  handler: async (ctx) => {
    const queries = await ctx.db
      .query("queries")
      .take(1000);
    
    const totalQueries = queries.length;
    const avgResponseTime = totalQueries > 0
      ? queries.reduce((sum, q) => sum + q.responseTimeMs, 0) / totalQueries
      : 0;
    
    const avgResultCount = totalQueries > 0
      ? queries.reduce((sum, q) => sum + q.resultCount, 0) / totalQueries
      : 0;
    
    const avgTopScore = totalQueries > 0
      ? queries.reduce((sum, q) => sum + q.topScore, 0) / totalQueries
      : 0;
    
    return {
      totalQueries,
      avgResponseTime: Math.round(avgResponseTime),
      avgResultCount: Math.round(avgResultCount),
      avgTopScore: avgTopScore.toFixed(2),
    };
  },
});

// Get top queries
export const getTopQueries = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const queries = await ctx.db
      .query("queries")
      .take(1000);
    
    // Group by query text and count occurrences
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
    
    // Convert to array and sort by count
    const topQueries = Array.from(queryMap.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        avgScore: stats.avgScore,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return { topQueries };
  },
});