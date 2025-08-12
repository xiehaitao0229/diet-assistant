import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { dietAgent } from "../agents/diet-agent";
import { FoodItemSchema, MealLogSchema } from "../../types/food";

// 步骤 1: 搜索和识别食物
const searchFoodStep = createStep({
  id: "search-food-step",
  description: "搜索用户描述的食物",
  inputSchema: z.object({
    food_description: z.string(),
    meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"])
  }),
  outputSchema: z.object({
    found_foods: z.array(z.object({
      fdcId: z.number(),
      description: z.string(),
      relevance_score: z.number()
    })),
    meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"])
  }),
  execute: async ({ inputData }) => {
    const { food_description, meal_type } = inputData;
    
    const result = await dietAgent.generate([
      {
        role: "user",
        content: `请搜索这个食物: "${food_description}". 我需要找到最匹配的食物选项。请使用英文关键词搜索以获得更好的结果。`
      }
    ], {
      maxSteps: 2
    });

    // 简化处理 - 实际项目中需要解析 agent 响应
    return {
      found_foods: [
        {
          fdcId: 123456, // 示例 ID
          description: food_description,
          relevance_score: 0.9
        }
      ],
      meal_type
    };
  }
});

// 步骤 2: 获取营养详情
const getNutritionStep = createStep({
  id: "get-nutrition-step",
  description: "获取选中食物的详细营养信息",
  inputSchema: z.object({
    found_foods: z.array(z.object({
      fdcId: z.number(),
      description: z.string(),
      relevance_score: z.number()
    })),
    meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    serving_amount: z.string().default("100g")
  }),
  outputSchema: z.object({
    food_item: FoodItemSchema,
    nutrition_summary: z.string()
  }),
  execute: async ({ inputData }) => {
    const { found_foods, meal_type, serving_amount } = inputData;
    
    // 选择最匹配的食物（第一个）
    const selectedFood = found_foods[0];
    
    const result = await dietAgent.generate([
      {
        role: "user",
        content: `请获取 fdcId ${selectedFood.fdcId} 的详细营养信息，分量: ${serving_amount}。请用中文总结营养价值。`
      }
    ], {
      maxSteps: 2
    });

    // 简化处理 - 返回模拟数据
    const foodItem: FoodItem = {
      name: selectedFood.description,
      calories: 52, // 示例数据
      protein: 0.3,
      carbs: 14,
      fat: 0.2,
      fiber: 2.4,
      sodium: 1,
      serving_size: serving_amount,
      meal_type
    };

    return {
      food_item: foodItem,
      nutrition_summary: `${foodItem.name} (${serving_amount}): ${foodItem.calories} 卡路里，富含维生素和膳食纤维`
    };
  }
});

// 步骤 3: 生成记录摘要和建议
const generateSummaryStep = createStep({
  id: "generate-summary-step",
  description: "生成饮食记录摘要和健康建议",
  inputSchema: z.object({
    food_item: FoodItemSchema,
    nutrition_summary: z.string()
  }),
  outputSchema: z.object({
    log_entry: MealLogSchema,
    health_tips: z.array(z.string()),
    daily_progress: z.string()
  }),
  execute: async ({ inputData }) => {
    const { food_item, nutrition_summary } = inputData;
    
    const result = await dietAgent.generate([
      {
        role: "user",
        content: `
          基于这个食物记录生成健康建议:
          ${nutrition_summary}
          
          请提供:
          1. 简短的健康评价（考虑中国人的饮食习惯）
          2. 3个实用的健康小贴士
          3. 今日饮食进度评估
          
          请用温馨友好的语调回复。
        `
      }
    ]);

    const logEntry: MealLog = {
      date: new Date().toISOString().split('T')[0],
      foods: [food_item],
      total_calories: food_item.calories,
      notes: `通过 DeepSeek AI 助手记录`
    };

    return {
      log_entry: logEntry,
      health_tips: [
        "记得多喝温水，促进新陈代谢",
        "搭配一些绿叶蔬菜，补充维生素",
        "适量运动，帮助消化吸收"
      ],
      daily_progress: `今日已记录 ${food_item.calories} 卡路里，继续保持！`
    };
  }
});

// 创建完整的饮食记录工作流
export const dietLoggingWorkflow = createWorkflow({
  id: "diet-logging-workflow",
  inputSchema: z.object({
    food_description: z.string(),
    meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    serving_amount: z.string().default("100g")
  }),
  outputSchema: z.object({
    success: z.boolean(),
    log_entry: MealLogSchema,
    health_tips: z.array(z.string()),
    daily_progress: z.string(),
    message: z.string()
  })
})
.then(searchFoodStep)
.then(getNutritionStep)
.then(generateSummaryStep)
.map(async ({ results, inputData }) => {
  const summaryResult = results[2]; // 最后一步的结果
  
  return {
    success: true,
    log_entry: summaryResult.log_entry,
    health_tips: summaryResult.health_tips,
    daily_progress: summaryResult.daily_progress,
    message: `成功记录 ${inputData.food_description}! 🎉`
  };
})
.commit();