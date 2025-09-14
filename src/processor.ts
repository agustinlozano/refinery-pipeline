import type {
  ScrapingData,
  ProcessingRequest,
  ProcessingResponse,
  ProcessedResult,
  ProcessingOptions,
} from "./lib/types";
import { AIService } from "./lib/ai-service";
import { ContentRepository } from "./lib/content-repository";

export class ContentProcessor {
  private aiService: AIService;
  private repository: ContentRepository;

  constructor(model?: string) {
    this.aiService = new AIService(model);
    this.repository = new ContentRepository();
  }

  /**
   * Process a single scraped result
   */
  async processSingleResult(
    result: ScrapingData["results"][0],
    options: ProcessingOptions = {}
  ): Promise<ProcessedResult> {
    const startTime = Date.now();
    const {
      generateEmbeddings = true,
      extractKeywords = true,
      structureContent = true,
      model = "gpt-4o-mini",
    } = options;

    try {
      // Skip failed scraping results
      if (result.status === "failed") {
        throw new Error(result.error || "Scraping failed");
      }

      const processingPromises: Promise<any>[] = [];
      let structured, keywords, embeddings;

      // Structure content
      if (structureContent) {
        processingPromises.push(
          this.aiService.structureContent(result.content, result.title)
        );
      }

      // Extract keywords (can run in parallel with structuring)
      if (extractKeywords) {
        processingPromises.push(
          this.aiService.extractKeywords(result.content, result.title)
        );
      }

      // Wait for AI processing to complete
      const aiResults = await Promise.all(processingPromises);

      if (structureContent) {
        structured = aiResults[0];
      }
      if (extractKeywords) {
        keywords = structureContent ? aiResults[1] : aiResults[0];
      }

      // Generate embeddings after we have structured content (if enabled)
      if (generateEmbeddings && structured) {
        const embeddingText = this.aiService.createEmbeddingText(
          result.title,
          result.content,
          structured
        );
        embeddings = await this.aiService.generateEmbeddings(embeddingText);
      }

      const processingTime = Date.now() - startTime;

      const processedResult: ProcessedResult = {
        id:
          result.id ||
          `processed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: result.url,
        domain: result.domain || new URL(result.url).hostname,
        originalContent: {
          title: result.title,
          content: result.content,
          wordCount: result.wordCount || this.countWords(result.content),
          scrapedAt: result.scrapedAt,
        },
        structured: structured || {
          title: result.title,
          summary: `Content from ${result.title}`,
          mainTopics: [],
          keyInsights: [],
          sentiment: "neutral" as const,
        },
        keywords: keywords || result.keywords || [],
        embeddings,
        processingMetadata: {
          processedAt: new Date().toISOString(),
          processingTime,
          model,
          success: true,
        },
      };

      return processedResult;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`Error processing result for ${result.url}:`, error);

      return {
        id:
          result.id ||
          `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: result.url,
        domain: result.domain || new URL(result.url).hostname,
        originalContent: {
          title: result.title,
          content: result.content,
          wordCount: result.wordCount || this.countWords(result.content),
          scrapedAt: result.scrapedAt,
        },
        structured: {
          title: result.title,
          summary: "Processing failed",
          mainTopics: [],
          keyInsights: [],
          sentiment: "neutral" as const,
        },
        keywords: result.keywords || [],
        processingMetadata: {
          processedAt: new Date().toISOString(),
          processingTime,
          model: model || "gpt-4o-mini",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  /**
   * Process multiple scraped results
   */
  async processScrapingResponse(
    request: ProcessingRequest
  ): Promise<ProcessingResponse> {
    const startTime = Date.now();
    const { scrapingResponse, options = {} } = request;

    // Extract the actual scraping data from the HTTP response wrapper
    const scrapingData = scrapingResponse.body;

    console.log(`Processing ${scrapingData.results.length} scraped results`);

    const results: ProcessedResult[] = [];
    const errors: string[] = [];

    // Process results sequentially to avoid rate limits
    for (const scrapedResult of scrapingData.results) {
      try {
        const processed = await this.processSingleResult(
          scrapedResult,
          options
        );
        results.push(processed);

        // Store processed result in DynamoDB (only store the required fields)
        try {
          await this.repository.store(processed);
          console.log(
            `Successfully stored processed result for ${processed.url}`
          );
        } catch (storeError) {
          console.error(
            `Failed to store result for ${processed.url}:`,
            storeError
          );
          // Don't fail the entire operation if storage fails
          errors.push(
            `Storage failed for ${processed.url}: ${
              storeError instanceof Error ? storeError.message : "Unknown error"
            }`
          );
        }

        if (
          !processed.processingMetadata.success &&
          processed.processingMetadata.error
        ) {
          errors.push(
            `${scrapedResult.url}: ${processed.processingMetadata.error}`
          );
        }
      } catch (error) {
        const errorMessage = `${scrapedResult.url}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        errors.push(errorMessage);
        console.error("Failed to process result:", errorMessage);
      }
    }

    const executionTime = Date.now() - startTime;

    return {
      success: results.length > 0,
      timestamp: new Date().toISOString(),
      resultsProcessed: results.length,
      results,
      executionTime,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Simple word count utility
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
}
