## Project context

This project is a **data pipeline** running on **AWS Lambda**.  
It has two main stages:

**Processor Lambda** – current focus. Written in **TypeScript** using **Hono** and deployed with the **Serverless Framework**.

- Processes it with **Vercel AI SDK** (OpenAI/Anthropic models),
- Detects **keywords**,
- Generates **embeddings** for future storage in a vector database.

The idea is to build a foundation for a robust data enrichment service, starting simple (structuring + keywords + embeddings) and later expanding to **semantic search** with a vector DB.

## Coding style

- Always **TypeScript**.
- Modern, concise, and strongly typed code.
- Use **async/await** over `.then()`.
- Clear, descriptive function names.
- Prefer small, composable functions over monoliths.
- Use **kebab-case** for filenames and directories.
- Lambda code should be lightweight and stateless.
- Handle JSON parsing safely (try/catch or `zod` validation).

## Libraries and Frameworks

- **Hono** for routing in Lambda.
- **Serverless Framework v4** for deployment.
- **Vercel AI SDK** for LLM calls and embeddings.
- **OpenAI** as the default model provider.
- **Pnpm** for package management.
- **Esbuild** for bundling TypeScript.

## What Copilot Chat should avoid

- Do not suggest frontend/UI code – this is a backend-only project.
- Do not mix Spanish into code or comments – always English.
- Avoid adding unnecessary abstractions or frameworks.
- Do not assume synchronous/blocking logic – keep everything async.
- Avoid suggesting database integrations for now (vector DB comes later).
- Set up AWS credentials to serverless framework. The AWS CLI is already configured with the necessary permissions.
