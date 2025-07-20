import { createWorker } from 'tesseract.js';

export async function extractTextWithFallback(buffer: Buffer, mimetype: string): Promise<string> {
  let extractedText = '';
  
  if (mimetype === 'application/pdf') {
    // Try PDF parsing first
    try {
      const PDFParser = await import('pdf2json');
      extractedText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser.default();
        
        // Set a timeout for PDF parsing
        const timeout = setTimeout(() => {
          reject(new Error('PDF parsing timeout'));
        }, 10000); // 10 second timeout
        
        pdfParser.on("pdfParser_dataError", async (errData: any) => {
          clearTimeout(timeout);
          console.log("PDF parser failed, trying OCR fallback...");
          try {
            const worker = await createWorker('eng');
            const { data: { text } } = await worker.recognize(buffer);
            await worker.terminate();
            resolve(text);
          } catch (ocrError) {
            reject(new Error("Both PDF parsing and OCR failed"));
          }
        });
        
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
          clearTimeout(timeout);
          try {
            let text = '';
            if (pdfData.Pages) {
              pdfData.Pages.forEach((page: any) => {
                if (page.Texts) {
                  page.Texts.forEach((textItem: any) => {
                    if (textItem.R) {
                      textItem.R.forEach((textRun: any) => {
                        if (textRun.T) {
                          text += decodeURIComponent(textRun.T) + ' ';
                        }
                      });
                    }
                  });
                  text += '\n';
                }
              });
            }
            resolve(text.trim());
          } catch (parseError) {
            reject(new Error("Failed to extract text from PDF data"));
          }
        });
        
        pdfParser.parseBuffer(buffer);
      });
    } catch (pdfError) {
      console.error("PDF parsing failed, using OCR:", pdfError);
      // OCR fallback
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(buffer);
      await worker.terminate();
      extractedText = text;
    }
  } else if (mimetype.startsWith('image/')) {
    // Use OCR for images
    const worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    extractedText = text;
  }
  
  return extractedText.replace(/\s+/g, ' ').trim();
}