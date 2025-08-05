// AI Provider Configuration
// This file demonstrates how to properly use environment variables for API keys

export const getAIProviders = () => {
  // These should be set in Vercel Environment Variables
  // NEVER hardcode API keys in your code
  return {
    voyage: {
      apiKey: process.env.VOYAGE_API_KEY,
      model: 'voyage-large-2-instruct'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo'
    }
  };
};

// Validate that keys are configured
export const validateAPIKeys = () => {
  const providers = getAIProviders();
  const missing = [];
  
  if (!providers.voyage.apiKey) missing.push('VOYAGE_API_KEY');
  if (!providers.anthropic.apiKey) missing.push('ANTHROPIC_API_KEY');
  if (!providers.openai.apiKey) missing.push('OPENAI_API_KEY');
  
  if (missing.length > 0) {
    throw new Error(`Missing API keys: ${missing.join(', ')}. Please configure them in Vercel Environment Variables.`);
  }
  
  return true;
};