import type { VercelRequest, VercelResponse } from '@vercel/node';

const YOUTUBE_API_KEY = 'AIzaSyCdgmEsPW59-U4bNKj-u-FSHHVaFfFO_VM';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for API routes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { url = '', method = 'GET' } = req;
  const pathname = new URL(url, 'http://localhost').pathname;
  
  try {
    // Test endpoint (simple health check)
    if (pathname === '/api/test' && method === 'GET') {
      return res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        environment: "vercel",
        message: "MusicReward API Working"
      });
    }
    
    // YouTube Music Search
    if (pathname === '/api/ytmusic/search' && method === 'GET') {
      const query = req.query?.q;
      const limit = req.query?.limit || "25";
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&q=${encodeURIComponent(query + ' music')}&type=video&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json() as any;
      
      if (!response.ok) {
        console.error('YouTube API Error:', data);
        return res.status(500).json({ error: "Failed to search YouTube" });
      }
      
      const songs = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        duration: 180,
        audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      })) || [];
      
      return res.json({ songs });
    }
    
    // Simple featured songs endpoint
    if (pathname === '/api/admin/featured-songs' && method === 'GET') {
      return res.json({ songs: [] }); // Return empty for now
    }
    
    // Charts endpoint - fallback to popular Indonesian music
    if (pathname === '/api/ytmusic/charts' && method === 'GET') {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=lagu+indonesia+terpopuler+2025&type=video&order=relevance&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(searchUrl);
      const data = await response.json() as any;
      
      if (!response.ok) {
        console.error('YouTube API Error:', data);
        return res.json({ songs: [] });
      }
      
      const songs = data.items?.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        duration: 180,
        audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      })) || [];
      
      return res.json({ songs });
    }

    // Simple song details endpoint
    if (pathname.startsWith('/api/ytmusic/song/') && method === 'GET') {
      const videoId = pathname.split('/').pop();
      if (!videoId) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      
      // Get from YouTube Data API
      const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
      
      const response = await fetch(videoUrl);
      const data = await response.json() as any;
      
      if (!response.ok || !data.items?.length) {
        return res.json({ 
          song: {
            id: videoId,
            title: "Song Not Found",
            artist: "Unknown",
            duration: 180,
            thumbnail: "",
            audioUrl: `https://www.youtube.com/watch?v=${videoId}`
          }
        });
      }
      
      const item = data.items[0] as any;
      return res.json({ 
        song: {
          id: videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          duration: 180,
          thumbnail: item.snippet.thumbnails?.medium?.url || '',
          audioUrl: `https://www.youtube.com/watch?v=${videoId}`
        }
      });
    }

    // 404 for other routes
    console.log(`Unhandled route: ${pathname} (${method})`);
    return res.status(404).json({ error: "Route not found", path: pathname, method });
    
  } catch (error) {
    console.error("API Handler Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      path: pathname || 'unknown'
    });
  }
}