import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, generatePracticeQuestions } from "./services/gemini";
import { searchEducationalVideo, shouldIncludeVideo } from "./services/youtube";
import { 
  chatRequestSchema, 
  paperGenerationRequestSchema,
  insertChatSessionSchema,
  insertMessageSchema,
  insertPracticepaperSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, tutorPersona, messageHistory } = chatRequestSchema.parse(req.body);
      
      // Ensure chat session exists
      let chatSession = await storage.getChatSession(sessionId);
      if (!chatSession) {
        chatSession = await storage.createChatSession({
          sessionId,
          tutorPersona: tutorPersona || "General Tutor"
        });
      }

      // Store user message
      await storage.createMessage({
        sessionId,
        role: "user",
        content: message
      });

      // Generate AI response
      const textResponse = await generateChatResponse(message, tutorPersona, messageHistory);
      
      // Check if we should include a video
      let videoURL: string | undefined;
      if (shouldIncludeVideo(message)) {
        const videoResult = await searchEducationalVideo(message);
        if (videoResult) {
          videoURL = videoResult.url;
        }
      }

      // Store AI response
      await storage.createMessage({
        sessionId,
        role: "assistant",
        content: textResponse,
        videoUrl: videoURL
      });

      res.json({
        textResponse,
        videoURL: videoURL || null
      });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({ 
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get chat history
  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to retrieve messages" });
    }
  });

  // Generate practice paper
  app.post("/api/practice-paper", async (req, res) => {
    try {
      const { sessionId, subject, topic, difficulty, questionCount, questionTypes } = 
        paperGenerationRequestSchema.parse(req.body);

      const questions = await generatePracticeQuestions(
        subject, 
        topic, 
        difficulty, 
        questionCount, 
        questionTypes
      );

      const practicePaper = await storage.createPracticePaper({
        sessionId,
        subject,
        topic,
        difficulty,
        questionCount,
        questions
      });

      res.json(practicePaper);
    } catch (error) {
      console.error("Practice paper generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate practice paper",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get practice papers for session
  app.get("/api/practice-papers/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const papers = await storage.getPracticePapersBySession(sessionId);
      res.json(papers);
    } catch (error) {
      console.error("Get practice papers error:", error);
      res.status(500).json({ error: "Failed to retrieve practice papers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
