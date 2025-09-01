// This interface is for the websites that have been scraped
export interface ScrapingResponse {
  success: boolean;
  timestamp: string;
  sitesProcessed: number;
  totalSitesConfigured: number;
  results: Array<{
    name: string;
    url: string;
    title: string;
    content: string;
    contentLength: number;
    scrapedAt: string;
    keywords: string[];
    status: "success" | "failed";
    error?: string;
    id?: string; // Database record ID
    domain?: string; // Extracted domain
    wordCount?: number; // Word count from database
  }>;
  executionTime: number;
}

// Processing pipeline types
export interface ProcessingRequest {
  scrapingResponse: ScrapingResponse;
  options?: ProcessingOptions;
}

export interface ProcessingOptions {
  generateEmbeddings?: boolean;
  extractKeywords?: boolean;
  structureContent?: boolean;
  model?: string;
  maxTokens?: number;
}

export interface StructuredContent {
  title: string;
  summary: string;
  mainTopics: string[];
  keyInsights: string[];
  dataPoints?: Array<{
    label: string;
    value: string;
    category?: string;
  }>;
  sentiment?: "positive" | "negative" | "neutral";
}

export interface ProcessedResult {
  id: string;
  url: string;
  domain: string;
  originalContent: {
    title: string;
    content: string;
    wordCount: number;
    scrapedAt: string;
  };
  structured: StructuredContent;
  keywords: string[];
  embeddings?: number[];
  processingMetadata: {
    processedAt: string;
    processingTime: number;
    model: string;
    success: boolean;
    error?: string;
  };
}

export interface ProcessingResponse {
  success: boolean;
  timestamp: string;
  resultsProcessed: number;
  results: ProcessedResult[];
  executionTime: number;
  errors?: string[];
}
