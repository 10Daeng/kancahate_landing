// --- UNIFIED LLM SERVICE (Multi-Provider) ---
// Support: Gemini, OpenAI (GPT), Anthropic (Claude)
// Flexible: Easy to add/switch models

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * CONFIGURATION
 * Prioritas model untuk Kancah Ate:
 * 1. Gemini Flash - Primary (murah, fast, bahasa Indonesia natural)
 * 2. Claude 3.5 Sonnet - Secondary (empatik, therapeutic, untuk premium/crisis)
 * 3. GPT-4o-mini - Tertiary (fallback, reasoning kuat)
 *
 * ENVIRONMENT VARIABLES NEEDED:
 * - PUBLIC_GEMINI_API_KEY=...
 * - PUBLIC_ANTHROPIC_API_KEY=... (or ANTHROPIC_AUTH_TOKEN for custom endpoint)
 * - PUBLIC_OPENAI_API_KEY=...
 * - PUBLIC_ANTHROPIC_BASE_URL=https://api.anthropic.com (optional, for custom proxy)
 */

const LLM_CONFIG = {
  // Provider priority
  providers: ['gemini', 'claude', 'openai'],

  // Model configurations
  models: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-2.5-flash', // Latest, fast
      fallbackModel: 'gemini-2.0-flash-exp',    // Experimental
      maxTokens: 8192,
      temperature: 0.7,
      // Use cases
      for: ['chat', 'assessment', 'daily_conversation']
    },
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN,
      baseUrl: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
      defaultModel: 'claude-3-5-sonnet-20241022',
      fallbackModel: 'claude-3-5-haiku-20241022', // Smaller, faster, cheaper
      maxTokens: 4096,
      temperature: 0.7,
      // Use cases
      for: ['crisis', 'premium_users', 'deep_therapy', 'complex_emotional']
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com',
      defaultModel: 'gpt-4o-mini',
      fallbackModel: 'gpt-4o-mini',
      maxTokens: 4096,
      temperature: 0.7,
      // Use cases
      for: ['fallback', 'reasoning_heavy', 'edge_cases']
    }
  },

  // Smart routing rules
  routing: {
    // Crisis cases → Claude (most empathetic + safe)
    crisis: { provider: 'claude', minPriority: 3 },

    // Premium users → Claude (better experience)
    premium: { provider: 'claude' },

    // Normal chat → Gemini (cheap + fast)
    default: { provider: 'gemini' },

    // Fallback jika primary fails
    fallback: ['gemini', 'claude', 'openai']
  }
};

/**
 * MAIN LLM SERVICE FUNCTION
 * @param {string} prompt - Prompt to send to LLM
 * @param {object} options - Configuration options
 * @returns {Promise<object>} - { response, model, provider, tokens, cost }
 */
export async function callLLM(prompt, options = {}) {
  const {
    provider = null,           // Force specific provider
    model = null,              // Force specific model
    useCase = 'default',       // Use case for smart routing
    crisisLevel = 0,           // Crisis level (0-3)
    isPremium = false,         // User tier
    systemPrompt = null,       // System prompt (optional)
    history = []               // Chat history (optional)
  } = options;

  try {
    // 1. Determine provider based on routing rules
    const selectedProvider = provider || determineProvider(useCase, crisisLevel, isPremium);
    console.log(`[LLM] Using provider: ${selectedProvider} for useCase: ${useCase}`);

    // 2. Get provider config
    const providerConfig = LLM_CONFIG.models[selectedProvider];
    if (!providerConfig) {
      throw new Error(`Unknown provider: ${selectedProvider}`);
    }

    // 3. Check API key
    if (!providerConfig.apiKey || providerConfig.apiKey === 'your_api_key_here') {
      console.warn(`[LLM] API key not set for ${selectedProvider}, trying fallback...`);
      return await callLLMFallback(prompt, options, selectedProvider);
    }

    // 4. Call specific provider
    switch (selectedProvider) {
      case 'gemini':
        return await callGemini(prompt, { ...providerConfig, model, systemPrompt, history });
      case 'claude':
        return await callClaude(prompt, { ...providerConfig, model, systemPrompt, history });
      case 'openai':
        return await callOpenAI(prompt, { ...providerConfig, model, systemPrompt, history });
      default:
        throw new Error(`Provider ${selectedProvider} not implemented`);
    }

  } catch (error) {
    console.error(`[LLM] Error calling ${provider || 'default'} provider:`, error);

    // Try fallback providers
    return await callLLMFallback(prompt, options, provider);
  }
}

