import { openai } from "@ai-sdk/openai";

// 方式 1：直接传入配置
export const deepseekChat = openai("deepseek-chat", {
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
});

export const deepseekReasoner = openai("deepseek-reasoner", {
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
});

// 方式 2：创建自定义客户端
import { createOpenAI } from '@ai-sdk/openai';

export const deepseekClient = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
});

export const deepseekChatV2 = deepseekClient('deepseek-chat');
export const deepseekReasonerV2 = deepseekClient('deepseek-reasoner');