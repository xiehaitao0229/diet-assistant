// 不要在全局作用域导入 mastra
// import { mastra } from "./mastra";

export interface Env {
    DEEPSEEK_API_KEY: string;
    USDA_API_KEY: string;
  }
  
  // 缓存 mastra 实例
  let mastraInstance: any = null;
  
  // 延迟初始化 mastra
  async function getMastra() {
    if (!mastraInstance) {
      const { mastra } = await import("./mastra");
      mastraInstance = mastra;
    }
    return mastraInstance;
  }
  
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      // 设置环境变量
      process.env.DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY;
      process.env.USDA_API_KEY = env.USDA_API_KEY;
  
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
          return await handleChatRequest(request);
        }
        
        if (url.pathname === '/api/log-food' && request.method === 'POST') {
          return await handleFoodLogging(request);
        }
  
        if (url.pathname === '/api/search-food' && request.method === 'POST') {
          return await handleFoodSearch(request);
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
  async function handleChatRequest(request: Request): Promise<Response> {
    const { message } = await request.json();
    
    const mastra = await getMastra();
    const result = await mastra.agents.dietAgent.generate([
      {
        role: "user",
        content: message
      }
    ], {
      maxSteps: 3
    });
  
    return new Response(
      JSON.stringify({ 
        response: result.text,
        usage: result.usage 
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
  
  // 处理食物记录请求
  async function handleFoodLogging(request: Request): Promise<Response> {
    const { food_description, meal_type, serving_amount } = await request.json();
    
    const mastra = await getMastra();
    const result = await mastra.workflows.dietLoggingWorkflow.run({
      food_description,
      meal_type,
      serving_amount: serving_amount || "100g"
    });
  
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
  
  // 处理食物搜索请求
  async function handleFoodSearch(request: Request): Promise<Response> {
    const { query } = await request.json();
    
    const mastra = await getMastra();
    const result = await mastra.tools.searchFoodTool.execute({
      inputData: { query, pageSize: 10 }
    });
  
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }