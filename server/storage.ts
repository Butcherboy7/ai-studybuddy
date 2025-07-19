import { 
  chatSessions, 
  messages, 
  practicePapers, 
  type ChatSession, 
  type Message, 
  type PracticePaper, 
  type InsertChatSession, 
  type InsertMessage, 
  type InsertPracticePaper 
} from "@shared/schema";

export interface IStorage {
  // Chat sessions
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: string, limit?: number): Promise<Message[]>;
  
  // Practice papers
  createPracticePaper(paper: InsertPracticePaper): Promise<PracticePaper>;
  getPracticePapersBySession(sessionId: string): Promise<PracticePaper[]>;
}

export class MemStorage implements IStorage {
  private chatSessions: Map<string, ChatSession>;
  private messages: Map<string, Message[]>;
  private practicePapers: Map<string, PracticePaper[]>;
  private currentChatId: number;
  private currentMessageId: number;
  private currentPaperId: number;

  constructor() {
    this.chatSessions = new Map();
    this.messages = new Map();
    this.practicePapers = new Map();
    this.currentChatId = 1;
    this.currentMessageId = 1;
    this.currentPaperId = 1;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const id = this.currentChatId++;
    const chatSession: ChatSession = {
      ...session,
      id,
      createdAt: new Date(),
    };
    this.chatSessions.set(session.sessionId, chatSession);
    return chatSession;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(sessionId);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
      videoUrl: message.videoUrl || null,
    };
    
    if (!this.messages.has(message.sessionId)) {
      this.messages.set(message.sessionId, []);
    }
    this.messages.get(message.sessionId)!.push(newMessage);
    return newMessage;
  }

  async getMessagesBySession(sessionId: string, limit = 20): Promise<Message[]> {
    const sessionMessages = this.messages.get(sessionId) || [];
    return sessionMessages
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-limit);
  }

  async createPracticePaper(paper: InsertPracticePaper): Promise<PracticePaper> {
    const id = this.currentPaperId++;
    const newPaper: PracticePaper = {
      ...paper,
      id,
      createdAt: new Date(),
    };
    
    if (!this.practicePapers.has(paper.sessionId)) {
      this.practicePapers.set(paper.sessionId, []);
    }
    this.practicePapers.get(paper.sessionId)!.push(newPaper);
    return newPaper;
  }

  async getPracticePapersBySession(sessionId: string): Promise<PracticePaper[]> {
    return this.practicePapers.get(sessionId) || [];
  }
}

export const storage = new MemStorage();
