import 'dotenv/config';
import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { ContentProcessor } from '../processor';
import type { ProcessingRequest } from '../lib/types';

// Create a test version of the app with token validation
const testApp = new Hono();

// Token validation middleware (same as production)
testApp.use('/process', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const queryToken = c.req.query('token');

  let providedToken: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    providedToken = authHeader.substring(7);
  } else if (queryToken) {
    providedToken = queryToken;
  }

  const expectedToken = process.env.API_TOKEN;

  if (!expectedToken) {
    return c.json({ success: false, error: 'API_TOKEN not configured' }, 500);
  }

  if (!providedToken || providedToken !== expectedToken) {
    return c.json({
      success: false,
      error: 'Invalid or missing API token',
      message: 'Please provide a valid API token'
    }, 401);
  }

  await next();
});

// Test endpoint
testApp.post('/process', async (c) => {
  try {
    const rawBody = await c.req.json();
    const request: ProcessingRequest = rawBody;

    if (!process.env.OPENAI_API_KEY) {
      return c.json({ success: false, error: 'OpenAI API key not configured' }, 500);
    }

    const processor = new ContentProcessor();
    const response = await processor.processScrapingResponse(request);

    return c.json(response);
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Test the token validation
async function testTokenValidation() {
  console.log('🔐 Testing API token validation...\n');

  const testRequest = {
    scrapingResponse: {
      success: true,
      timestamp: new Date().toISOString(),
      sitesProcessed: 1,
      totalSitesConfigured: 1,
      results: [{
        name: 'Test',
        url: 'https://example.com',
        title: 'Test Page',
        content: 'Test content',
        contentLength: 12,
        scrapedAt: new Date().toISOString(),
        keywords: ['test'],
        status: 'success' as const
      }],
      executionTime: 100
    }
  };

  // Test without token
  console.log('Testing without token...');
  const noTokenResponse = await testApp.request('/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRequest)
  });
  const noTokenResult = await noTokenResponse.json();
  console.log('❌ Without token:', noTokenResult.error);

  // Test with invalid token
  console.log('\nTesting with invalid token...');
  const invalidTokenResponse = await testApp.request('/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer invalid_token'
    },
    body: JSON.stringify(testRequest)
  });
  const invalidTokenResult = await invalidTokenResponse.json();
  console.log('❌ Invalid token:', invalidTokenResult.error);

  // Test with valid token (header)
  console.log('\nTesting with valid token (header)...');
  const validTokenResponse = await testApp.request('/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_TOKEN}`
    },
    body: JSON.stringify(testRequest)
  });
  const validTokenResult = await validTokenResponse.json();
  console.log('✅ Valid token (header):', validTokenResult.success ? 'Authorized' : 'Failed');

  // Test with valid token (query param)
  console.log('\nTesting with valid token (query param)...');
  const queryTokenResponse = await testApp.request(`/process?token=${process.env.API_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testRequest)
  });
  const queryTokenResult = await queryTokenResponse.json();
  console.log('✅ Valid token (query):', queryTokenResult.success ? 'Authorized' : 'Failed');

  console.log('\n🎉 Token validation test completed!');
}

// Run test if executed directly
if (require.main === module) {
  testTokenValidation().catch(console.error);
}
