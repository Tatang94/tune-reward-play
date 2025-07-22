import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage } from "../server/storage-vercel";
import { initializeVercelDatabase } from "../server/db-vercel";
import bcrypt from "bcrypt";

const YOUTUBE_API_KEY = 'AIzaSyCdgmEsPW59-U4bNKj-u-FSHHVaFfFO_VM';

// Track initialization state
let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Initialize Vercel database once
async function ensureInitialized() {
  if (isInitialized) return;
  
  if (!initPromise) {
    initPromise = initializeVercelApp().then(() => {
      isInitialized = true;
      initPromise = null;
    }).catch((error) => {
      initPromise = null;
      console.error("Failed to initialize:", error);
      // Don't throw here, allow API to continue with limited functionality
    });
  }
  
  return initPromise;
}

async function initializeVercelApp() {
  try {
    console.log("Initializing Vercel app...");
    
    // Initialize database tables
    await initializeVercelDatabase();
    console.log("Database tables initialized");
    
    // Create default admin account if it doesn't exist
    try {
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
    } catch (adminError) {
      console.log("Admin check failed, continuing without admin setup:", adminError);
    }
  } catch (error) {
    console.error("Failed to initialize Vercel app:", error);
    throw error;
  }
}

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
    
    // Initialize database for endpoints that need it
    if (!pathname.includes('/test') && !pathname.includes('/ytmusic/')) {
      await ensureInitialized();
    }

    // Featured songs management
    if (pathname === '/api/admin/featured-songs' && method === 'GET') {
      const songs = await vercelStorage.getFeaturedSongs();
      return res.json({ songs });
    }
    
    if (pathname === '/api/admin/featured-songs' && method === 'POST') {
      const { videoId, title, artist, thumbnail, duration } = req.body;
      
      if (!videoId || !title || !artist) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await vercelStorage.addFeaturedSong({
        videoId,
        title,
        artist,
        thumbnail: thumbnail || "",
        duration: duration || 180,
        displayOrder: 0,
        isActive: true
      });

      return res.json({ success: true });
    }
    
    if (pathname.startsWith('/api/admin/featured-songs/') && method === 'DELETE') {
      const id = pathname.split('/').pop();
      if (!id) {
        return res.status(400).json({ error: "Invalid song ID" });
      }
      await vercelStorage.removeFeaturedSong(parseInt(id));
      return res.json({ success: true });
    }
    
    if (pathname.includes('/toggle') && method === 'PATCH') {
      const segments = pathname.split('/');
      const id = segments[segments.length - 2];
      const { isActive } = req.body;
      
      await vercelStorage.toggleFeaturedSongStatus(parseInt(id), isActive);
      return res.json({ success: true });
    }
    
    // Charts endpoint - use admin featured songs or fallback
    if (pathname === '/api/ytmusic/charts' && method === 'GET') {
      try {
        await ensureInitialized();
        
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
        }
      } catch (dbError) {
        console.error('Database error for charts, using fallback:', dbError);
      }
      
      // Fallback to popular Indonesian music from YouTube
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

    // Admin withdrawals
    if (pathname === '/api/admin/withdrawals' && method === 'GET') {
      const requests = await vercelStorage.getWithdrawRequests();
      return res.json({ requests });
    }
    
    if (pathname.startsWith('/api/admin/withdrawals/') && method === 'PATCH') {
      const id = pathname.split('/').pop();
      const { status } = req.body;

      if (!id || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid request" });
      }

      await vercelStorage.updateWithdrawRequestStatus(parseInt(id), status);
      return res.json({ success: true });
    }

    // User withdraw request endpoint
    if (pathname === '/api/user/withdraw' && method === 'POST') {
      const { amount, paymentMethod, paymentDetails } = req.body;
      
      if (!amount || !paymentMethod || !paymentDetails) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (amount < 10000) {
        return res.status(400).json({ error: "Minimum withdrawal amount is Rp 10,000" });
      }

      const request = await vercelStorage.createWithdrawRequest({
        userId: "1", // Default user for Vercel
        amount,
        walletAddress: `${paymentMethod}: ${paymentDetails}`,
        status: "pending"
      });

      return res.json({ success: true, request });
    }

    // Ad settings endpoints
    if (pathname === '/api/admin/ad-settings' && method === 'GET') {
      const settings = await vercelStorage.getAdSettings();
      return res.json({ settings });
    }

    if (pathname === '/api/admin/ad-settings' && method === 'POST') {
      const { headerScript, footerScript, bannerScript, popupScript, isEnabled } = req.body;
      
      await vercelStorage.saveAdSettings({
        headerScript: headerScript || '',
        footerScript: footerScript || '',
        bannerScript: bannerScript || '',
        popupScript: popupScript || '',
        isEnabled: isEnabled || false
      });

      return res.json({ success: true });
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