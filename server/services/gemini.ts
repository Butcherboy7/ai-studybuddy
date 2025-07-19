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
    
    const systemPrompt = `You are an expert educational content creator specializing in generating high-quality practice questions. 

TASK: Generate exactly ${questionCount} practice questions for:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty: ${difficulty}
- Question types to use: ${questionTypes.join(', ')}

${hasUploadedContent ? `
CONTENT SOURCE: Base ALL questions on this specific uploaded content:
"${uploadedContent}"

REQUIREMENTS:
- Extract key concepts, facts, formulas, and principles from the uploaded content
- Generate questions that test comprehension, analysis, and application of the material
- Ensure questions cover different aspects of the content (not just surface-level facts)
- Include specific details, numbers, names, and terminology from the uploaded content
- Make questions relevant to real-world applications where possible
` : `
REQUIREMENTS:
- Create comprehensive questions covering core concepts in ${topic}
- Include both theoretical understanding and practical application
- Ensure questions are appropriate for ${difficulty} level students
`}

QUESTION TYPES GUIDE:
- Multiple Choice: 4 options with one clearly correct answer
- Short Answer: Requires 1-3 sentence responses
- Problem Solving: Step-by-step mathematical or analytical problems
- Essay: Requires detailed explanation or analysis (2-3 paragraphs)

DIFFICULTY LEVELS:
- Beginner: Basic concepts, definitions, simple applications
- Intermediate: Analysis, comparison, multi-step problems
- Advanced: Synthesis, evaluation, complex problem solving
- Mixed: Combination of all levels

Return a JSON array with this EXACT format:
[
  {
    "type": "Multiple Choice" | "Short Answer" | "Problem Solving" | "Essay",
    "question": "Clear, specific question text",
    "options": ["Option A", "Option B", "Option C", "Option D"] (only for Multiple Choice),
    "answer": "Correct answer or model response",
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "${difficulty}",
    "points": 5
  }
]`;

    const contentPrompt = hasUploadedContent 
      ? `Generate practice questions based on the uploaded content provided in the system prompt. Focus on testing comprehension, analysis, and application of the material.`
      : `Generate practice questions for this educational content about ${topic} in ${subject}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt + "\n\n" + contentPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    let responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from model");
    }
    
    // Clean up the response - remove markdown code blocks if present
    responseText = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Try to extract JSON from the response if it contains other text
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }
    
    // Parse the JSON response
    const result = JSON.parse(responseText);
    
    return result;
  } catch (error) {
    console.error("Question generation error:", error);
    throw new Error("Failed to generate practice questions");
  }
}
