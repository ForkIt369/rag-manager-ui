'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  History, 
  Clock, 
  FileText, 
  Star,
  Copy,
  ExternalLink,
  Settings,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { SearchQuery, SearchResult, QueryHistoryItem } from '@/types';
import { ragApi } from '@/lib/convex';

interface QueryInterfaceProps {
  className?: string;
}

export function QueryInterface({ className }: QueryInterfaceProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [searchOptions, setSearchOptions] = useState({
    limit: 10,
    threshold: 0.7,
    includeContent: true
  });
  
  const queryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadQueryHistory();
  }, []);

  const loadQueryHistory = async () => {
    // Mock history for now - would be implemented in Convex
    const mockHistory: QueryHistoryItem[] = [
      {
        id: '1',
        query: 'What is machine learning?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resultCount: 5,
        avgScore: 0.85,
        executionTime: 120
      },
      {
        id: '2',
        query: 'Neural networks architecture',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        resultCount: 8,
        avgScore: 0.92,
        executionTime: 95
      }
    ];
    setHistory(mockHistory);
  };

  const executeSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const searchResults = await ragApi.searchV2(queryToSearch, searchOptions);
      const executionTime = Date.now() - startTime;
      
      setResults(searchResults || []);

      // Add to history
      const historyItem: QueryHistoryItem = {
        id: Date.now().toString(),
        query: queryToSearch,
        timestamp: new Date().toISOString(),
        resultCount: searchResults?.length || 0,
        avgScore: searchResults?.reduce((sum: number, r: SearchResult) => sum + r.score, 0) / (searchResults?.length || 1) || 0,
        executionTime
      };

      setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20

      if (!searchQuery) {
        setQuery('');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectHistoryItem = (item: QueryHistoryItem) => {
    setSelectedHistoryId(item.id);
    setQuery(item.query);
    executeSearch(item.query);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatScore = (score: number): string => {
    return (score * 100).toFixed(1) + '%';
  };

  const formatExecutionTime = (ms: number): string => {
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      {/* Query Interface */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Query Interface
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={queryInputRef}
                    placeholder="Ask a question about your documents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <Button 
                  onClick={() => executeSearch()}
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {/* Search Options */}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Limit: {searchOptions.limit}</span>
                <span>Threshold: {formatScore(searchOptions.threshold)}</span>
                <span>Include Content: {searchOptions.includeContent ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Search Results
                {results.length > 0 && (
                  <Badge variant="secondary">{results.length}</Badge>
                )}
              </span>
              {results.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Avg Score: {formatScore(results.reduce((sum: number, r: SearchResult) => sum + r.score, 0) / results.length)}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results yet. Try searching for something!</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={`${result.documentId}-${result.sectionId}-${index}`}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            {result.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {result.metadata.filename} • Section {result.metadata.sectionNumber}
                            {result.metadata.pageNumber && ` • Page ${result.metadata.pageNumber}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {formatScore(result.score)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(result.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.content}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Query History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No queries yet</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors',
                        selectedHistoryId === item.id && 'bg-accent border-primary'
                      )}
                      onClick={() => selectHistoryItem(item)}
                    >
                      <p className="text-sm font-medium line-clamp-2 mb-2">
                        {item.query}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatTimestamp(item.timestamp)}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.resultCount}
                          </Badge>
                          <span>{formatScore(item.avgScore)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <span>{formatExecutionTime(item.executionTime)}</span>
                        {item.avgScore > 0.9 && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Quick Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setQuery("What is the main topic discussed?")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Summarize Content
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setQuery("List the key concepts mentioned")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Extract Key Concepts
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setQuery("Find relevant examples or case studies")}
            >
              <Search className="h-4 w-4 mr-2" />
              Find Examples
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}