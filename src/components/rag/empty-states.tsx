'use client';

import React from 'react';
import { 
  Upload, 
  FileText, 
  Search, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap,
  Database,
  MessageSquare,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'no-documents' | 'no-results' | 'no-queries' | 'getting-started';
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ type, onAction, className }: EmptyStateProps) {
  const configs = {
    'no-documents': {
      icon: FileText,
      title: 'No documents yet',
      description: 'Start building your knowledge base by uploading your first document.',
      actionLabel: 'Upload Document',
      actionIcon: Upload
    },
    'no-results': {
      icon: Search,
      title: 'No results found',
      description: 'Try adjusting your search query or filters to find what you\'re looking for.',
      actionLabel: 'Clear Filters',
      actionIcon: null
    },
    'no-queries': {
      icon: MessageSquare,
      title: 'No queries yet',
      description: 'Ask questions about your documents to get intelligent answers.',
      actionLabel: 'Start New Query',
      actionIcon: Sparkles
    },
    'getting-started': {
      icon: Zap,
      title: 'Welcome to BroVerse RAG',
      description: 'Your intelligent document assistant is ready. Let\'s get you started!',
      actionLabel: 'Begin Setup',
      actionIcon: ArrowRight
    }
  };

  const config = configs[type];

  return (
    <div className={cn("flex items-center justify-center min-h-[400px] p-8", className)}>
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <config.icon className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{config.title}</h3>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        {config.actionLabel && (
          <Button onClick={onAction} className="gap-2">
            {config.actionIcon && <config.actionIcon className="h-4 w-4" />}
            {config.actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

interface OnboardingFlowProps {
  onComplete: () => void;
  className?: string;
}

export function OnboardingFlow({ onComplete, className }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    {
      title: 'Welcome to BroVerse RAG',
      description: 'Your AI-powered document intelligence platform',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Transform how you interact with documents using cutting-edge AI technology.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4">
              <Database className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold">Smart Storage</h4>
              <p className="text-sm text-muted-foreground">
                Organize and index your documents intelligently
              </p>
            </Card>
            <Card className="p-4">
              <Zap className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold">AI-Powered</h4>
              <p className="text-sm text-muted-foreground">
                Get instant answers from your documents
              </p>
            </Card>
            <Card className="p-4">
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <h4 className="font-semibold">Deep Insights</h4>
              <p className="text-sm text-muted-foreground">
                Discover connections and patterns
              </p>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: 'Upload Your Documents',
      description: 'Build your knowledge base',
      icon: Upload,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Start by uploading documents to create your personalized knowledge base.
          </p>
          <div className="bg-muted/50 rounded-lg p-6 border-2 border-dashed border-muted-foreground/25">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              Drag & drop files here or click to browse
            </p>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Supports PDF, DOCX, TXT, and more
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Your documents are processed securely and privately</span>
          </div>
        </div>
      )
    },
    {
      title: 'Ask Questions',
      description: 'Get intelligent answers instantly',
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Query your documents using natural language and get precise, contextual answers.
          </p>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Example queries:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  "What were the key findings from Q4 report?"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  "Summarize the main points of the contract"
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  "Compare revenue across all quarterly reports"
                </li>
              </ul>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2">
            <PlayCircle className="h-4 w-4" />
            Watch Demo
          </Button>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className={cn("max-w-2xl mx-auto p-8", className)}>
      <div className="space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStep 
                  ? "w-8 bg-primary" 
                  : index < currentStep 
                    ? "w-2 bg-primary/50" 
                    : "w-2 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <currentStepData.icon className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>
          <div className="min-h-[200px]">
            {currentStepData.content}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-4">
            <Button
              variant="link"
              onClick={onComplete}
              className="text-muted-foreground"
            >
              Skip
            </Button>
            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}