/**
 * Determine which provider to use based on routing rules
 */
function determineProvider(useCase, crisisLevel, isPremium) {
  // Crisis cases → Claude
  if (useCase === 'crisis' || crisisLevel >= 3) {
    return LLM_CONFIG.routing.crisis.provider;
  }

  // Premium users → Claude
  if (isPremium) {
    return LLM_CONFIG.routing.premium.provider;
  }

  // Default → Gemini
  return LLM_CONFIG.routing.default.provider;
}

/**
 * Fallback mechanism: Try other providers if primary fails
 */
async function callLLMFallback(prompt, options, failedProvider) {
  const fallbackProviders = LLM_CONFIG.routing.fallback.filter(p => p !== failedProvider);

  for (const provider of fallbackProviders) {
    try {
      console.log(`[LLM] Trying fallback provider: ${provider}`);
      return await callLLM(prompt, { ...options, provider });
    } catch (error) {
      console.warn(`[LLM] Fallback provider ${provider} also failed:`, error);
      continue;
    }
  }

  throw new Error('All LLM providers failed');
}

/**
 * GEMINI PROVIDER
 */
async function callGemini(prompt, config) {
  const { apiKey, defaultModel, model, temperature, systemPrompt, history } = config;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = model || defaultModel;
  const geminiModel = genAI.getGenerativeModel({ model: modelName, systemInstruction: systemPrompt });

  // Construct full prompt with history
  let fullPrompt = prompt;
  if (history && history.length > 0) {
    fullPrompt = constructPromptWithHistory(history, prompt);
  }

  const result = await geminiModel.generateContent(fullPrompt);
  const response = result.response.text();

  return {
    response,
    provider: 'gemini',
    model: modelName,
    tokens: estimateTokens(prompt, response),
    cost: estimateCost('gemini', modelName, prompt, response)
  };
}

/**
 * CLAUDE PROVIDER
 */
async function callClaude(prompt, config) {
  const { apiKey, baseUrl, defaultModel, model, temperature, systemPrompt, history } = config;

  const modelName = model || defaultModel;
  const apiUrl = `${baseUrl}/v1/messages`;

  // Construct messages array
  const messages = [];

  // Add history
  if (history && history.length > 0) {
    messages.push(...history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.parts[0].text
    })));
  }

  // Add current prompt
  messages.push({
    role: 'user',
    content: prompt
  });

  // Call Anthropic API (supports custom base URL for proxy)
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      max_tokens: config.maxTokens,
      temperature: temperature,
      system: systemPrompt || 'You are Kai, a friendly empathetic mental health companion for Indonesian teenagers.'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const text = data.content[0].text;

  return {
    response: text,
    provider: 'claude',
    model: modelName,
    tokens: {
      input: data.usage?.input_tokens || estimateTokenCount(prompt),
      output: data.usage?.output_tokens || estimateTokenCount(text)
    },
    cost: estimateCost('claude', modelName, prompt, text, data.usage)
  };
}

/**
 * OPENAI PROVIDER (GPT)
 */
