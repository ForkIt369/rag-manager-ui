# Monitoring and Analytics

## Overview

Comprehensive monitoring and analytics are essential for maintaining a healthy document processing pipeline. This guide covers metrics collection, visualization, alerting, and performance analysis.

## Metrics Architecture

### Core Metrics Framework

```typescript
// convex/lib/monitoring/metrics.ts
import { Counter, Histogram, Gauge, Registry } from 'prom-client'

export class MetricsCollector {
  private registry = new Registry()
  
  // Document processing metrics
  documentsProcessed = new Counter({
    name: 'documents_processed_total',
    help: 'Total number of documents processed',
    labelNames: ['status', 'file_type', 'processor'],
    registers: [this.registry]
  })
  
  processingDuration = new Histogram({
    name: 'document_processing_duration_seconds',
    help: 'Document processing duration in seconds',
    labelNames: ['file_type', 'stage'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
    registers: [this.registry]
  })
  
  chunkSize = new Histogram({
    name: 'chunk_size_tokens',
    help: 'Size of chunks in tokens',
    labelNames: ['file_type', 'chunking_strategy'],
    buckets: [100, 250, 500, 750, 1000, 1500, 2000],
    registers: [this.registry]
  })
  
  embeddingQueueSize = new Gauge({
    name: 'embedding_queue_size',
    help: 'Current size of embedding queue',
    registers: [this.registry]
  })
  
  // API metrics
  apiCalls = new Counter({
    name: 'api_calls_total',
    help: 'Total API calls',
    labelNames: ['service', 'endpoint', 'status'],
    registers: [this.registry]
  })
  
  apiLatency = new Histogram({
    name: 'api_latency_seconds',
    help: 'API call latency',
    labelNames: ['service', 'endpoint'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    registers: [this.registry]
  })
  
  tokenUsage = new Counter({
    name: 'tokens_used_total',
    help: 'Total tokens used',
    labelNames: ['model', 'operation'],
    registers: [this.registry]
  })
  
  // Error metrics
  errors = new Counter({
    name: 'processing_errors_total',
    help: 'Total processing errors',
    labelNames: ['error_type', 'stage', 'file_type'],
    registers: [this.registry]
  })
  
  // System metrics
  memoryUsage = new Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [this.registry]
  })
  
  activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    labelNames: ['service'],
    registers: [this.registry]
  })
}
```

### Metrics Collection Implementation

```typescript
// convex/lib/monitoring/collector.ts
export class DocumentProcessingMonitor {
  private metrics = new MetricsCollector()
  private spans: Map<string, number> = new Map()
  
  startProcessing(documentId: string, fileType: string): void {
    this.spans.set(`doc:${documentId}`, Date.now())
    this.metrics.documentsProcessed.inc({ 
      status: 'started', 
      file_type: fileType,
      processor: 'main'
    })
  }
  
  completeProcessing(
    documentId: string,
    fileType: string,
    chunks: number
  ): void {
    const startTime = this.spans.get(`doc:${documentId}`)
    if (startTime) {
      const duration = (Date.now() - startTime) / 1000
      this.metrics.processingDuration.observe(
        { file_type: fileType, stage: 'total' },
        duration
      )
      this.spans.delete(`doc:${documentId}`)
    }
    
    this.metrics.documentsProcessed.inc({ 
      status: 'completed', 
      file_type: fileType,
      processor: 'main'
    })
  }
  
  recordError(error: Error, context: ErrorContext): void {
    this.metrics.errors.inc({
      error_type: error.constructor.name,
      stage: context.stage,
      file_type: context.fileType
    })
    
    // Log structured error
    logger.error('Processing error', {
      error: error.message,
      stack: error.stack,
      context
    })
  }
  
  recordAPICall(
    service: string,
    endpoint: string,
    status: number,
    duration: number
  ): void {
    this.metrics.apiCalls.inc({ service, endpoint, status: status.toString() })
    this.metrics.apiLatency.observe({ service, endpoint }, duration / 1000)
  }
  
  recordTokenUsage(model: string, tokens: number, operation: string): void {
    this.metrics.tokenUsage.inc({ model, operation }, tokens)
  }
}
```

## Real-time Monitoring Dashboard

### Dashboard Implementation

