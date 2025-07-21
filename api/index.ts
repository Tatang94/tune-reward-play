import type { VercelRequest, VercelResponse } from '@vercel/node';
import { vercelStorage } from "../server/storage-vercel";
import { initializeVercelDatabase } from "../server/db-vercel";
import bcrypt from "bcrypt";
import { spawn } from "child_process";
import path from "path";


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

// Helper function to call Python YTMusic service
function callPythonService(...args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), "server", "ytmusic_service.py");
    const python = spawn("python3", [pythonScript, ...args]);
    
    let stdout = "";
    let stderr = "";
    
    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    python.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          reject(new Error("Failed to parse Python service response"));
        }
      } else {
        reject(new Error(`Python service failed with code ${code}: ${stderr}`));
      }
    });
    
    python.on("error", (error) => {
      reject(error);
    });
  });
}



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
    
    // YouTube Music API endpoints - using featured songs only
    if (pathname === '/api/ytmusic/search' && method === 'GET') {
      const query = req.query?.q;
      const limit = parseInt(String(req.query?.limit || "10"));
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      // Search in featured songs only
      const featuredSongs = await vercelStorage.getFeaturedSongs();
      const searchTerm = query.toLowerCase();
      
      const filteredSongs = featuredSongs
        .filter(song => 
          song.title.toLowerCase().includes(searchTerm) ||
          song.artist.toLowerCase().includes(searchTerm)
        )
        .slice(0, limit)
        .map(song => ({
          id: song.videoId,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          duration: song.duration,
          audioUrl: `https://www.youtube.com/watch?v=${song.videoId}`
        }));
      
      return res.json({ songs: filteredSongs });
    }
    
    if (pathname === '/api/ytmusic/charts' && method === 'GET') {
      // Get admin-configured featured songs only
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
        return res.json({ songs: [] });
      }
    }
    
    if (pathname.startsWith('/api/ytmusic/song/') && method === 'GET') {
      const videoId = pathname.split('/').pop();
      if (!videoId) {
        return res.status(400).json({ error: "Invalid video ID" });
      }
      
      // Find song in featured songs
      const featuredSongs = await vercelStorage.getFeaturedSongs();
      const song = featuredSongs.find(s => s.videoId === videoId);
      
      if (song) {
        return res.json({ 
          song: {
            id: song.videoId,
            title: song.title,
            artist: song.artist,
            duration: song.duration,
            thumbnail: song.thumbnail,
            audioUrl: `https://www.youtube.com/watch?v=${song.videoId}`
          }
        });
      } else {
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
    }
    

    
    // Default 404
    return res.status(404).json({ error: "Endpoint not found" });
    
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}