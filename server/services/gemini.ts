import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || "" 
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateChatResponse(
  message: string, 
  tutorPersona: string = "General Tutor",
  messageHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const systemPrompt = `You are ${tutorPersona}, an expert AI tutor. Provide helpful, educational responses that are:
    - Clear and easy to understand
    - Step-by-step when solving problems
    - Encouraging and supportive
    - Focused on helping the student learn concepts
    - Include examples when helpful
    
    If the student asks for explanations of concepts that would benefit from visual aids (like scientific processes, mathematical concepts, historical events, etc.), mention that a relevant video has been provided to help with visual learning.`;

    // Build conversation context
    const conversationHistory = messageHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullPrompt = conversationHistory 
      ? `${systemPrompt}\n\nConversation history:\n${conversationHistory}\n\nStudent: ${message}`
      : `${systemPrompt}\n\nStudent: ${message}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate response from AI tutor");
  }
}

export async function generatePracticeQuestions(
  subject: string,
  topic: string,
  difficulty: string,
  questionCount: number,
  questionTypes: string[]
): Promise<any[]> {
  try {
    const systemPrompt = `You are an expert educational content creator. Generate ${questionCount} practice questions for:
    Subject: ${subject}
    Topic: ${topic}
    Difficulty: ${difficulty}
    Question types: ${questionTypes.join(', ')}
    
    Return a JSON array of questions with this exact format:
    [
      {
        "type": "Multiple Choice" | "Short Answer" | "Problem Solving" | "Essay",
        "question": "The question text",
        "options": ["A", "B", "C", "D"] (only for multiple choice),
        "answer": "Correct answer or expected response",
        "explanation": "Detailed explanation of the solution",
        "difficulty": "${difficulty}",
        "points": number
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: `Generate practice questions for this educational content.`,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Question generation error:", error);
    throw new Error("Failed to generate practice questions");
  }
}
