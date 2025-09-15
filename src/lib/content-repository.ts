import {
  ContentEntity,
  type ContentItem,
  type CreateContentItem,
} from "./content-entity";
import type { ProcessedResult } from "./types";

export class ContentRepository {
  private entity = ContentEntity;

  /**
   * Store a processed result in DynamoDB
   */
  async store(processedResult: ProcessedResult): Promise<ContentItem> {
    const contentItem: CreateContentItem = {
      id: processedResult.id,
      url: processedResult.url,
      domain: processedResult.domain,
      originalContent: processedResult.originalContent,
      structured: processedResult.structured,
      keywords: processedResult.keywords,
      processedAt: processedResult.processingMetadata.processedAt,
      processingTime: processedResult.processingMetadata.processingTime,
      model: processedResult.processingMetadata.model,
      success: processedResult.processingMetadata.success,
      error: processedResult.processingMetadata.error,
    };

    try {
      const result = await this.entity.create(contentItem).go();
      console.log(`Successfully stored content item: ${processedResult.id}`);
      return result.data as ContentItem;
    } catch (error) {
      console.error(
        `Failed to store content item ${processedResult.id}:`,
        error
      );
      throw new Error(
        `Failed to store content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Store multiple processed results in DynamoDB using batch operations
   */
  async storeMany(processedResults: ProcessedResult[]): Promise<ContentItem[]> {
    const results: ContentItem[] = [];

    try {
      // Process items individually for better error handling
      for (const result of processedResults) {
        try {
          const stored = await this.store(result);
          results.push(stored);
        } catch (error) {
          console.error(`Failed to store item ${result.id}:`, error);
          // Continue with other items
        }
      }

      console.log(`Successfully stored ${results.length} content items`);
      return results;
    } catch (error) {
      console.error("Failed to store content items:", error);
      throw new Error(
        `Failed to store content items: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Retrieve a content item by ID
   */
  async getById(id: string): Promise<ContentItem | null> {
    try {
      const result = await this.entity.get({ id }).go();
      return (result.data as ContentItem) || null;
    } catch (error) {
      console.error(`Failed to retrieve content item ${id}:`, error);
      return null;
    }
  }

  /**
   * Retrieve content items by domain
   */
  async getByDomain(
    domain: string,
    options?: { limit?: number }
  ): Promise<{ items: ContentItem[] }> {
    try {
      const query = this.entity.query.byDomain({ domain });
      const result = await query.go();

      return {
        items: result.data as ContentItem[],
      };
    } catch (error) {
      console.error(
        `Failed to retrieve content items for domain ${domain}:`,
        error
      );
      return { items: [] };
    }
  }

  /**
   * Retrieve content items by URL (should typically return one item)
   */
  async getByUrl(url: string): Promise<ContentItem[]> {
    try {
      const result = await this.entity.query.byUrl({ url }).go();
      return result.data as ContentItem[];
    } catch (error) {
      console.error(`Failed to retrieve content items for URL ${url}:`, error);
      return [];
    }
  }

  /**
   * Check if content exists for a given URL
   */
  async exists(url: string): Promise<boolean> {
    try {
      const items = await this.getByUrl(url);
      return items.length > 0;
    } catch (error) {
      console.error(`Failed to check existence for URL ${url}:`, error);
      return false;
    }
  }

  /**
   * Delete a content item by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.entity.delete({ id }).go();
      console.log(`Successfully deleted content item: ${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete content item ${id}:`, error);
      return false;
    }
  }

  /**
   * Update keywords for a content item
   */
  async updateKeywords(
    id: string,
    keywords: string[]
  ): Promise<ContentItem | null> {
    try {
      const result = await this.entity
        .update({ id })
        .set({ keywords })
        .go({ response: "all_new" });

      console.log(`Successfully updated keywords for content item: ${id}`);
      return (result.data as ContentItem) || null;
    } catch (error) {
      console.error(`Failed to update keywords for content item ${id}:`, error);
      return null;
    }
  }
}
