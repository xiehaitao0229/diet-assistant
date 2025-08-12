import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export interface Env {
  DEEPSEEK_API_KEY: string;
  USDA_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // 处理 CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      // 根据路径分发请求
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        return await handleChatRequest(request, env);
      }
      
      if (url.pathname === '/api/search-food' && request.method === 'POST') {
        return await handleFoodSearch(request, env);
      }

      // 默认响应
      return new Response('Diet Tracker API', { status: 200 });
      
    } catch (error) {
      console.error('Request error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  },
};

// 处理聊天请求
async function handleChatRequest(request: Request, env: Env): Promise<Response> {
  const { message } = await request.json();
  
  const openai = createOpenAI({
    apiKey: env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1'
  });

  const result = await generateText({
    model: openai('deepseek-chat'),
    prompt: `You are a helpful diet assistant. ${message}`,
  });

  return new Response(
    JSON.stringify({ 
      response: result.text
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// 处理食物搜索请求
async function handleFoodSearch(request: Request, env: Env): Promise<Response> {
  const { query } = await request.json();
  
  // 直接调用 USDA API
  const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${env.USDA_API_KEY}&pageSize=10`);
  const data = await response.json();

  return new Response(
    JSON.stringify(data),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}