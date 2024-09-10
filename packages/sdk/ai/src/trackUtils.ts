import { BedrockTokenUsage, TokenMetrics, TokenUsage, UnderscoreTokenUsage } from './types';

export function usageToTokenMetrics(
  usage: TokenUsage | UnderscoreTokenUsage | BedrockTokenUsage,
): TokenMetrics {
  if ('inputTokens' in usage && 'outputTokens' in usage) {
    // Bedrock usage
    return {
      total: usage.totalTokens,
      input: usage.inputTokens,
      output: usage.outputTokens,
    };
  }

  // OpenAI usage (both camelCase and snake_case)
  return {
    total: 'total_tokens' in usage ? usage.total_tokens! : (usage as TokenUsage).totalTokens ?? 0,
    input:
      'prompt_tokens' in usage ? usage.prompt_tokens! : (usage as TokenUsage).promptTokens ?? 0,
    output:
      'completion_tokens' in usage
        ? usage.completion_tokens!
        : (usage as TokenUsage).completionTokens ?? 0,
  };
}