```typescript
// src/components/monitoring/ProcessingDashboard.tsx
import { useQuery } from "convex/react"
import { LineChart, BarChart, PieChart } from 'recharts'

export function ProcessingDashboard() {
  const metrics = useQuery(api.monitoring.getMetrics)
  const realtimeStats = useQuery(api.monitoring.getRealtimeStats)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Processing Rate */}
      <MetricCard title="Processing Rate">
        <LineChart data={metrics?.processingRate}>
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="#3b82f6"
            name="Docs/min"
          />
        </LineChart>
        <div className="mt-2 text-sm text-gray-600">
          Current: {realtimeStats?.currentRate} docs/min
        </div>
      </MetricCard>
      
      {/* Success Rate */}
      <MetricCard title="Success Rate">
        <div className="text-3xl font-bold">
          {(metrics?.successRate * 100).toFixed(1)}%
        </div>
        <div className="mt-2">
          <ProgressBar 
            value={metrics?.successRate * 100}
            color={metrics?.successRate > 0.95 ? 'green' : 'yellow'}
          />
        </div>
      </MetricCard>
      
      {/* Active Processing */}
      <MetricCard title="Active Processing">
        <div className="space-y-2">
          {realtimeStats?.activeJobs.map(job => (
            <div key={job.id} className="flex justify-between">
              <span className="text-sm truncate">{job.fileName}</span>
              <Progress value={job.progress} />
            </div>
          ))}
        </div>
      </MetricCard>
      
      {/* Error Distribution */}
      <MetricCard title="Errors (24h)" className="col-span-2">
        <PieChart data={metrics?.errorDistribution}>
          <Pie dataKey="count" nameKey="type" />
        </PieChart>
      </MetricCard>
      
      {/* Token Usage */}
      <MetricCard title="Token Usage">
        <BarChart data={metrics?.tokenUsageByModel}>
          <Bar dataKey="tokens" fill="#8884d8" />
        </BarChart>
        <div className="mt-2 text-xs text-gray-500">
          Total: {metrics?.totalTokens.toLocaleString()} tokens
        </div>
      </MetricCard>
    </div>
  )
}
```

### Real-time Updates

```typescript
// convex/monitoring.ts
import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getRealtimeStats = query({
  handler: async (ctx) => {
    const activeJobs = await ctx.db
      .query("processingJobs")
      .filter(q => q.eq(q.field("status"), "running"))
      .collect()
    
    const recentDocs = await ctx.db
      .query("documents")
      .withIndex("by_created")
      .order("desc")
      .take(100)
    
    // Calculate current processing rate
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const recentCompleted = recentDocs.filter(
      doc => doc.status === "completed" && doc.processedAt > fiveMinutesAgo
    )
    
    return {
      activeJobs: activeJobs.map(job => ({
        id: job._id,
        fileName: job.fileName,
        progress: job.progress,
        stage: job.stage
      })),
      currentRate: recentCompleted.length / 5, // per minute
      queueSize: await getQueueSize(ctx),
      systemHealth: await checkSystemHealth(ctx)
    }
  }
})

export const recordMetric = mutation({
  args: {
    metric: v.string(),
    value: v.number(),
    labels: v.optional(v.any())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("metrics", {
      metric: args.metric,
      value: args.value,
      labels: args.labels || {},
      timestamp: Date.now()
    })
  }
})
```

## Analytics and Insights

### Processing Analytics

```typescript
// convex/analytics/processing.ts
export class ProcessingAnalytics {
  async generateReport(timeRange: TimeRange): Promise<AnalyticsReport> {
    const metrics = await this.getMetrics(timeRange)
    
    return {
      summary: this.calculateSummary(metrics),
      trends: this.analyzeTrends(metrics),
      anomalies: this.detectAnomalies(metrics),
      recommendations: this.generateRecommendations(metrics)
    }
  }
  
  private calculateSummary(metrics: Metrics[]): Summary {
    const totalDocs = metrics.filter(m => m.name === 'documents_processed').length
    const errors = metrics.filter(m => m.name === 'errors').length
    const avgProcessingTime = this.calculateAverage(
      metrics.filter(m => m.name === 'processing_duration')
    )
    
    return {
      totalDocuments: totalDocs,
      successRate: (totalDocs - errors) / totalDocs,
      averageProcessingTime: avgProcessingTime,
      totalTokensUsed: this.sumMetric(metrics, 'tokens_used'),
      costEstimate: this.calculateCost(metrics)
    }
  }
  
  private analyzeTrends(metrics: Metrics[]): Trends {
    const hourlyData = this.groupByHour(metrics)
    
    return {
      processingRate: this.calculateTrend(hourlyData, 'documents_processed'),
      errorRate: this.calculateTrend(hourlyData, 'errors'),
      tokenUsage: this.calculateTrend(hourlyData, 'tokens_used'),
      peakHours: this.findPeakHours(hourlyData)
    }
  }
  
  private detectAnomalies(metrics: Metrics[]): Anomaly[] {
    const anomalies: Anomaly[] = []
    
    // Detect processing time anomalies
    const processingTimes = metrics.filter(m => m.name === 'processing_duration')
    const avgTime = this.calculateAverage(processingTimes)
    const stdDev = this.calculateStdDev(processingTimes)
    
    processingTimes.forEach(metric => {
      if (metric.value > avgTime + 3 * stdDev) {
        anomalies.push({
          type: 'slow_processing',
          timestamp: metric.timestamp,
          value: metric.value,
          severity: 'high',
          details: `Processing took ${metric.value}s, expected ~${avgTime}s`
        })
      }
    })
    
    // Detect error spikes
    const errorsByHour = this.groupByHour(
      metrics.filter(m => m.name === 'errors')
    )
    
    errorsByHour.forEach((hourData, hour) => {
      if (hourData.length > 10) { // Threshold
        anomalies.push({
          type: 'error_spike',
          timestamp: hour,
          value: hourData.length,
          severity: 'medium',
          details: `${hourData.length} errors in one hour`
        })
      }
    })
    
    return anomalies
  }
}
```

