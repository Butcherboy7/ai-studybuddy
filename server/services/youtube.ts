interface YouTubeSearchResult {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

export async function searchEducationalVideo(query: string): Promise<YouTubeSearchResult | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY || "";
    
    if (!apiKey) {
      console.warn("YouTube API key not configured, skipping video search");
      return null;
    }

    // Add educational terms to improve search quality
    const educationalQuery = `${query} tutorial education learn explain`;
    
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&videoDuration=medium&videoEmbeddable=true&` +
      `safeSearch=strict&relevanceLanguage=en&maxResults=1&` +
      `q=${encodeURIComponent(educationalQuery)}&key=${apiKey}`;

    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error("YouTube API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      return {
        videoId: video.id.videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`
      };
    }
    
    return null;
  } catch (error) {
    console.error("YouTube search error:", error);
    return null;
  }
}

export function shouldIncludeVideo(message: string): boolean {
  const visualConcepts = [
    'explain', 'show me', 'how does', 'what does', 'tutorial', 'example',
    'demonstrate', 'visual', 'diagram', 'graph', 'chart', 'process',
    'step by step', 'works', 'looks like', 'appears', 'visual aid'
  ];
  
  const lowerMessage = message.toLowerCase();
  return visualConcepts.some(concept => lowerMessage.includes(concept));
}
