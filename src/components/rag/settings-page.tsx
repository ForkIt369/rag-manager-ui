'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Brain, 
  Scissors, 
  Search, 
  Palette,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Settings as SettingsType } from '@/types';

interface SettingsPageProps {
  className?: string;
}

export function SettingsPage({ className }: SettingsPageProps) {
  const [settings, setSettings] = useState<SettingsType>({
    apiKeys: {
      openai: '',
      anthropic: '',
      voyageai: ''
    },
    models: {
      embedding: 'voyage-large-2-instruct',
      chat: 'gpt-4-turbo-preview'
    },
    chunking: {
      chunkSize: 1000,
      chunkOverlap: 200
    },
    search: {
      defaultLimit: 10,
      defaultThreshold: 0.7
    },
    ui: {
      theme: 'system',
      sidebarCollapsed: false
    }
  });

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'success' | 'error' | null>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load from localStorage or API
    const savedSettings = localStorage.getItem('rag-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage or API
      localStorage.setItem('rag-settings', JSON.stringify(settings));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // You would typically make an API call here to save settings
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (service: string) => {
    setTestingConnection(service);
    setConnectionStatus(prev => ({ ...prev, [service]: null }));

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success/failure
      const success = Math.random() > 0.3;
      setConnectionStatus(prev => ({ ...prev, [service]: success ? 'success' : 'error' }));
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [service]: 'error' }));
    } finally {
      setTestingConnection(null);
    }
  };

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const maskApiKey = (key: string): string => {
    if (!key) return '';
    if (key.length <= 8) return '*'.repeat(key.length);
    return key.substring(0, 4) + '*'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Settings
          </h2>
          <p className="text-muted-foreground">
            Configure your RAG system
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="chunking">Chunking</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="interface">Interface</TabsTrigger>
        </TabsList>

        {/* API Keys */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure API keys for various AI services
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex items-center gap-2">
                    {connectionStatus.openai === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {connectionStatus.openai === 'error' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('openai')}
                      disabled={testingConnection === 'openai' || !settings.apiKeys.openai}
                    >
                      {testingConnection === 'openai' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="openai-key"
                    type={showApiKeys.openai ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={showApiKeys.openai ? settings.apiKeys.openai || '' : maskApiKey(settings.apiKeys.openai || '')}
                    onChange={(e) => updateSetting('apiKeys.openai', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => toggleApiKeyVisibility('openai')}
                  >
                    {showApiKeys.openai ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Anthropic */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <div className="flex items-center gap-2">
                    {connectionStatus.anthropic === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {connectionStatus.anthropic === 'error' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('anthropic')}
                      disabled={testingConnection === 'anthropic' || !settings.apiKeys.anthropic}
                    >
                      {testingConnection === 'anthropic' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="anthropic-key"
                    type={showApiKeys.anthropic ? 'text' : 'password'}
                    placeholder="sk-ant-..."
                    value={showApiKeys.anthropic ? settings.apiKeys.anthropic || '' : maskApiKey(settings.apiKeys.anthropic || '')}
                    onChange={(e) => updateSetting('apiKeys.anthropic', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => toggleApiKeyVisibility('anthropic')}
                  >
                    {showApiKeys.anthropic ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Voyage AI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="voyageai-key">Voyage AI API Key</Label>
                  <div className="flex items-center gap-2">
                    {connectionStatus.voyageai === 'success' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {connectionStatus.voyageai === 'error' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('voyageai')}
                      disabled={testingConnection === 'voyageai' || !settings.apiKeys.voyageai}
                    >
                      {testingConnection === 'voyageai' ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        'Test'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    id="voyageai-key"
                    type={showApiKeys.voyageai ? 'text' : 'password'}
                    placeholder="pa-..."
                    value={showApiKeys.voyageai ? settings.apiKeys.voyageai || '' : maskApiKey(settings.apiKeys.voyageai || '')}
                    onChange={(e) => updateSetting('apiKeys.voyageai', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                    onClick={() => toggleApiKeyVisibility('voyageai')}
                  >
                    {showApiKeys.voyageai ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models */}
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Model Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select models for embedding and chat
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="embedding-model">Embedding Model</Label>
                <Select
                  value={settings.models.embedding}
                  onValueChange={(value) => updateSetting('models.embedding', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voyage-large-2-instruct">
                      Voyage Large 2 Instruct
                      <Badge variant="secondary" className="ml-2">Recommended</Badge>
                    </SelectItem>
                    <SelectItem value="voyage-large-2">Voyage Large 2</SelectItem>
                    <SelectItem value="text-embedding-3-large">OpenAI Text Large</SelectItem>
                    <SelectItem value="text-embedding-3-small">OpenAI Text Small</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="chat-model">Chat Model</Label>
                <Select
                  value={settings.models.chat}
                  onValueChange={(value) => updateSetting('models.chat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chunking */}
        <TabsContent value="chunking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Document Chunking
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure how documents are split into chunks
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="chunk-size">Chunk Size (characters)</Label>
                <Input
                  id="chunk-size"
                  type="number"
                  min="100"
                  max="4000"
                  value={settings.chunking.chunkSize}
                  onChange={(e) => updateSetting('chunking.chunkSize', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 1000-2000 characters per chunk
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="chunk-overlap">Chunk Overlap (characters)</Label>
                <Input
                  id="chunk-overlap"
                  type="number"
                  min="0"
                  max="500"
                  value={settings.chunking.chunkOverlap}
                  onChange={(e) => updateSetting('chunking.chunkOverlap', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Overlap between chunks to maintain context
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure default search parameters
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="default-limit">Default Result Limit</Label>
                <Input
                  id="default-limit"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.search.defaultLimit}
                  onChange={(e) => updateSetting('search.defaultLimit', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of results to return by default
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="default-threshold">Similarity Threshold</Label>
                <Input
                  id="default-threshold"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.search.defaultThreshold}
                  onChange={(e) => updateSetting('search.defaultThreshold', parseFloat(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum similarity score (0.0 - 1.0) for results
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interface */}
        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Interface Settings
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Customize the user interface
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={settings.ui.theme}
                  onValueChange={(value: 'light' | 'dark' | 'system') => updateSetting('ui.theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="sidebar-collapsed">Collapsed Sidebar</Label>
                  <p className="text-xs text-muted-foreground">
                    Start with sidebar collapsed by default
                  </p>
                </div>
                <Switch
                  id="sidebar-collapsed"
                  checked={settings.ui.sidebarCollapsed}
                  onCheckedChange={(checked) => updateSetting('ui.sidebarCollapsed', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}