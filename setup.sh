#!/bin/bash

# Setup and test script for Refinery Pipeline

echo "🚀 Setting up Refinery Pipeline..."
echo "=================================="

# Load .env file if it exists
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    set -a
    source .env
    set +a
    echo "✅ Environment variables loaded"
fi

# Check if .env file exists (after potential creation)
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual API keys."
    echo ""
    echo "After editing .env, run this script again."
    exit 1
fi

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY environment variable not set"
    echo "Please set your OpenAI API key:"
    echo "export OPENAI_API_KEY=your_key_here"
    echo "Or edit the .env file with your actual key"
    exit 1
fi

# Check if API token is set
if [ -z "$API_TOKEN" ]; then
    echo "⚠️  API_TOKEN environment variable not set"
    echo "Please set your API token:"
    echo "export API_TOKEN=your_secure_token_here"
    echo "Or edit the .env file with your actual token"
    exit 1
fi

echo "✅ OpenAI API key is configured"
echo "✅ API token is configured"
echo ""

# Build the project
echo "🔨 Building project..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""

# Run token validation test
echo "🔐 Running token validation test..."
pnpm test:token

if [ $? -eq 0 ]; then
    echo "✅ Token validation test passed"
else
    echo "❌ Token validation test failed"
    exit 1
fi
``
echo ""

# Run local AI processing test
echo "🤖 Running AI processing test with sample data..."
pnpm test:local

if [ $? -eq 0 ]; then
    echo "✅ AI processing test passed"
else
    echo "❌ AI processing test failed"
    exit 1
fi

echo ""
echo "🎉 Setup and testing completed successfully!"
echo "=========================================="
echo ""
echo "📋 Summary:"
echo "✅ Environment variables configured"
echo "✅ Project built successfully"
echo "✅ Token authentication working"
echo "✅ AI processing functional"
echo ""
echo "🚀 Next steps:"
echo "1. Configure AWS credentials:"
echo "   aws configure"
echo ""
echo "2. Deploy to development:"
echo "   pnpm deploy:dev"
echo ""
echo "3. Test deployed API endpoints:"
echo "   curl -X GET https://your-api-url/health"
echo "   curl -X POST https://your-api-url/process \\"
echo "     -H 'Authorization: Bearer $API_TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d @test-data.json"
echo ""
echo "📖 API Documentation:"
echo "- POST /process - Process scraped content (requires authentication)"
echo "- GET /health - Health check (public)"
echo ""
echo "🔐 Authentication:"
echo "- Use Bearer token: Authorization: Bearer your_token"
echo "- Or query parameter: ?token=your_token"
echo ""
echo "Happy coding! 🎯"
