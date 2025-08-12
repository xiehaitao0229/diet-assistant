import { Agent } from "@mastra/core/agent";
import { createOpenAI } from '@ai-sdk/openai';
import { searchFoodTool, getFoodDetailsTool } from "../tools/food-database";

// 创建 DeepSeek 客户端
const deepseekClient = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY,
});

export const dietAgent = new Agent({
  name: "饮食记录助手",
  description: "帮助用户记录和分析饮食，提供营养建议",
  instructions: `
    你是一个专业的饮食记录助手。你的任务是：

    1. 帮助用户搜索和识别食物
    2. 获取准确的营养信息
    3. 记录用户的饮食摄入
    4. 提供简单的营养分析和建议

    使用工具时的指导原则：
    - 使用 search-food 工具搜索食物
    - 使用 get-food-details 工具获取详细营养信息
    - 始终以友好、支持的语调回应
    - 提供实用的健康建议
    - 用中文与用户交流
    - 结合中国人的饮食习惯给出建议

    当用户描述食物时，首先搜索最匹配的食物，然后获取详细营养信息。
    特别注意中文食物名称的识别和翻译。
  `,
  model: deepseekClient('deepseek-chat'),
  tools: {
    searchFoodTool,
    getFoodDetailsTool
  }
});