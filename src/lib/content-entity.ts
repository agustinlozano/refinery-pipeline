import { Entity } from "electrodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

// DynamoDB client instance
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-2",
});

// Table name from environment or default
const TABLE_NAME = process.env.CONTENT_TABLE_NAME || "refinery-spice";

// ElectroDB entity schema for processed content
export const ContentEntity = new Entity(
  {
    model: {
      entity: "content",
      version: "1",
      service: "refinery",
    },
    attributes: {
      // Primary key attributes
      id: {
        type: "string",
        required: true,
      },
      url: {
        type: "string",
        required: true,
      },
      domain: {
        type: "string",
        required: true,
      },

      // Original content from scraping
      originalContent: {
        type: "map",
        properties: {
          title: {
            type: "string",
            required: true,
          },
          content: {
            type: "string",
            required: true,
          },
          wordCount: {
            type: "number",
            required: true,
          },
          scrapedAt: {
            type: "string",
            required: true,
          },
        },
        required: true,
      },

      // AI-processed structured content
      structured: {
        type: "map",
        properties: {
          title: {
            type: "string",
            required: true,
          },
          summary: {
            type: "string",
            required: true,
          },
          mainTopics: {
            type: "list",
            items: {
              type: "string",
            },
            required: true,
          },
          keyInsights: {
            type: "list",
            items: {
              type: "string",
            },
            required: true,
          },
          dataPoints: {
            type: "list",
            items: {
              type: "map",
              properties: {
                label: {
                  type: "string",
                  required: true,
                },
                value: {
                  type: "string",
                  required: true,
                },
                category: {
                  type: "string",
                },
              },
            },
          },
          sentiment: {
            type: "string",
          },
        },
        required: true,
      },

      // Extracted keywords
      keywords: {
        type: "list",
        items: {
          type: "string",
        },
        required: true,
      },

      // Metadata
      processedAt: {
        type: "string",
        required: true,
        default: () => new Date().toISOString(),
      },
      processingTime: {
        type: "number",
        required: true,
      },
      model: {
        type: "string",
        required: true,
      },
      success: {
        type: "boolean",
        required: true,
      },
      error: {
        type: "string",
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["id"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      byDomain: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["domain"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["processedAt"],
        },
      },
      byUrl: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["url"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["processedAt"],
        },
      },
    },
  },
  {
    client,
    table: TABLE_NAME,
  }
);

// Type definitions for the entity
export type ContentItem = {
  id: string;
  url: string;
  domain: string;
  originalContent: {
    title: string;
    content: string;
    wordCount: number;
    scrapedAt: string;
  };
  structured: {
    title: string;
    summary: string;
    mainTopics: string[];
    keyInsights: string[];
    dataPoints?: Array<{
      label: string;
      value: string;
      category?: string;
    }>;
    sentiment?: string;
  };
  keywords: string[];
  processedAt: string;
  processingTime: number;
  model: string;
  success: boolean;
  error?: string;
};

export type CreateContentItem = Omit<ContentItem, "processedAt"> & {
  processedAt?: string;
};