### Cost Analytics

```typescript
export class CostAnalyzer {
  private pricing = {
    'voyage-3.5': 0.00002,
    'voyage-multimodal-3': 0.00012,
    storage: 0.000004, // per GB per hour
    compute: 0.0001 // per second
  }
  
  async analyzeCosts(timeRange: TimeRange): Promise<CostBreakdown> {
    const usage = await this.getUsageMetrics(timeRange)
    
    return {
      embedding: this.calculateEmbeddingCost(usage.tokens),
      storage: this.calculateStorageCost(usage.storage),
      compute: this.calculateComputeCost(usage.compute),
      projectedMonthly: this.projectMonthlyCost(usage),
      optimization: this.suggestOptimizations(usage)
    }
  }
  
  private calculateEmbeddingCost(tokenUsage: TokenUsage[]): number {
    return tokenUsage.reduce((total, usage) => {
      const rate = this.pricing[usage.model]
      return total + (usage.tokens / 1000) * rate
    }, 0)
  }
  
  private suggestOptimizations(usage: Usage): Optimization[] {
    const suggestions: Optimization[] = []
    
    // Check if using expensive models unnecessarily
    const multimodalUsage = usage.tokens.find(t => t.model === 'voyage-multimodal-3')
    if (multimodalUsage && multimodalUsage.tokens > 1000000) {
      suggestions.push({
        type: 'model_selection',
        impact: 'high',
        estimatedSavings: multimodalUsage.tokens * 0.0001,
        description: 'Consider using voyage-3.5 for text-only content'
      })
    }
    
    // Check for duplicate processing
    if (usage.duplicateProcessing > 0) {
      suggestions.push({
        type: 'caching',
        impact: 'medium',
        estimatedSavings: usage.duplicateProcessing * 0.00002,
        description: 'Enable caching to avoid reprocessing identical content'
      })
    }
    
    return suggestions
  }
}
```

## Alerting System

### Alert Configuration

```typescript
// convex/monitoring/alerts.ts
export interface AlertRule {
  id: string
  name: string
  condition: AlertCondition
  severity: 'critical' | 'warning' | 'info'
  actions: AlertAction[]
  cooldown: number // minutes
}

export const defaultAlertRules: AlertRule[] = [
  {
    id: 'high_error_rate',
    name: 'High Error Rate',
    condition: {
      metric: 'error_rate',
      operator: '>',
      threshold: 0.1,
      duration: 300 // 5 minutes
    },
    severity: 'critical',
    actions: ['email', 'slack'],
    cooldown: 60
  },
  {
    id: 'slow_processing',
    name: 'Slow Processing',
    condition: {
      metric: 'avg_processing_time',
      operator: '>',
      threshold: 300, // 5 minutes
      duration: 600 // 10 minutes
    },
    severity: 'warning',
    actions: ['slack'],
    cooldown: 30
  },
  {
    id: 'token_usage_spike',
    name: 'Token Usage Spike',
    condition: {
      metric: 'token_usage_rate',
      operator: '>',
      threshold: 1000000, // per hour
      duration: 3600
    },
    severity: 'warning',
    actions: ['email'],
    cooldown: 120
  }
]
```

### Alert Manager

