'use client';

import React, { useState } from 'react';
import { Search, FileText, Clock, BarChart2, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ragApi } from '@/lib/convex';

interface QueryResult {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  score: number;
  metadata?: any;
}

interface CleanQueryInterfaceProps {
  className?: string;
}

export function CleanQueryInterface({ className }: CleanQueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const searchResults = await ragApi.search(query, {
        limit: 10,
        includeContent: true
      });

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      // Transform results to match our interface
      const transformedResults: QueryResult[] = (searchResults || []).map((result: any, index: number) => ({
        id: result.id || `result-${index}`,
        documentId: result.documentId || '',
        documentTitle: result.documentTitle || 'Untitled Document',
        content: result.content || result.text || '',
        score: result.score || 0,
        metadata: result.metadata || {}
      }));

      setResults(transformedResults);

      // Save query to history
      await ragApi.saveQuery(query, transformedResults, endTime - startTime);
    } catch (err: any) {
      setError(err.message || 'Failed to execute search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Input */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Search Query
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your search query here..."
                className="min-h-[100px] pr-12 resize-none"
                disabled={loading}
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                size="sm"
                className="absolute bottom-3 right-3"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {executionTime !== null && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{executionTime}ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart2 className="h-3.5 w-3.5" />
                  <span>{results.length} results</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <h3 className="font-medium text-gray-900">
                          {result.documentTitle}
                        </h3>
                      </div>
                      <Badge className="bg-blue-100 text-blue-600 text-xs">
                        {(result.score * 100).toFixed(1)}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {result.content}
                    </p>
                    {result.metadata && Object.keys(result.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && query && results.length === 0 && !error && (
        <Card className="border-gray-200">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Try adjusting your search query or upload more documents to expand your knowledge base.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}