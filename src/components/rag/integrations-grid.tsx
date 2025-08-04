'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  ShoppingCart, 
  Package, 
  Database, 
  Globe, 
  MessageSquare, 
  Mail, 
  Slack, 
  Chrome,
  Github,
  Cloud,
  Zap,
  DollarSign,
  BarChart3,
  Shield,
  Users,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  category: string;
  enabled?: boolean;
  comingSoon?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Integrate your Shopify store with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: ShoppingCart,
    color: 'bg-green-500',
    category: 'Shopping Cart',
    enabled: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Integrate your Mailchimp with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Mail,
    color: 'bg-yellow-500',
    category: 'Sales & Marketing',
    enabled: true,
  },
  {
    id: 'salesforce',
    name: 'Sales Force',
    description: 'Integrate your Sales Force with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Cloud,
    color: 'bg-blue-500',
    category: 'Sales Force',
    enabled: true,
  },
  {
    id: 'hubspot',
    name: 'Hub Sport',
    description: 'Integrate your Hub Sport with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Zap,
    color: 'bg-orange-500',
    category: 'Hub Sport',
    enabled: true,
  },
  {
    id: 'etsy',
    name: 'Etsy',
    description: 'Integrate your Etsy with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Package,
    color: 'bg-orange-600',
    category: 'Etsy',
  },
  {
    id: 'aliexpress',
    name: 'Ali Express',
    description: 'Integrate your Mailchimp with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Globe,
    color: 'bg-red-500',
    category: 'Ali Express',
    enabled: true,
  },
  {
    id: 'ebay',
    name: 'ebay',
    description: 'Integrate your ebay with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: DollarSign,
    color: 'bg-red-600',
    category: 'ebay',
    enabled: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Integrate your WhatsApp with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: MessageSquare,
    color: 'bg-green-600',
    category: 'WhatsApp',
    enabled: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Integrate your Slack with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Slack,
    color: 'bg-purple-600',
    category: 'Slack',
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Integrate your Google with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Chrome,
    color: 'bg-blue-600',
    category: 'Google',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    description: 'Integrate your Microsoft with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Shield,
    color: 'bg-blue-700',
    category: 'Microsoft',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Integrate your Amazon with Interoly inventory to bridge the gap between your sales channel and inventory management',
    icon: Package,
    color: 'bg-orange-700',
    category: 'Amazon',
    enabled: true,
  },
];

export function IntegrationsGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Integrations</h2>
          <p className="text-gray-500 mt-1">
            Inventory and invoice, connect inventory management systems with other business platforms.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">All</Button>
          <Button variant="ghost" size="sm">Shopping Cart</Button>
          <Button variant="ghost" size="sm">Sales & Marketing</Button>
          <Button variant="ghost" size="sm">Zoho Apps</Button>
          <Button variant="ghost" size="sm">Marketplace</Button>
          <Button variant="ghost" size="sm">WhatsApp</Button>
          <Button variant="ghost" size="sm">Shipping</Button>
          <Button variant="ghost" size="sm">Other App</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn('p-3 rounded-lg', integration.color)}>
                <integration.icon className="h-6 w-6 text-white" />
              </div>
              <Switch
                checked={integration.enabled}
                disabled={!integration.enabled && !integration.comingSoon}
              />
            </div>
            <h3 className="font-semibold text-lg mb-2">{integration.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {integration.description}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={!integration.enabled && !integration.comingSoon}
            >
              Manage
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}