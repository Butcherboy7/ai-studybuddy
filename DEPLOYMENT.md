# Deployment Guide

This guide covers deploying EduTutor to various platforms including Render, Vercel, Railway, and others.

## 🌐 Render Deployment (Recommended)

Render is recommended for its simplicity and built-in PostgreSQL support.

### Prerequisites
1. [Render account](https://render.com)
2. GitHub repository with your EduTutor code
3. API keys (Gemini, YouTube)

### Step-by-Step Deployment

#### 1. Database Setup
1. In Render dashboard, click "New" → "PostgreSQL"
2. Name: `edututor-db`
3. Choose plan (Free tier available)
4. Click "Create Database"
5. Copy the "External Database URL" for later

#### 2. Web Service Setup
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure settings:
   - **Name**: `edututor`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

#### 3. Environment Variables
Add these in the Environment section:
```env
NODE_ENV=production
DATABASE_URL=<your-render-postgres-url>
GEMINI_API_KEY=<your-gemini-api-key>
YOUTUBE_API_KEY=<your-youtube-api-key>
PORT=10000
```

#### 4. Deploy
1. Click "Create Web Service"
2. Wait for initial deployment (5-10 minutes)
3. Your app will be available at `https://your-service-name.onrender.com`

### Auto-Deploy Setup
Render automatically deploys when you push to your main branch. No additional setup required!

## 🚀 Alternative Deployment Options

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Note: You'll need a separate database (Neon, PlanetScale, etc.)
```

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy

# Add environment variables in Railway dashboard
```

### Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set YOUTUBE_API_KEY=your_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Docker Deployment
```bash
# Build image
docker build -t edututor .

# Run container
docker run -p 5000:5000 \
  -e DATABASE_URL=your_db_url \
  -e GEMINI_API_KEY=your_key \
  -e YOUTUBE_API_KEY=your_key \
  -e NODE_ENV=production \
  edututor
```

## 🔧 Configuration for Production

### Environment Variables
Ensure these are set in production:

```env
# Required
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
GEMINI_API_KEY=your_google_gemini_api_key
YOUTUBE_API_KEY=your_youtube_data_api_key

# Optional
PORT=5000
SESSION_SECRET=your_random_session_secret
UPLOAD_MAX_SIZE=10485760
```

### Database Migration
Run migrations after deployment:
```bash
npm run db:migrate
```

### Health Check
Your deployment platform should monitor:
- **Endpoint**: `/health` (if implemented)
- **Port**: Same as your PORT environment variable
- **Expected Response**: 200 OK

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
- **Node Version**: Ensure Node.js 18+ is specified
- **Dependencies**: Check package.json for missing dependencies
- **Memory**: Increase build memory if needed

#### Runtime Errors
- **Environment Variables**: Verify all required env vars are set
- **Database Connection**: Check DATABASE_URL format and accessibility
- **API Keys**: Ensure Gemini and YouTube keys are valid

#### Performance Issues
- **Database**: Use connection pooling for high traffic
- **Memory**: Monitor memory usage and upgrade plan if needed
- **CDN**: Consider using a CDN for static assets

### Logs and Monitoring
- **Render**: View logs in dashboard under "Logs" tab
- **Vercel**: Check function logs in dashboard
- **Railway**: Use `railway logs` command
- **Heroku**: Use `heroku logs --tail`

## 📊 Production Optimizations

### Database
- Use connection pooling
- Set up read replicas for high traffic
- Regular backups (most platforms do this automatically)

### Security
- Set secure session secrets
- Use HTTPS (automatic on most platforms)
- Implement rate limiting for API endpoints
- Validate all user inputs

### Performance
- Enable gzip compression
- Use CDN for static assets
- Implement caching strategies
- Monitor response times and memory usage

### Monitoring
Set up monitoring for:
- Application uptime
- Response times
- Error rates
- Database performance
- API quota usage (Gemini, YouTube)

## 🔄 CI/CD Pipeline

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) provides:
- Automated testing on pull requests
- Type checking and linting
- Automatic deployment to Render on main branch updates

### Setup CI/CD
1. Add these secrets to your GitHub repository:
   - `RENDER_SERVICE_ID`: Your Render service ID
   - `RENDER_API_KEY`: Your Render API key

2. Push to main branch to trigger deployment

## 📞 Support

If you encounter deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test locally with production env vars
5. Create an issue with deployment details

## 🎯 Next Steps After Deployment

1. **Custom Domain**: Set up your own domain name
2. **SSL Certificate**: Ensure HTTPS is properly configured
3. **Monitoring**: Set up uptime monitoring
4. **Backups**: Configure regular database backups
5. **Analytics**: Add usage analytics if needed

Your EduTutor platform is now ready for production use! 🎓