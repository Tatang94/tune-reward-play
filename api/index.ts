import type { VercelRequest, VercelResponse } from '@vercel/node';

const YOUTUBE_API_KEY = 'AIzaSyCdgmEsPW59-U4bNKj-u-FSHHVaFfFO_VM';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { url = '', method = 'GET' } = req;
  const pathname = new URL(url, 'http://localhost').pathname;
  
  try {
    // Test endpoint
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
    
    // Featured songs - simple response
    if (pathname === '/api/admin/featured-songs' && method === 'GET') {
      return res.json({ songs: [] });
    }
    
    if (pathname === '/api/admin/featured-songs' && method === 'POST') {
      return res.json({ success: true, message: "Added to queue (basic mode)" });
    }
    
    if (pathname.startsWith('/api/admin/featured-songs/') && method === 'DELETE') {
      return res.json({ success: true, message: "Removed (basic mode)" });
    }
    
    if (pathname.includes('/toggle') && method === 'PATCH') {
      return res.json({ success: true, message: "Toggled (basic mode)" });
    }
    
    // Charts endpoint - fallback to YouTube search
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

    // Song details
    if (pathname.startsWith('/api/ytmusic/song/') && method === 'GET') {
      const videoId = pathname.split('/').pop();
      if (!videoId) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      
      return res.json({ 
        song: {
          id: videoId,
          title: "Song Title",
          artist: "Artist Name",
          duration: 180,
          thumbnail: "",
          audioUrl: `https://www.youtube.com/watch?v=${videoId}`
        }
      });
    }

    // Admin withdrawals - basic responses
    if (pathname === '/api/admin/withdrawals' && method === 'GET') {
      return res.json({ requests: [] });
    }
    
    if (pathname.startsWith('/api/admin/withdrawals/') && method === 'PATCH') {
      return res.json({ success: true, message: "Updated (basic mode)" });
    }

    // User withdraw
    if (pathname === '/api/user/withdraw' && method === 'POST') {
      return res.json({ success: true, message: "Submitted (basic mode)" });
    }

    // Ad settings
    if (pathname === '/api/admin/ad-settings' && method === 'GET') {
      return res.json({ 
        settings: {
          headerScript: '',
          footerScript: '',
          bannerScript: '',
          popupScript: '',
          isEnabled: false
        }
      });
    }

    if (pathname === '/api/admin/ad-settings' && method === 'POST') {
      return res.json({ success: true, message: "Saved (basic mode)" });
    }

    // 404 for other routes
    return res.status(404).json({ error: "Route not found", path: pathname, method });
    
  } catch (error) {
    console.error("API Handler Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error),
      path: pathname || 'unknown'
    });
  }
}