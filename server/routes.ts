import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import PDFParser from "pdf2json";
import { createWorker } from "tesseract.js";
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
  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept PDF files and images
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/bmp',
        'image/tiff'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF and image files are allowed.'), false);
      }
    }
  });

  // File upload and OCR processing endpoint
  app.post("/api/upload/resume", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded" 
        });
      }

      const { buffer, mimetype, originalname } = req.file;
      let extractedText = '';

      if (mimetype === 'application/pdf') {
        // Extract text from PDF using pdf2json
        try {
          extractedText = await new Promise((resolve, reject) => {
            const pdfParser = new PDFParser();
            
            pdfParser.on("pdfParser_dataError", (errData: any) => {
              reject(new Error(errData.parserError || "PDF parsing failed"));
            });
            
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
              try {
                // Extract text from all pages
                let text = '';
                if (pdfData.Pages) {
                  pdfData.Pages.forEach((page: any) => {
                    if (page.Texts) {
                      page.Texts.forEach((textItem: any) => {
                        if (textItem.R) {
                          textItem.R.forEach((textRun: any) => {
                            if (textRun.T) {
                              // Decode URI component to handle special characters
                              text += decodeURIComponent(textRun.T) + ' ';
                            }
                          });
                        }
                      });
                      text += '\n'; // Add newline after each page
                    }
                  });
                }
                resolve(text.trim());
              } catch (parseError) {
                reject(new Error("Failed to extract text from PDF data"));
              }
            });
            
            // Parse the PDF buffer
            pdfParser.parseBuffer(buffer);
          });
        } catch (pdfError) {
          console.error("PDF parsing error:", pdfError);
          return res.status(500).json({ 
            error: "Failed to extract text from PDF",
            details: "The PDF file might be corrupted or password-protected"
          });
        }
      } else if (mimetype.startsWith('image/')) {
        // Use OCR for images
        try {
          const worker = await createWorker('eng');
          const { data: { text } } = await worker.recognize(buffer);
          await worker.terminate();
          extractedText = text;
        } catch (ocrError) {
          console.error("OCR processing error:", ocrError);
          return res.status(500).json({ 
            error: "Failed to extract text from image",
            details: "Could not process the image file"
          });
        }
      }

      // Clean up extracted text
      extractedText = extractedText
        .replace(/\s+/g, ' ')
        .trim();

      if (!extractedText || extractedText.length < 10) {
        return res.status(400).json({ 
          error: "No readable text found in the file",
          details: "The file appears to be empty or contains no extractable text"
        });
      }

      res.json({
        success: true,
        extractedText,
        fileName: originalname,
        fileType: mimetype,
        message: "File processed successfully"
      });
    } catch (error) {
      console.error("File processing error:", error);
      res.status(500).json({ 
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

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
