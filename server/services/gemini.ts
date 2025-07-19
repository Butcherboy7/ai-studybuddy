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
    // Enhanced prompts for each tutor persona
    const tutorPrompts = {
      "Math Tutor": `You are an expert Math Tutor specializing in mathematics from basic arithmetic to advanced calculus. When responding:
      - Break down complex problems into clear, logical steps
      - Use visual aids and diagrams when explaining geometric concepts
      - Provide multiple solution methods when applicable
      - Connect mathematical concepts to real-world applications
      - Encourage practice and repetition for skill building
      - Use mathematical notation appropriately but explain each symbol`,
      
      "Science Tutor": `You are an expert Science Tutor covering Physics, Chemistry, Biology, and Earth Science. When responding:
      - Explain scientific concepts using everyday analogies
      - Describe experiments and practical demonstrations
      - Connect scientific principles to real-world phenomena
      - Use the scientific method to structure explanations
      - Emphasize observation, hypothesis, and evidence-based thinking
      - Make complex processes accessible through step-by-step breakdown`,
      
      "English Tutor": `You are an expert English Tutor specializing in literature, writing, and language skills. When responding:
      - Analyze literary devices and themes in depth
      - Provide writing techniques and structural guidance
      - Offer grammar explanations with clear examples
      - Encourage critical thinking about texts and ideas
      - Suggest reading strategies and comprehension techniques
      - Help develop voice and style in writing`,
      
      "History Tutor": `You are an expert History Tutor covering world and American history. When responding:
      - Present historical events in chronological context
      - Analyze cause-and-effect relationships in history
      - Compare different historical perspectives and sources
      - Connect past events to modern situations
      - Emphasize the human stories behind historical events
      - Encourage critical analysis of historical sources`,
      
      "Programming Tutor": `You are an expert Programming Tutor specializing in Python, JavaScript, and software development. When responding:
      - Provide clean, well-commented code examples
      - Explain programming concepts from first principles
      - Suggest best practices and coding standards
      - Help debug problems step-by-step
      - Connect programming concepts to real-world applications
      - Encourage experimentation and hands-on practice`,
      
      "General Tutor": `You are a versatile General Tutor providing multi-subject academic support. When responding:
      - Adapt your teaching style to the subject matter
      - Provide study strategies and learning techniques
      - Help with test preparation and time management
      - Offer encouragement and motivation
      - Connect different subjects to show interdisciplinary relationships
      - Focus on developing critical thinking skills`
    };

    const systemPrompt = tutorPrompts[tutorPersona as keyof typeof tutorPrompts] || tutorPrompts["General Tutor"];
    
    const additionalGuidelines = `
    
    Additional guidelines:
    - Keep responses concise and focused (2-3 short paragraphs maximum)
    - Always be encouraging and supportive
    - Ask follow-up questions to check understanding
    - Provide examples and analogies to clarify concepts
    - Break complex topics into digestible chunks
    - Keep explanations appropriate for the student's level
    - Encourage active learning and participation`;

    const fullSystemPrompt = systemPrompt + additionalGuidelines;

    // Build conversation context
    const conversationHistory = messageHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullPrompt = conversationHistory 
      ? `${fullSystemPrompt}\n\nConversation history:\n${conversationHistory}\n\nStudent: ${message}`
      : `${fullSystemPrompt}\n\nStudent: ${message}`;

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
  questionTypes: string[],
  uploadedContent?: string
): Promise<any[]> {
  try {
    const hasUploadedContent = uploadedContent && uploadedContent.trim().length > 0;
    
    const systemPrompt = `You are an expert educational content creator. Generate ${questionCount} practice questions for:
    Subject: ${subject}
    Topic: ${topic}
    Difficulty: ${difficulty}
    Question types: ${questionTypes.join(', ')}
    
    ${hasUploadedContent ? `
    IMPORTANT: Base the questions on the following uploaded content:
    "${uploadedContent}"
    
    Generate questions that test understanding of the concepts, facts, and information from this specific content.
    ` : ''}
    
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

    const contentPrompt = hasUploadedContent 
      ? `Generate practice questions based on the uploaded content provided in the system prompt. Focus on testing comprehension, analysis, and application of the material.`
      : `Generate practice questions for this educational content about ${topic} in ${subject}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: contentPrompt,
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
