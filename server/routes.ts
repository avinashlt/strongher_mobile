import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/analyze-food", async (req, res) => {
    try {
      const { imageBase64 } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "No image provided" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "AI service not configured. Please set OPENAI_API_KEY." });
      }

      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition analysis expert. Analyze the food in the image and estimate its nutritional content. Respond with JSON in this exact format: { \"name\": \"food name\", \"calories\": number, \"protein\": number (grams), \"carbs\": number (grams), \"fat\": number (grams) }. Be as accurate as possible with your estimates based on typical serving sizes visible in the photo.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image and provide the nutritional breakdown.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 512,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return res.status(500).json({ error: "No response from AI" });
      }

      const nutritionData = JSON.parse(content);
      return res.json(nutritionData);
    } catch (error: any) {
      console.error("Food analysis error:", error);
      return res.status(500).json({ error: error.message || "Failed to analyze food" });
    }
  });

  app.get("/api/premium-content", (_req, res) => {
    const content = [
      {
        id: "1",
        title: "Advanced HIIT Workout Plan",
        description: "12-week high-intensity interval training program designed for maximum fat burn and muscle retention.",
        category: "workout",
        duration: "12 weeks",
      },
      {
        id: "2",
        title: "Macro-Optimized Meal Plans",
        description: "Customizable weekly meal plans with precise macro breakdowns for cutting, bulking, or maintenance.",
        category: "nutrition",
        duration: "4 weeks",
      },
      {
        id: "3",
        title: "Recovery & Mobility Guide",
        description: "Expert-designed stretching and recovery routines to prevent injury and improve performance.",
        category: "recovery",
        duration: "Ongoing",
      },
      {
        id: "4",
        title: "Sleep Optimization Protocol",
        description: "Science-backed strategies to improve sleep quality for better recovery and performance.",
        category: "wellness",
        duration: "30 days",
      },
      {
        id: "5",
        title: "Progressive Overload Masterclass",
        description: "Learn the principles of progressive overload to continuously build strength and muscle.",
        category: "workout",
        duration: "8 weeks",
      },
      {
        id: "6",
        title: "Supplement Stacking Guide",
        description: "Evidence-based supplement recommendations for performance, recovery, and overall health.",
        category: "nutrition",
        duration: "Ongoing",
      },
    ];

    return res.json(content);
  });

  const httpServer = createServer(app);
  return httpServer;
}
