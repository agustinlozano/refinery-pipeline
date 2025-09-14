import "dotenv/config";
import { ContentProcessor } from "../processor";
import {
  sampleScrapingResponse,
  testConfigurations as testConfigs,
} from "./sample-data";

/**
 * Local test utility for the content processor
 */
async function testProcessor() {
  console.log("🧪 Testing Content Processor locally...\n");

  // Check if OpenAI API key is set
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY environment variable not set");
    console.log(
      "Please set your OpenAI API key: export OPENAI_API_KEY=your_key_here"
    );
    process.exit(1);
  }

  const processor = new ContentProcessor();

  try {
    console.log("📝 Testing with sample BCRA data...");

    // The body is now already parsed as ScrapingData object
    const scrapingData = sampleScrapingResponse.scrapingResponse.body;
    console.log(`Processing URL: ${scrapingData.results[0].url}`);
    console.log(
      `Content length: ${scrapingData.results[0].contentLength} chars\n`
    );

    const startTime = Date.now();
    const result = await processor.processScrapingResponse(
      sampleScrapingResponse
    );
    const executionTime = Date.now() - startTime;

    console.log("✅ Processing completed!");
    console.log(`⏱️  Execution time: ${executionTime}ms`);
    console.log(`📊 Results processed: ${result.resultsProcessed}`);

    if (result.results.length > 0) {
      const processedResult = result.results[0];
      console.log("\n📋 Processed Result Summary:");
      console.log(`- Title: ${processedResult.structured.title}`);
      console.log(`- Summary: ${processedResult.structured.summary}`);
      console.log(
        `- Main Topics: ${processedResult.structured.mainTopics.join(", ")}`
      );
      console.log(
        `- Keywords: ${processedResult.keywords.slice(0, 5).join(", ")}${
          processedResult.keywords.length > 5 ? "..." : ""
        }`
      );
      console.log(`- Sentiment: ${processedResult.structured.sentiment}`);
      console.log(
        `- Embeddings generated: ${
          processedResult.embeddings
            ? "Yes (" + processedResult.embeddings.length + " dimensions)"
            : "No"
        }`
      );

      if (
        processedResult.structured.dataPoints &&
        processedResult.structured.dataPoints.length > 0
      ) {
        console.log(
          `- Data Points found: ${processedResult.structured.dataPoints.length}`
        );
        console.log(
          "  Examples:",
          processedResult.structured.dataPoints
            .slice(0, 3)
            .map((dp) => `${dp.label}: ${dp.value}`)
            .join(", ")
        );
      }
    }

    if (result.errors && result.errors.length > 0) {
      console.log("\n⚠️  Errors encountered:");
      result.errors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

/**
 * Test different processing configurations
 */
async function testConfigurations() {
  console.log("🔧 Testing different processing configurations...\n");

  const processor = new ContentProcessor();

  for (const [configName, config] of Object.entries(testConfigs)) {
    console.log(`Testing ${configName} configuration...`);

    try {
      const request = {
        ...sampleScrapingResponse,
        options: config,
      };

      const result = await processor.processScrapingResponse(request);
      console.log(`✅ ${configName}: Success (${result.executionTime}ms)`);
    } catch (error) {
      console.error(
        `❌ ${configName}: Failed -`,
        error instanceof Error ? error.message : error
      );
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testType = process.argv[2] || "basic";

  if (testType === "configs") {
    testConfigurations();
  } else {
    testProcessor();
  }
}
