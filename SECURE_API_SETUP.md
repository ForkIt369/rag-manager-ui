# Secure API Key Configuration for Vercel

## ⚠️ IMPORTANT SECURITY NOTICE

**NEVER** share API keys publicly. The keys you provided should be immediately revoked and regenerated from your respective service dashboards.

## How to Securely Add API Keys to Vercel

### 1. Revoke Compromised Keys First
Go to each service and revoke the exposed keys:
- Voyage AI Dashboard
- Anthropic Console
- OpenAI Dashboard

### 2. Generate New API Keys
Create new API keys from each service's dashboard.

### 3. Add to Vercel Environment Variables

#### Via Vercel Dashboard (Recommended):
1. Go to https://vercel.com/your-username/broverse-rag-ui
2. Navigate to "Settings" → "Environment Variables"
3. Add each key:
   ```
   VOYAGE_API_KEY = [your-new-voyage-key]
   ANTHROPIC_API_KEY = [your-new-anthropic-key]
   OPENAI_API_KEY = [your-new-openai-key]
   ```
4. Select environments: Production, Preview, Development
5. Click "Save"

#### Via Vercel CLI:
```bash
vercel env add VOYAGE_API_KEY production
vercel env add ANTHROPIC_API_KEY production
vercel env add OPENAI_API_KEY production
```

### 4. Update Your Code to Use Environment Variables

Never hardcode API keys. Always use environment variables:

```typescript
// In your API routes or server-side code
const voyageKey = process.env.VOYAGE_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
```

### 5. Add to .env.local for Local Development
Create `.env.local` (already in .gitignore):
```
VOYAGE_API_KEY=your-new-voyage-key
ANTHROPIC_API_KEY=your-new-anthropic-key
OPENAI_API_KEY=your-new-openai-key
```

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Restrict API key permissions** when possible
4. **Rotate keys regularly**
5. **Monitor usage** for suspicious activity
6. **Use different keys** for development and production

## Next Steps

1. Immediately revoke the exposed keys
2. Generate new keys
3. Add them securely to Vercel
4. Never share them again

Remember: API keys are like passwords - keep them secret!