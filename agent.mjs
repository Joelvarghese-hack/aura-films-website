import { agent, tool, Sandbox } from "@21st-sdk/agent";
import { z } from "zod";

const componentTool = tool({
  description: "Fetch a UI component from 21st.dev",
  parameters: z.object({
    query: z.string().describe("Component to fetch, e.g. animated hero"),
  }),
  execute: async ({ query }) => {
    console.log(`Fetching: ${query}`);
    return query;
  },
});

const result = await agent({
  apiKey: "an_sk_6aed0beda87e2bf14268a6e6b002af85b35bbc320fc4776ea761e23f1bdca787",
  tools: [componentTool],
  prompt: "Fetch an animated hero component",
});

console.log(result);