```typescript
export class AlertManager {
  private activeAlerts = new Map<string, Alert>()
  private lastAlertTime = new Map<string, number>()
  
  async checkAlerts(): Promise<void> {
    for (const rule of defaultAlertRules) {
      const shouldAlert = await this.evaluateCondition(rule.condition)
      
      if (shouldAlert) {
        await this.triggerAlert(rule)
      } else {
        this.resolveAlert(rule.id)
      }
    }
  }
  
  private async evaluateCondition(condition: AlertCondition): Promise<boolean> {
    const metricValue = await this.getMetricValue(
      condition.metric,
      condition.duration
    )
    
    switch (condition.operator) {
      case '>':
        return metricValue > condition.threshold
      case '<':
        return metricValue < condition.threshold
      case '==':
        return metricValue === condition.threshold
      default:
        return false
    }
  }
  
  private async triggerAlert(rule: AlertRule): Promise<void> {
    // Check cooldown
    const lastAlert = this.lastAlertTime.get(rule.id)
    if (lastAlert && Date.now() - lastAlert < rule.cooldown * 60000) {
      return
    }
    
    const alert: Alert = {
      id: `${rule.id}_${Date.now()}`,
      ruleId: rule.id,
      severity: rule.severity,
      message: await this.formatAlertMessage(rule),
      timestamp: Date.now(),
      status: 'active'
    }
    
    this.activeAlerts.set(rule.id, alert)
    this.lastAlertTime.set(rule.id, Date.now())
    
    // Execute actions
    for (const action of rule.actions) {
      await this.executeAction(action, alert)
    }
  }
  
  private async executeAction(action: string, alert: Alert): Promise<void> {
    switch (action) {
      case 'email':
        await this.sendEmailAlert(alert)
        break
      case 'slack':
        await this.sendSlackAlert(alert)
        break
      case 'webhook':
        await this.sendWebhookAlert(alert)
        break
    }
  }
}
```

## Performance Profiling

### Profiler Implementation

```typescript
export class PerformanceProfiler {
  private profiles = new Map<string, Profile>()
  
  startProfile(name: string): () => void {
    const profile: Profile = {
      name,
      startTime: performance.now(),
      spans: [],
      memory: process.memoryUsage()
    }
    
    this.profiles.set(name, profile)
    
    return () => this.endProfile(name)
  }
  
  addSpan(profileName: string, spanName: string): () => void {
    const profile = this.profiles.get(profileName)
    if (!profile) return () => {}
    
    const span: Span = {
      name: spanName,
      startTime: performance.now() - profile.startTime,
      endTime: 0
    }
    
    profile.spans.push(span)
    
    return () => {
      span.endTime = performance.now() - profile.startTime
    }
  }
  
  endProfile(name: string): ProfileResult {
    const profile = this.profiles.get(name)
    if (!profile) throw new Error(`Profile ${name} not found`)
    
    const endTime = performance.now()
    const endMemory = process.memoryUsage()
    
    const result: ProfileResult = {
      name: profile.name,
      duration: endTime - profile.startTime,
      spans: profile.spans,
      memoryDelta: {
        heapUsed: endMemory.heapUsed - profile.memory.heapUsed,
        external: endMemory.external - profile.memory.external
      },
      analysis: this.analyzeProfile(profile)
    }
    
    this.profiles.delete(name)
    return result
  }
  
  private analyzeProfile(profile: Profile): ProfileAnalysis {
    const sortedSpans = [...profile.spans].sort(
      (a, b) => (b.endTime - b.startTime) - (a.endTime - a.startTime)
    )
    
    return {
      bottlenecks: sortedSpans.slice(0, 5).map(span => ({
        name: span.name,
        duration: span.endTime - span.startTime,
        percentage: ((span.endTime - span.startTime) / profile.duration) * 100
      })),
      suggestions: this.generateSuggestions(profile)
    }
  }
}
```

### Usage Example

```typescript
// In document processor
const profiler = new PerformanceProfiler()
const endProfile = profiler.startProfile('document_processing')

const endExtraction = profiler.addSpan('document_processing', 'content_extraction')
const content = await extractContent(file)
endExtraction()

const endChunking = profiler.addSpan('document_processing', 'chunking')
const chunks = await chunkContent(content)
endChunking()

const endEmbedding = profiler.addSpan('document_processing', 'embedding_generation')
const embeddings = await generateEmbeddings(chunks)
endEmbedding()

const profile = endProfile()
logger.info('Processing profile', profile)
```

## Logging Strategy

### Structured Logging

