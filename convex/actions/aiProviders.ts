"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";

// Example action that uses the AI provider API keys
export const testAIProviders = action({
  args: {
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Get API keys from environment variables
    const voyageKey = process.env.VOYAGE_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Verify all keys are present
    if (!voyageKey || !anthropicKey || !openaiKey) {
      throw new Error("Missing API keys in environment variables");
    }

    // Example: Use Voyage AI for embeddings
    const voyageResponse = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${voyageKey}`,
      },
      body: JSON.stringify({
        input: args.message,
        model: "voyage-large-2-instruct",
      }),
    });

    // Example: Use OpenAI for chat completion
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: args.message }],
        max_tokens: 150,
      }),
    });

    // Example: Use Anthropic Claude
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 150,
        messages: [{ role: "user", content: args.message }],
      }),
    });

    return {
      voyage: await voyageResponse.json(),
      openai: await openaiResponse.json(),
      anthropic: await anthropicResponse.json(),
    };
  },
});

// Production-ready embedding function using Voyage AI
export const createEmbedding = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const voyageKey = process.env.VOYAGE_API_KEY;
    if (!voyageKey) {
      throw new Error("VOYAGE_API_KEY not configured");
    }

    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${voyageKey}`,
      },
      body: JSON.stringify({
        input: args.text,
        model: "voyage-large-2-instruct",
      }),
    });

    if (!response.ok) {
      throw new Error(`Voyage AI error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  },
});