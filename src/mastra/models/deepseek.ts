import { openai, createOpenAI } from "@ai-sdk/openai";

// 确保在 Workers 环境中正确获取环境变量
const getApiKey = () => {
  // Workers 中通过 env 参数传递，运行时从 process.env 获取
  return process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
};

const getBaseURL = () => "https://api.deepseek.com";

export const deepseekClient = createOpenAI({
  baseURL: getBaseURL(),
  apiKey: getApiKey(),
});

export const deepseekChat = deepseekClient('deepseek-chat');
export const deepseekReasoner = deepseekClient('deepseek-reasoner');