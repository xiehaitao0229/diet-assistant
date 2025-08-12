import { z } from "zod";

export const FoodItemSchema = z.object({
  name: z.string(),
  brand: z.string().optional(),
  calories: z.number(),
  protein: z.number(),      // 克
  carbs: z.number(),        // 克
  fat: z.number(),          // 克
  fiber: z.number().optional(),
  sodium: z.number().optional(),
  serving_size: z.string(),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"])
});

export const MealLogSchema = z.object({
  date: z.string(),
  foods: z.array(FoodItemSchema),
  total_calories: z.number(),
  notes: z.string().optional()
});

export type FoodItem = z.infer<typeof FoodItemSchema>;
export type MealLog = z.infer<typeof MealLogSchema>;