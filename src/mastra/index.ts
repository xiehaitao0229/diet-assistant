import { Mastra } from "@mastra/core";
import { dietAgent } from "./agents/diet-agent";
import { searchFoodTool, getFoodDetailsTool } from "./tools/food-database";
import { dietLoggingWorkflow } from "./workflows/diet-logging-workflow";

export const mastra = new Mastra({
  agents: {
    dietAgent
  },
  tools: {
    searchFoodTool,
    getFoodDetailsTool
  },
  workflows: {
    dietLoggingWorkflow
  }
});

// 导出类型供其他文件使用
export type MastraInstance = typeof mastra;