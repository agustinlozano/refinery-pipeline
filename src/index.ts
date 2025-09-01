import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { z } from "zod";
import { ContentProcessor } from "./processor";
import type { ProcessingRequest, ScrapingResponse } from "./lib/types";

// Validation schema for the incoming request
const ProcessingRequestSchema = z.object({
  scrapingResponse: z.object({
    success: z.boolean(),
    timestamp: z.string(),
    sitesProcessed: z.number(),
    totalSitesConfigured: z.number(),
    results: z.array(
      z.object({
        name: z.string(),
        url: z.string(),
        title: z.string(),
        content: z.string(),
        contentLength: z.number(),
        scrapedAt: z.string(),
        keywords: z.array(z.string()),
        status: z.enum(["success", "failed"]),
        error: z.string().optional(),
        id: z.string().optional(),
        domain: z.string().optional(),
        wordCount: z.number().optional(),
      })
    ),
    executionTime: z.number(),
  }),
  options: z
    .object({
      generateEmbeddings: z.boolean().optional(),
      extractKeywords: z.boolean().optional(),
      structureContent: z.boolean().optional(),
      model: z.string().optional(),
      maxTokens: z.number().optional(),
    })
    .optional(),
});

// Initialize Hono app
const app = new Hono();

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "refinery-pipeline",
    version: "1.0.0",
  });
});

// Main processing endpoint
app.post("/process", async (c) => {
  try {
    console.log("Processing request received");

    // Parse and validate request body
    const rawBody = await c.req.json();
    console.log("Request body parsed, validating...");

    const validationResult = ProcessingRequestSchema.safeParse(rawBody);

    if (!validationResult.success) {
      console.error(
        "Request validation failed:",
        validationResult.error.issues
      );
      return c.json(
        {
          success: false,
          error: "Invalid request format",
          details: validationResult.error.issues,
        },
        400
      );
    }

    const request: ProcessingRequest = validationResult.data;
    console.log(
      `Processing ${request.scrapingResponse.results.length} scraped results`
    );

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY environment variable not set");
      return c.json(
        {
          success: false,
          error: "AI service not configured",
        },
        500
      );
    }

    // Initialize processor and process the request
    const processor = new ContentProcessor(request.options?.model);
    const response = await processor.processScrapingResponse(request);

    console.log(
      `Processing completed. Success: ${response.success}, Results: ${response.resultsProcessed}`
    );

    return c.json(response);
  } catch (error) {
    console.error("Error processing request:", error);

    return c.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
});

// Error handler
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    {
      success: false,
      error: "Internal server error",
      message: err.message,
      timestamp: new Date().toISOString(),
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: "Not found",
      message: "The requested endpoint does not exist",
      timestamp: new Date().toISOString(),
    },
    404
  );
});

// Lambda handler
export const handler = handle(app);

// For local testing
if (process.env.NODE_ENV === "development") {
  console.log("Starting development server...");
}
