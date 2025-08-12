import { createTool } from "@mastra/core";
import { z } from "zod";
import axios from "axios";

// 使用 USDA FoodData Central API (免费)
export const searchFoodTool = createTool({
  id: "search-food",
  description: "从 USDA 数据库搜索食物营养信息",
  inputSchema: z.object({
    query: z.string().describe("食物搜索关键词，如 'apple' 或 '苹果'"),
    pageSize: z.number().default(5).describe("返回结果数量")
  }),
  outputSchema: z.object({
    foods: z.array(z.object({
      fdcId: z.number(),
      description: z.string(),
      brandOwner: z.string().optional(),
      ingredients: z.string().optional(),
      nutrients: z.array(z.object({
        nutrientId: z.number(),
        nutrientName: z.string(),
        value: z.number(),
        unitName: z.string()
      }))
    }))
  }),
  execute: async ({ inputData }) => {
    const { query, pageSize } = inputData;
    
    try {
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/foods/search`,
        {
          params: {
            query,
            pageSize,
            api_key: process.env.USDA_API_KEY
          }
        }
      );

      return {
        foods: response.data.foods.map((food: any) => ({
          fdcId: food.fdcId,
          description: food.description,
          brandOwner: food.brandOwner,
          ingredients: food.ingredients,
          nutrients: food.foodNutrients?.map((nutrient: any) => ({
            nutrientId: nutrient.nutrientId,
            nutrientName: nutrient.nutrientName,
            value: nutrient.value || 0,
            unitName: nutrient.unitName
          })) || []
        }))
      };
    } catch (error) {
      console.error('USDA API 调用失败:', error);
      throw new Error(`搜索食物失败: ${error}`);
    }
  }
});

export const getFoodDetailsTool = createTool({
  id: "get-food-details",
  description: "获取特定食物的详细营养信息",
  inputSchema: z.object({
    fdcId: z.number().describe("USDA 食物数据库 ID")
  }),
  outputSchema: z.object({
    food: z.object({
      description: z.string(),
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number(),
      fiber: z.number(),
      sodium: z.number(),
      serving_size: z.string()
    })
  }),
  execute: async ({ inputData }) => {
    const { fdcId } = inputData;
    
    try {
      const response = await axios.get(
        `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`,
        {
          params: {
            api_key: process.env.USDA_API_KEY
          }
        }
      );

      const food = response.data;
      const nutrients = food.foodNutrients || [];
      
      // 提取主要营养素 (USDA 营养素 ID)
      const getNutrientValue = (nutrientId: number) => {
        const nutrient = nutrients.find((n: any) => n.nutrient.id === nutrientId);
        return nutrient?.amount || 0;
      };

      return {
        food: {
          description: food.description,
          calories: getNutrientValue(1008), // Energy
          protein: getNutrientValue(1003),  // Protein
          carbs: getNutrientValue(1005),    // Carbohydrate
          fat: getNutrientValue(1004),      // Total lipid (fat)
          fiber: getNutrientValue(1079),    // Fiber
          sodium: getNutrientValue(1093),   // Sodium
          serving_size: "100g" // USDA 默认为 100g
        }
      };
    } catch (error) {
      console.error('获取食物详情失败:', error);
      throw new Error(`获取食物详情失败: ${error}`);
    }
  }
});