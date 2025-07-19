interface YouTubeSearchResult {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
}

interface CourseResult {
  title: string;
  url: string;
  channel: string;
  duration?: string;
  description?: string;
}

export async function searchEducationalVideo(query: string): Promise<YouTubeSearchResult | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
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

export async function searchYouTubeCourses(skill: string, careerGoal: string): Promise<CourseResult[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY || "";
    
    if (!apiKey) {
      console.warn("YouTube API key not configured, skipping course search");
      return [];
    }

    // Create targeted search query
    const courseQuery = `${skill} tutorial course ${careerGoal} beginner intermediate`;
    
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&videoDuration=long&videoEmbeddable=true&` +
      `safeSearch=strict&relevanceLanguage=en&maxResults=3&order=relevance&` +
      `q=${encodeURIComponent(courseQuery)}&key=${apiKey}`;

    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error("YouTube API error for courses:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Get video details for duration
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = detailsResponse.ok ? await detailsResponse.json() : null;

    return data.items.map((video: any, index: number) => {
      const details = detailsData?.items?.[index];
      const duration = details ? formatDuration(details.contentDetails.duration) : undefined;
      
      return {
        title: video.snippet.title,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        channel: video.snippet.channelTitle,
        duration,
        description: video.snippet.description?.slice(0, 150) + (video.snippet.description?.length > 150 ? '...' : '')
      };
    }).filter((course: CourseResult) => 
      // Filter out very short videos (likely not comprehensive courses)
      !course.duration || !course.duration.includes('PT') || 
      course.duration.includes('H') || 
      (course.duration.includes('M') && parseInt(course.duration.match(/(\d+)M/)?.[1] || '0') > 10)
    );

  } catch (error) {
    console.error("YouTube course search error:", error);
    return [];
  }
}

function formatDuration(isoDuration: string): string {
  // Convert ISO 8601 duration to readable format
  // PT4H30M15S -> 4h 30m
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'Unknown';
  
  const hours = match[1] ? `${match[1]}h ` : '';
  const minutes = match[2] ? `${match[2]}m` : '';
  
  return (hours + minutes).trim() || '< 1m';
}
