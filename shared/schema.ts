import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  tutorPersona: text("tutor_persona").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  videoUrl: text("video_url"),
  reactions: text("reactions").array().default(sql`'{}'::text[]`),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const practicePapers = pgTable("practice_papers", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  difficulty: text("difficulty").notNull(),
  questionCount: integer("question_count").notNull(),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  sessionId: true,
  tutorPersona: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  role: true,
  content: true,
  videoUrl: true,
  reactions: true,
});

// Schema for adding reactions to messages
export const addReactionSchema = z.object({
  messageId: z.number(),
  reaction: z.string().min(1).max(10),
});

export const removeReactionSchema = z.object({
  messageId: z.number(),
  reaction: z.string().min(1).max(10),
});

export const insertPracticepaperSchema = createInsertSchema(practicePapers).pick({
  sessionId: true,
  subject: true,
  topic: true,
  difficulty: true,
  questionCount: true,
  questions: true,
});

export const chatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().min(1),
  tutorPersona: z.string().optional(),
  messageHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export const paperGenerationRequestSchema = z.object({
  sessionId: z.string().min(1),
  subject: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Mixed']),
  questionCount: z.number().min(5).max(50),
  questionTypes: z.array(z.string()).min(1),
  uploadedContent: z.string().optional(),
});

export const resumeAnalysisRequestSchema = z.object({
  resumeText: z.string().min(10),
  careerGoal: z.string().min(3),
  targetRole: z.string().optional(),
});

export const skillGapAnalysisSchema = z.object({
  currentSkills: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  skillGaps: z.array(z.string()),
  experience: z.string(),
  recommendations: z.array(z.object({
    skill: z.string(),
    priority: z.enum(['High', 'Medium', 'Low']),
    description: z.string(),
    courses: z.array(z.object({
      title: z.string(),
      url: z.string(),
      channel: z.string(),
      duration: z.string().optional(),
      description: z.string().optional(),
    })),
  })),
  overallScore: z.number().min(0).max(100),
});

// Types
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type AddReaction = z.infer<typeof addReactionSchema>;
export type RemoveReaction = z.infer<typeof removeReactionSchema>;
export type InsertPracticePaper = z.infer<typeof insertPracticepaperSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type PaperGenerationRequest = z.infer<typeof paperGenerationRequestSchema>;
export type ResumeAnalysisRequest = z.infer<typeof resumeAnalysisRequestSchema>;
export type SkillGapAnalysis = z.infer<typeof skillGapAnalysisSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type PracticePaper = typeof practicePapers.$inferSelect;