```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: { destination: 1 } // stdout
      },
      {
        target: '@logtail/pino',
        options: { sourceToken: process.env.LOGTAIL_TOKEN }
      }
    ]
  },
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
      node_version: process.version
    })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ['password', 'apiKey', 'token']
})

// Usage
logger.info({
  event: 'document_processed',
  documentId: doc.id,
  fileType: doc.type,
  chunks: chunks.length,
  duration: processingTime,
  metadata: {
    model: 'voyage-3.5',
    tokens: totalTokens
  }
})
```

### Log Aggregation

```typescript
export class LogAggregator {
  async queryLogs(query: LogQuery): Promise<LogEntry[]> {
    const filters = this.buildFilters(query)
    
    const logs = await this.logStore.search({
      query: filters,
      sort: { timestamp: 'desc' },
      limit: query.limit || 100
    })
    
    return logs.map(log => this.parseLogEntry(log))
  }
  
  async generateLogReport(timeRange: TimeRange): Promise<LogReport> {
    const logs = await this.queryLogs({ timeRange })
    
    return {
      summary: {
        total: logs.length,
        errors: logs.filter(l => l.level === 'error').length,
        warnings: logs.filter(l => l.level === 'warn').length
      },
      topErrors: this.groupByError(logs),
      timeline: this.createTimeline(logs),
      patterns: this.detectPatterns(logs)
    }
  }
}
```

## Dashboards and Visualizations

### Custom Visualizations

```typescript
// src/components/monitoring/CustomCharts.tsx
export function ProcessingFlowChart({ data }: { data: FlowData }) {
  return (
    <Sankey
      data={data}
      node={{
        label: 'name',
        color: (node) => getNodeColor(node.status)
      }}
      link={{
        color: '#e0e0e0',
        opacity: 0.5
      }}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    />
  )
}

export function TokenUsageHeatmap({ data }: { data: TokenUsageData[] }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  return (
    <ResponsiveHeatMap
      data={data}
      keys={hours}
      indexBy="day"
      margin={{ top: 60, right: 90, bottom: 60, left: 90 }}
      colors={{
        type: 'sequential',
        scheme: 'blues'
      }}
      axisTop={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: -90,
        legend: 'Hour',
        legendOffset: 36
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'Day',
        legendPosition: 'middle',
        legendOffset: -40
      }}
    />
  )
}
```

## Export and Reporting

### Report Generator

```typescript
export class ReportGenerator {
  async generateReport(
    type: 'daily' | 'weekly' | 'monthly',
    format: 'pdf' | 'csv' | 'json'
  ): Promise<Report> {
    const timeRange = this.getTimeRange(type)
    const data = await this.collectReportData(timeRange)
    
    switch (format) {
      case 'pdf':
        return this.generatePDFReport(data)
      case 'csv':
        return this.generateCSVReport(data)
      case 'json':
        return this.generateJSONReport(data)
    }
  }
  
  private async generatePDFReport(data: ReportData): Promise<Buffer> {
    const doc = new PDFDocument()
    
    // Title
    doc.fontSize(20).text('Document Processing Report', 50, 50)
    doc.fontSize(12).text(`Generated: ${new Date().toISOString()}`, 50, 80)
    
    // Summary section
    doc.fontSize(16).text('Summary', 50, 120)
    doc.fontSize(10)
    doc.text(`Total Documents: ${data.summary.totalDocuments}`, 70, 150)
    doc.text(`Success Rate: ${(data.summary.successRate * 100).toFixed(1)}%`, 70, 170)
    doc.text(`Total Cost: $${data.summary.totalCost.toFixed(2)}`, 70, 190)
    
    // Charts
    const chartBuffer = await this.generateChartImage(data.charts)
    doc.image(chartBuffer, 50, 230, { width: 500 })
    
    return doc
  }
}
```

## Best Practices

### 1. Metric Collection

- Use consistent naming conventions
- Include relevant labels/tags
- Batch metric writes
- Set appropriate retention policies

### 2. Alert Fatigue Prevention

- Set appropriate thresholds
- Use alert grouping
- Implement cooldown periods
- Regular alert review and tuning

### 3. Performance Impact

- Use sampling for high-frequency metrics
- Async metric collection
- Local aggregation before sending
- Circuit breakers for metric endpoints

### 4. Data Privacy

- Redact sensitive information
- Aggregate user-specific data
- Implement data retention policies
- Comply with privacy regulations

## Next Steps

This completes the comprehensive documentation for the document processing pipeline. For implementation, start with the [Implementation Guide](./07-implementation-guide.md).