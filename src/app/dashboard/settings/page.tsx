'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Key, Database, Bell, Shield, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    cohere: '',
    custom: ''
  });

  const [preferences, setPreferences] = useState({
    defaultModel: 'openai',
    chunkSize: '1000',
    overlapSize: '200',
    embeddingModel: 'text-embedding-ada-002',
    vectorDimensions: '1536'
  });

  const [notifications, setNotifications] = useState({
    uploadComplete: true,
    processingErrors: true,
    dailyDigest: false,
    weeklyReport: true
  });

  const handleSaveApiKeys = () => {
    // In a real app, this would save to backend
    console.log('Saving API keys:', apiKeys);
    alert('API keys saved successfully');
  };

  const handleSavePreferences = () => {
    console.log('Saving preferences:', preferences);
    alert('Preferences saved successfully');
  };

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notifications);
    alert('Notification settings saved successfully');
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your RAG Manager settings and preferences
          </p>
        </div>

        <Tabs defaultValue="api-keys" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-gray-400" />
                  API Keys Configuration
                </CardTitle>
                <CardDescription>
                  Configure API keys for different AI providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                    <Input
                      id="anthropic-key"
                      type="password"
                      placeholder="sk-ant-..."
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cohere-key">Cohere API Key</Label>
                    <Input
                      id="cohere-key"
                      type="password"
                      placeholder="..."
                      value={apiKeys.cohere}
                      onChange={(e) => setApiKeys({ ...apiKeys, cohere: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-key">Custom Endpoint API Key</Label>
                    <Input
                      id="custom-key"
                      type="password"
                      placeholder="Custom API key..."
                      value={apiKeys.custom}
                      onChange={(e) => setApiKeys({ ...apiKeys, custom: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveApiKeys} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save API Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-gray-400" />
                  Document Processing Settings
                </CardTitle>
                <CardDescription>
                  Configure how documents are processed and indexed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-model">Default AI Model</Label>
                    <Select
                      value={preferences.defaultModel}
                      onValueChange={(value) => setPreferences({ ...preferences, defaultModel: value })}
                    >
                      <SelectTrigger id="default-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="cohere">Cohere</SelectItem>
                        <SelectItem value="custom">Custom Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="embedding-model">Embedding Model</Label>
                    <Select
                      value={preferences.embeddingModel}
                      onValueChange={(value) => setPreferences({ ...preferences, embeddingModel: value })}
                    >
                      <SelectTrigger id="embedding-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-embedding-ada-002">text-embedding-ada-002</SelectItem>
                        <SelectItem value="text-embedding-3-small">text-embedding-3-small</SelectItem>
                        <SelectItem value="text-embedding-3-large">text-embedding-3-large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chunk-size">Chunk Size (tokens)</Label>
                    <Input
                      id="chunk-size"
                      type="number"
                      value={preferences.chunkSize}
                      onChange={(e) => setPreferences({ ...preferences, chunkSize: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overlap-size">Overlap Size (tokens)</Label>
                    <Input
                      id="overlap-size"
                      type="number"
                      value={preferences.overlapSize}
                      onChange={(e) => setPreferences({ ...preferences, overlapSize: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSavePreferences} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Processing Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-gray-400" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="upload-complete">Upload Complete</Label>
                      <p className="text-sm text-gray-500">
                        Notify when document upload is complete
                      </p>
                    </div>
                    <Switch
                      id="upload-complete"
                      checked={notifications.uploadComplete}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, uploadComplete: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="processing-errors">Processing Errors</Label>
                      <p className="text-sm text-gray-500">
                        Alert when document processing fails
                      </p>
                    </div>
                    <Switch
                      id="processing-errors"
                      checked={notifications.processingErrors}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, processingErrors: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily-digest">Daily Digest</Label>
                      <p className="text-sm text-gray-500">
                        Receive daily summary of activity
                      </p>
                    </div>
                    <Switch
                      id="daily-digest"
                      checked={notifications.dailyDigest}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, dailyDigest: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-report">Weekly Report</Label>
                      <p className="text-sm text-gray-500">
                        Get weekly analytics and insights
                      </p>
                    </div>
                    <Switch
                      id="weekly-report"
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, weeklyReport: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">API Key Rotation</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Regularly rotate API keys for better security
                    </p>
                    <Button variant="outline">Rotate Keys</Button>
                  </div>

                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-2">Access Logs</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View recent access logs and activity
                    </p>
                    <Button variant="outline">View Logs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}