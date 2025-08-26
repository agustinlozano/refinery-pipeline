export interface ScrapingResult {
  url: string;
  name: string;
  title: string;
  content: string;
  scrapedAt: string;
}

// This interface is for the websites that have been scraped and stored in the database
export interface ScrapeRepositoryRecord extends ScrapingResult {
  id: string; // Unique identifier for each scrape
  domain: string; // Extracted domain for easier querying
  contentHash: string; // Hash of content to detect changes
  wordCount: number; // Number of words in content
  status: "success" | "failed";
  keywords?: string[]; // Keywords for this site
  error?: string; // Error message if scraping failed
  executionTime?: number; // Time taken to scrape this site
  retryCount?: number; // Number of retries for this scrape
  lastModified?: string; // When content was last modified (if available)
}
