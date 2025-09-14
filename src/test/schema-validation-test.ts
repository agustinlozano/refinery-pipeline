import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// Load sample data
const sampleDataPath = path.join(__dirname, "../raw-body.sample.json");
const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, "utf-8"));

// Current schema from index.ts
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

// Test the current schema
console.log("Testing current schema with sample data...");
const currentValidation = ProcessingRequestSchema.safeParse(sampleData);

if (currentValidation.success) {
  console.log("✅ Current schema validates successfully");
} else {
  console.log("❌ Current schema validation failed:");
  console.log(currentValidation.error.issues);
}

// Proposed corrected schema for HTTP response wrapper
const CorrectedProcessingRequestSchema = z.object({
  scrapingResponse: z.object({
    statusCode: z.number(),
    body: z.string().transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        return z
          .object({
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
          })
          .parse(parsed);
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON in body field",
        });
        return z.NEVER;
      }
    }),
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

console.log("\nTesting corrected schema with sample data...");
const correctedValidation =
  CorrectedProcessingRequestSchema.safeParse(sampleData);

if (correctedValidation.success) {
  console.log("✅ Corrected schema validates successfully");
  console.log(
    "Parsed data structure:",
    JSON.stringify(correctedValidation.data, null, 2)
  );
} else {
  console.log("❌ Corrected schema validation failed:");
  console.log(correctedValidation.error.issues);
}
