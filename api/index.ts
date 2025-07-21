import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage } from "../server/storage-vercel";
import { initializeVercelDatabase } from "../server/db-vercel";
import bcrypt from "bcrypt";
import fetch from "node-fetch";


// Initialize Vercel database and default admin account
async function initializeVercelApp() {
  try {
    console.log("Initializing Vercel app...");
    
    // Initialize database tables
    await initializeVercelDatabase();
    console.log("Database tables initialized");
    
    // Create default admin account
    const existingAdmin = await vercelStorage.getAdminByUsername("admin");
    if (!existingAdmin) {
      console.log("Creating default admin account...");
      const hashedPassword = await bcrypt.hash("audio", 10);
      await vercelStorage.createAdmin({
        username: "admin",
        password: hashedPassword,
      });
      console.log("Default admin account created: admin/audio");
    } else {
      console.log("Admin account already exists");
    }
  } catch (error) {
    console.error("Failed to initialize Vercel app:", error);
    throw error;
  }
}

// No authentication required for admin routes in Vercel

// Music service placeholder



// Initialize on startup
initializeVercelApp().catch(console.error);

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
    // Route handling
    if (pathname === '/api/test' && method === 'GET') {
      await initializeVercelApp();
      const admin = await vercelStorage.getAdminByUsername("admin");
      return res.json({ 
        status: "OK", 
        database: "Connected",
        adminExists: !!admin,
        timestamp: new Date().toISOString()
      });
    }
    
    // Admin routes - no authentication required
    
    if (pathname === '/api/admin/withdrawals' && method === 'GET') {
      try {
        const requests = await vercelStorage.getWithdrawRequests();
        return res.json({ requests });
      } catch (error) {
        return res.status(500).json({ error: "Failed to get withdraw requests" });
      }
    }
    
    if (pathname.startsWith('/api/admin/withdrawals/') && method === 'PATCH') {
      try {
        const id = pathname.split('/').pop();
        const { status } = req.body;

        if (!id) {
          return res.status(400).json({ error: "Invalid withdrawal request ID" });
        }

        if (!["approved", "rejected"].includes(status)) {
          return res.status(400).json({ error: "Invalid status" });
        }

        await vercelStorage.updateWithdrawRequestStatus(parseInt(id), status);
        return res.json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: "Failed to update withdraw request" });
      }
    }
    
    // Featured songs endpoints
    if (pathname === '/api/admin/featured-songs' && method === 'GET') {
      try {
        const songs = await vercelStorage.getFeaturedSongs();
        return res.json({ songs });
      } catch (error) {
        return res.status(500).json({ error: "Failed to get featured songs" });
      }
    }
    
    if (pathname === '/api/admin/featured-songs' && method === 'POST') {
      try {
        const { videoId, title, artist, thumbnail, duration, displayOrder } = req.body;
        
        const song = await vercelStorage.addFeaturedSong({
          videoId,
          title,
          artist,
          thumbnail,
          duration: duration || 0,
          displayOrder: displayOrder || 0,
          isActive: true
        });
        
        return res.json({ song });
      } catch (error) {
        return res.status(500).json({ error: "Failed to add featured song" });
      }
    }
    
    // Additional featured songs management endpoints
    if (pathname.startsWith('/api/admin/featured-songs/') && method === 'DELETE') {
      try {
        const id = pathname.split('/').pop();
        if (!id) {
          return res.status(400).json({ error: "Invalid song ID" });
        }
        await vercelStorage.removeFeaturedSong(parseInt(id));
        return res.json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: "Failed to remove featured song" });
      }
    }
    
    if (pathname.startsWith('/api/admin/featured-songs/') && !pathname.includes('/status') && method === 'PUT') {
      try {
        const id = pathname.split('/').pop();
        const { displayOrder } = req.body;
        
        if (!id) {
          return res.status(400).json({ error: "Invalid song ID" });
        }
        
        await vercelStorage.updateFeaturedSongOrder(parseInt(id), displayOrder);
        return res.json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: "Failed to update song order" });
      }
    }
    
    if (pathname.includes('/status') && method === 'PATCH') {
      try {
        const segments = pathname.split('/');
        const id = segments[segments.length - 2]; // Get ID before '/status'
        const { isActive } = req.body;
        
        await vercelStorage.toggleFeaturedSongStatus(parseInt(id), isActive);
        return res.json({ success: true });
      } catch (error) {
        return res.status(500).json({ error: "Failed to update song status" });
      }
    }
    
    // YouTube Data API v3 endpoints
    const YOUTUBE_API_KEY = 'AIzaSyCdgmEsPW59-U4bNKj-u-FSHHVaFfFO_VM';
    
    if (pathname === '/api/ytmusic/search' && method === 'GET') {
      const query = req.query?.q;
      const limit = req.query?.limit || "25";
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      try {
        // Search using YouTube Data API v3
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${limit}&q=${encodeURIComponent(query + ' music')}&type=video&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
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
      } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ error: "Failed to search songs" });
      }
    }
    
    if (pathname === '/api/ytmusic/charts' && method === 'GET') {
      try {
        // First try to get admin-configured featured songs
        const featuredSongs = await vercelStorage.getFeaturedSongs();
        
        if (featuredSongs && featuredSongs.length > 0) {
          const songs = featuredSongs.map(song => ({
            id: song.videoId,
            title: song.title,
            artist: song.artist,
            thumbnail: song.thumbnail,
            duration: song.duration,
            audioUrl: `https://www.youtube.com/watch?v=${song.videoId}`
          }));
          
          return res.json({ songs });
        } else {
          // Fallback to popular music from YouTube
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=lagu+indonesia+terpopuler+2025&type=video&order=relevance&key=${YOUTUBE_API_KEY}`;
          
          const response = await fetch(searchUrl);
          const data = await response.json();
          
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
      } catch (error) {
        console.error("Charts error:", error);
        return res.status(500).json({ error: "Failed to get charts" });
      }
    }
    
    if (pathname.startsWith('/api/ytmusic/song/') && method === 'GET') {
      const videoId = pathname.split('/').pop();
      if (!videoId) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      
      try {
        // First check in featured songs
        const featuredSongs = await vercelStorage.getFeaturedSongs();
        const featuredSong = featuredSongs.find(s => s.videoId === videoId);
        
        if (featuredSong) {
          return res.json({ 
            song: {
              id: featuredSong.videoId,
              title: featuredSong.title,
              artist: featuredSong.artist,
              duration: featuredSong.duration,
              thumbnail: featuredSong.thumbnail,
              audioUrl: `https://www.youtube.com/watch?v=${featuredSong.videoId}`
            }
          });
        }
        
        // Get from YouTube Data API
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        
        const response = await fetch(videoUrl);
        const data = await response.json();
        
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
        
        const item = data.items[0];
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
        
      } catch (error) {
        console.error("Song details error:", error);
        return res.status(500).json({ 
          error: "Failed to get song details", 
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }
    

    
    // Default 404
    return res.status(404).json({ error: "Endpoint not found" });
    
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}