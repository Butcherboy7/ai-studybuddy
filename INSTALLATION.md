
# Installation Guide for EduTutor

## Dependencies Added for Enhanced Features

### React Markdown Support
```bash
npm install react-markdown react-syntax-highlighter
npm install --save-dev @types/react-syntax-highlighter
```

### OCR and File Processing (Future Implementation)
For production OCR functionality, you would install:
```bash
npm install tesseract.js pdf-parse
```

### Complete Installation

1. **Install all dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   YOUTUBE_API_KEY=your_youtube_api_key_here
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## New Features Implemented

### 1. Markdown Formatting
- AI responses now support full markdown formatting
- Code syntax highlighting with Prism.js
- Proper styling for headings, lists, blockquotes, and tables

### 2. Enhanced Voice Recognition
- Proper permission handling for microphone access
- Network error fallback handling
- Better error messages for different failure scenarios

### 3. OCR Functionality
- Image text extraction simulation (ready for tesseract.js integration)
- PDF content processing simulation
- Smart text extraction based on file names and content

### 4. Improved UI/UX
- Quick start questions moved to top of chat
- Predefined prompt buttons above text input
- Better file upload feedback and validation
- Enhanced error handling throughout

### 5. File Upload Improvements
- Support for more image formats (WebP, GIF)
- Better file size validation with specific feedback
- Intelligent content extraction based on file context
- Proper progress indicators during processing

## Browser Compatibility

### Voice Recognition Requirements
- Chrome/Chromium-based browsers (recommended)
- Firefox (limited support)
- Safari (iOS 14.5+)
- Requires HTTPS in production

### File Upload Support
- All modern browsers support the File API
- OCR processing requires internet connection for cloud services
- Local processing available with tesseract.js

## Production Deployment Notes

### For Full OCR Implementation
1. Install tesseract.js: `npm install tesseract.js`
2. For PDF processing: `npm install pdf-parse`
3. Consider cloud OCR services for better accuracy:
   - Google Cloud Vision API
   - Azure Computer Vision
   - AWS Textract

### Performance Optimization
- Implement file size limits on server side
- Add image compression before OCR processing
- Use web workers for heavy processing tasks
- Consider caching OCR results

## Troubleshooting

### Voice Recognition Issues
- Ensure microphone permissions are granted
- Check browser compatibility
- Verify HTTPS connection in production
- Test with different browsers

### File Upload Problems
- Check file size limits (currently 10MB)
- Verify file type restrictions
- Ensure proper error handling is implemented
- Test with various file formats

### Markdown Rendering Issues
- Verify react-markdown installation
- Check CSS styling conflicts
- Ensure proper dark mode support
- Test with complex markdown content
