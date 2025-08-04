# API Keys Configuration

## ✅ Status: API Keys Configured

Your API keys have been successfully configured in Vercel's production environment variables.

### Configured Keys:
- **VOYAGE_API_KEY** - For embeddings and vector search
- **ANTHROPIC_API_KEY** - For Claude AI integration
- **OPENAI_API_KEY** - For GPT models

### How to Use the API Keys

#### In Convex Actions (Server-side):

```typescript
// convex/actions/yourAction.ts
import { action } from "../_generated/server";

export const useAIProviders = action({
  handler: async (ctx, args) => {
    // Access API keys from environment variables
    const voyageKey = process.env.VOYAGE_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    // Use them in API calls
    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      headers: {
        "Authorization": `Bearer ${voyageKey}`,
      },
      // ... rest of your request
    });
  },
});
```

#### Important Notes:

1. **Server-side Only**: These API keys are only available in Convex actions (server-side). They are NOT accessible in client-side code for security.

2. **Automatic Availability**: The keys are automatically injected by Vercel at runtime - no additional configuration needed.

3. **Local Development**: For local development, create a `.env.local` file:
   ```
   VOYAGE_API_KEY=your-key-here
   ANTHROPIC_API_KEY=your-key-here
   OPENAI_API_KEY=your-key-here
   ```

### Verify Configuration

To verify your API keys are working:

1. Check the Vercel dashboard: https://vercel.com/will31s-projects/broverse-rag-ui/settings/environment-variables
2. Test the example action in `convex/actions/aiProviders.ts`

### Production URL

Your application is live at: https://broverse-rag-ui.vercel.app

### Security Reminder

- ✅ API keys are securely stored in Vercel environment variables
- ✅ Keys are encrypted and only exposed to your server-side code
- ✅ Keys are never exposed to client-side JavaScript
- ❌ Never commit API keys to version control