async function callOpenAI(prompt, config) {
  const { apiKey, baseUrl, defaultModel, model, temperature, systemPrompt, history } = config;

  const modelName = model || defaultModel;
  const apiUrl = `${baseUrl}/v1/chat/completions`;

  // Construct messages array
  const messages = [];

  // Add system prompt if provided
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  // Add history
  if (history && history.length > 0) {
    messages.push(...history.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.parts[0].text
    })));
  }

  // Add current prompt
  messages.push({
    role: 'user',
    content: prompt
  });

  // Call OpenAI API (supports custom base URL for proxy)
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: messages,
      max_tokens: config.maxTokens,
      temperature: temperature
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  return {
    response: text,
    provider: 'openai',
    model: modelName,
    tokens: {
      input: data.usage?.prompt_tokens || estimateTokenCount(prompt),
      output: data.usage?.completion_tokens || estimateTokenCount(text)
    },
    cost: estimateCost('openai', modelName, prompt, text, data.usage)
  };
}

/**
 * UTILITY FUNCTIONS
 */

function constructPromptWithHistory(history, currentPrompt) {
  // For Gemini (doesn't support structured history in free tier)
  let fullPrompt = '';

  for (const msg of history) {
    if (msg.role === 'user') {
      fullPrompt += `User: ${msg.parts[0].text}\n\n`;
    } else if (msg.role === 'assistant') {
      fullPrompt += `Assistant: ${msg.parts[0].text}\n\n`;
    }
  }

  fullPrompt += `User: ${currentPrompt}`;
  return fullPrompt;
}

function estimateTokens(input, output) {
  // Rough estimation: 1 token ≈ 4 characters for English, 3 for Indonesian
  return {
    input: Math.ceil(input.length / 3),
    output: Math.ceil(output.length / 3)
  };
}

function estimateTokenCount(text) {
  return Math.ceil(text.length / 3);
}

function estimateCost(provider, model, input, output, usage = null) {
  // Use actual usage if provided
  const inputTokens = usage?.input_tokens || estimateTokenCount(input);
  const outputTokens = usage?.output_tokens || estimateTokenCount(output);

  // Pricing per 1M tokens (as of 2025)
  const pricing = {
    gemini: {
      'gemini-2.5-flash': { input: 0.075, output: 0.15 },
      'gemini-2.0-flash-exp': { input: 0.075, output: 0.15 },
      'gemini-1.5-flash': { input: 0.075, output: 0.15 },
      'gemini-1.5-pro': { input: 1.25, output: 5.0 }
    },
    claude: {
      'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
      'claude-3-5-haiku-20241022': { input: 0.8, output: 4.0 }
    },
    openai: {
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4o': { input: 2.50, output: 10.0 }
    }
  };

  const providerPricing = pricing[provider]?.[model] || { input: 0, output: 0 };

  const inputCost = (inputTokens / 1000000) * providerPricing.input;
  const outputCost = (outputTokens / 1000000) * providerPricing.output;
  const totalCost = inputCost + outputCost;

  return {
    input: inputCost,
    output: outputCost,
    total: totalCost,
    usd: totalCost.toFixed(6)
  };
}

/**
 * EXPORT HELPERS
 */

export { LLM_CONFIG };

export async function callGeminiOnly(prompt, options = {}) {
  return await callLLM(prompt, { ...options, provider: 'gemini' });
}

export async function callClaudeOnly(prompt, options = {}) {
  return await callLLM(prompt, { ...options, provider: 'claude' });
}

export async function callOpenAIOnly(prompt, options = {}) {
  return await callLLM(prompt, { ...options, provider: 'openai' });
}

// Smart routing based on use case
export async function callForChat(prompt, options = {}) {
  return await callLLM(prompt, { ...options, useCase: 'default' });
}

export async function callForCrisis(prompt, options = {}) {
  return await callLLM(prompt, { ...options, useCase: 'crisis', crisisLevel: 3 });
}

export async function callForPremium(prompt, options = {}) {
  return await callLLM(prompt, { ...options, useCase: 'premium', isPremium: true });
}

export default {
  callLLM,
  callGeminiOnly,
  callClaudeOnly,
  callOpenAIOnly,
  callForChat,
  callForCrisis,
  callForPremium,
  LLM_CONFIG
};
