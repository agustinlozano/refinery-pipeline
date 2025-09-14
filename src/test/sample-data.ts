import type { ProcessingRequest } from "../lib/types";

// Sample test data based on the BCRA scraping result you provided
export const sampleScrapingResponse: ProcessingRequest = {
  scrapingResponse: {
    statusCode: 200,
    body: {
      success: true,
      timestamp: "2025-09-14T19:47:31.632Z",
      sitesProcessed: 1,
      totalSitesConfigured: 1,
      results: [
        {
          name: "Example Website",
          url: "https://example.com",
          title: "Example Domain",
          content:
            "This domain is for use in illustrative examples in documents.",
          contentLength: 60,
          scrapedAt: "2025-09-14T19:47:31.632Z",
          keywords: ["example", "domain", "illustrative"],
          status: "success" as const,
          id: "example-1",
          domain: "example.com",
          wordCount: 12,
        },
      ],
      executionTime: 1250,
    },
  },
  options: {
    generateEmbeddings: true,
    extractKeywords: true,
    structureContent: true,
    model: "gpt-4o-mini",
  },
};

// Sample processing options for testing different configurations
export const testConfigurations = {
  minimal: {
    generateEmbeddings: false,
    extractKeywords: true,
    structureContent: true,
    model: "gpt-4o-mini",
  },
  fullProcessing: {
    generateEmbeddings: true,
    extractKeywords: true,
    structureContent: true,
    model: "gpt-4o-mini",
  },
  embeddingsOnly: {
    generateEmbeddings: true,
    extractKeywords: false,
    structureContent: false,
    model: "gpt-4o-mini",
  },
};
