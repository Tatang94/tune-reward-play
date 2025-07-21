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

// Admin authentication helper
const requireAdminAuth = async (req: VercelRequest): Promise<any> => {
  const authHeader = req.headers.authorization;
  const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  const cleanToken = token?.replace('Bearer ', '');
  
  if (!cleanToken) {
    throw new Error("Token required");
  }

  const admin = await vercelStorage.validateAdminSession(cleanToken);
  if (!admin) {
    throw new Error("Invalid or expired token");
  }

  return admin;
};

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
    
    if (pathname === '/api/admin/login' && method === 'POST') {
      await initializeVercelApp();
      
      const { username, password } = req.body;
      console.log("Login attempt for username:", username);

      if (!username || !password) {
        console.log("Missing username or password");
        return res.status(400).json({ error: "Username and password required" });
      }

      const admin = await vercelStorage.getAdminByUsername(username);
      console.log("Admin found:", admin ? "Yes" : "No");
      
      if (!admin) {
        console.log("Admin not found for username:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      console.log("Password valid:", isValidPassword);
      
      if (!isValidPassword) {
        console.log("Invalid password for username:", username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = await vercelStorage.createAdminSession(admin.id);
      console.log("Token created successfully");
      
      return res.json({ 
        token, 
        admin: { id: admin.id, username: admin.username } 
      });
    }
    
    if (pathname === '/api/admin/logout' && method === 'POST') {
      try {
        const admin = await requireAdminAuth(req);
        const authHeader = req.headers.authorization;
        const token = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        const cleanToken = token?.replace('Bearer ', '');
        
        if (cleanToken) {
          await vercelStorage.deleteAdminSession(cleanToken);
        }
        return res.json({ success: true });
      } catch (error) {
        return res.status(401).json({ error: error.message });
      }
    }
    
    if (pathname === '/api/admin/profile' && method === 'GET') {
      try {
        const admin = await requireAdminAuth(req);
        return res.json({ admin: { id: admin.id, username: admin.username } });
      } catch (error) {
        return res.status(401).json({ error: error.message });
      }
    }
    
    if (pathname === '/api/admin/withdrawals' && method === 'GET') {
      try {
        await requireAdminAuth(req);
        const requests = await vercelStorage.getWithdrawRequests();
        return res.json({ requests });
      } catch (error) {
        if (error.message.includes("Token") || error.message.includes("Invalid")) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to get withdraw requests" });
      }
    }
    
    if (pathname.startsWith('/api/admin/withdrawals/') && method === 'PATCH') {
      try {
        await requireAdminAuth(req);
        const id = pathname.split('/').pop();
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
          return res.status(400).json({ error: "Invalid status" });
        }

        await vercelStorage.updateWithdrawRequestStatus(parseInt(id), status);
        return res.json({ success: true });
      } catch (error) {
        if (error.message.includes("Token") || error.message.includes("Invalid")) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to update withdraw request" });
      }
    }
    
    // Featured songs endpoints
    if (pathname === '/api/admin/featured-songs' && method === 'GET') {
      try {
        await requireAdminAuth(req);
        const songs = await vercelStorage.getFeaturedSongs();
        return res.json({ songs });
      } catch (error) {
        if (error.message.includes("Token") || error.message.includes("Invalid")) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to get featured songs" });
      }
    }
    
    if (pathname === '/api/admin/featured-songs' && method === 'POST') {
      try {
        await requireAdminAuth(req);
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
        if (error.message.includes("Token") || error.message.includes("Invalid")) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to add featured song" });
      }
    }
    
    // Additional featured songs management endpoints
    if (pathname.startsWith('/api/admin/featured-songs/') && method === 'DELETE') {
      try {
        await requireAdminAuth(req);
        const id = pathname.split('/').pop();
        await vercelStorage.removeFeaturedSong(parseInt(id));
        return res.json({ success: true });
      } catch (error) {
        if (error.message.includes("Token") || error.message.includes("Invalid")) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to remove featured song" });
      }
    }
    
    if (pathname.startsWith('/api/admin/featured-songs/') && !pathname.includes('/status') && method === 'PUT') {
      try {
        await requireAdminAuth(req);
        const id = pathname.split('/').pop();
        const { displayOrder } = req.body;
        
        await vercelStorage.updateFeaturedSongOrder(parseInt(id), displayOrder);
        return res.json({ success: true });
      } catch (error) {
        if (error.message.includes("Token") || error.message.includes("Invalid")) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to update song order" });
      }
    }
    
    if (pathname.includes('/status') && method === 'PATCH') {
      try {
        await requireAdminAuth(req);
        const segments = pathname.split('/');
        const id = segments[segments.length - 2]; // Get ID before '/status'
        const { isActive } = req.body;
        
        await vercelStorage.updateFeaturedSongStatus(parseInt(id), isActive);
        return res.json({ success: true });
      } catch (error) {
        if (error.message.includes("Token") || error.message.includes("Invalid")) {
          return res.status(401).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to update song status" });
      }
    }
    
    // YouTube Music API endpoints
    if (pathname === '/api/ytmusic/search' && method === 'GET') {
      const query = req.query?.q;
      const limit = req.query?.limit || "50";
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      const result = await callPythonService("search", query, String(limit));
      return res.json(result);
    }
    
    if (pathname === '/api/ytmusic/charts' && method === 'GET') {
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
        const country = req.query?.country || "ID";
        const result = await callPythonService("charts", String(country));
        return res.json(result);
      }
    }
    
    if (pathname.startsWith('/api/ytmusic/song/') && method === 'GET') {
      const videoId = pathname.split('/').pop();
      const result = await callPythonService("song", videoId);
      return res.json(result);
    }
    
    // Default 404
    return res.status(404).json({ error: "Endpoint not found" });
    
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}