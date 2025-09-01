import { generateObject, generateText, embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type { StructuredContent } from "./types";

// Schema for structured content extraction
const StructuredContentSchema = z.object({
  title: z.string().describe("Main title or heading of the content"),
  summary: z
    .string()
    .describe("Concise summary of the main content (2-3 sentences)"),
  mainTopics: z
    .array(z.string())
    .describe("3-5 main topics covered in the content"),
  keyInsights: z
    .array(z.string())
    .describe("Important insights or key takeaways"),
  dataPoints: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        category: z.string().optional(),
      })
    )
    .optional()
    .describe(
      "Structured data points found in the content (numbers, percentages, dates, etc.)"
    ),
  sentiment: z
    .enum(["positive", "negative", "neutral"])
    .describe("Overall sentiment of the content"),
});

export class AIService {
  private model: string;
  private embeddingModel: string;

  constructor(
    model: string = "gpt-4o-mini",
    embeddingModel: string = "text-embedding-3-small"
  ) {
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  /**
   * Structure raw scraped content into organized data
   */
  async structureContent(
    content: string,
    title: string
  ): Promise<StructuredContent> {
    try {
      const prompt = `
        Analyze and structure the following scraped web content. 
        The content appears to be from: "${title}"
        
        Extract key information and organize it according to the schema.
        Focus on:
        - Financial/economic data if present
        - Key statistics and metrics
        - Important dates and figures
        - Main topics and themes
        
        Content to analyze:
        ${content.slice(0, 4000)} ${content.length > 4000 ? "..." : ""}
      `;

      const result = await generateObject({
        model: openai(this.model),
        schema: StructuredContentSchema,
        prompt,
        temperature: 0.1,
      });

      return result.object;
    } catch (error) {
      console.error("Error structuring content:", error);
      throw new Error(
        `Failed to structure content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract keywords from content
   */
  async extractKeywords(
    content: string,
    title: string,
    maxKeywords: number = 10
  ): Promise<string[]> {
    try {
      const prompt = `
        Extract ${maxKeywords} relevant keywords from the following content.
        Title: "${title}"
        
        Focus on:
        - Technical terms and concepts
        - Important entities (companies, people, places)
        - Financial/economic terms if present
        - Domain-specific terminology
        
        Return only the keywords, one per line, without numbers or bullet points.
        
        Content:
        ${content.slice(0, 2000)} ${content.length > 2000 ? "..." : ""}
      `;

      const result = await generateText({
        model: openai(this.model),
        prompt,
        temperature: 0.1,
        maxTokens: 200,
      });

      return result.text
        .split("\n")
        .map((keyword: string) => keyword.trim())
        .filter((keyword: string) => keyword.length > 0)
        .slice(0, maxKeywords);
    } catch (error) {
      console.error("Error extracting keywords:", error);
      throw new Error(
        `Failed to extract keywords: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate embeddings for content
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      // Truncate text to avoid token limits (approximately 8000 tokens for text-embedding-3-small)
      const truncatedText = text.slice(0, 6000);

      const result = await embed({
        model: openai.embedding(this.embeddingModel),
        value: truncatedText,
      });

      return result.embedding;
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error(
        `Failed to generate embeddings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a combined text for embedding generation
   */
  createEmbeddingText(
    title: string,
    content: string,
    structured: StructuredContent
  ): string {
    const combinedText = [
      `Title: ${title}`,
      `Summary: ${structured.summary}`,
      `Topics: ${structured.mainTopics.join(", ")}`,
      `Insights: ${structured.keyInsights.join(". ")}`,
      `Content: ${content.slice(0, 3000)}`, // Limit content portion
    ].join("\n\n");

    return combinedText;
  }
}
