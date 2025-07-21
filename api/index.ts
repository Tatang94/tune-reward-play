import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Request, Response, NextFunction } from "express";
import { vercelStorage } from "../server/storage-vercel";
import { initializeVercelDatabase } from "../server/db-vercel";
import bcrypt from "bcrypt";
import { spawn } from "child_process";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

// Admin authentication middleware
const requireAdminAuth = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: "Token required" });
  }

  const admin = await vercelStorage.validateAdminSession(token);
  if (!admin) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.admin = admin;
  next();
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

// API Routes
app.post("/api/admin/login", async (req, res) => {
  try {
    // Ensure database is initialized before login attempt
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
    
    res.json({ 
      token, 
      admin: { id: admin.id, username: admin.username } 
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

app.post("/api/admin/logout", requireAdminAuth, async (req: any, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await vercelStorage.deleteAdminSession(token);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Admin logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

app.get("/api/admin/profile", requireAdminAuth, async (req: any, res) => {
  res.json({ admin: { id: req.admin.id, username: req.admin.username } });
});

app.get("/api/admin/withdrawals", requireAdminAuth, async (req, res) => {
  try {
    const requests = await vercelStorage.getWithdrawRequests();
    res.json({ requests });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    res.status(500).json({ error: "Failed to get withdraw requests" });
  }
});

app.patch("/api/admin/withdrawals/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await vercelStorage.updateWithdrawRequestStatus(parseInt(id), status);
    res.json({ success: true });
  } catch (error) {
    console.error("Update withdrawal error:", error);
    res.status(500).json({ error: "Failed to update withdraw request" });
  }
});

// Featured songs management
app.get("/api/admin/featured-songs", requireAdminAuth, async (req, res) => {
  try {
    const songs = await vercelStorage.getFeaturedSongs();
    res.json({ songs });
  } catch (error) {
    console.error("Get featured songs error:", error);
    res.status(500).json({ error: "Failed to get featured songs" });
  }
});

app.post("/api/admin/featured-songs", requireAdminAuth, async (req, res) => {
  try {
    const { videoId, title, artist, thumbnail, duration, displayOrder } = req.body;

    if (!videoId || !title || !artist) {
      return res.status(400).json({ error: "VideoId, title, and artist are required" });
    }

    const song = await vercelStorage.addFeaturedSong({
      videoId,
      title,
      artist,
      thumbnail: thumbnail || "",
      duration: duration || 0,
      displayOrder: displayOrder || 0,
      isActive: true,
    });

    res.json({ song });
  } catch (error) {
    console.error("Add featured song error:", error);
    res.status(500).json({ error: "Failed to add featured song" });
  }
});

app.delete("/api/admin/featured-songs/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await vercelStorage.removeFeaturedSong(parseInt(id));
    res.json({ success: true });
  } catch (error) {
    console.error("Remove featured song error:", error);
    res.status(500).json({ error: "Failed to remove featured song" });
  }
});

app.patch("/api/admin/featured-songs/:id/order", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;

    if (displayOrder === undefined) {
      return res.status(400).json({ error: "Display order is required" });
    }

    await vercelStorage.updateFeaturedSongOrder(parseInt(id), displayOrder);
    res.json({ success: true });
  } catch (error) {
    console.error("Update song order error:", error);
    res.status(500).json({ error: "Failed to update song order" });
  }
});

app.patch("/api/admin/featured-songs/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: "Active status is required" });
    }

    await vercelStorage.toggleFeaturedSongStatus(parseInt(id), isActive);
    res.json({ success: true });
  } catch (error) {
    console.error("Update song status error:", error);
    res.status(500).json({ error: "Failed to update song status" });
  }
});

// YouTube Music API routes
app.get("/api/ytmusic/search", async (req, res) => {
  try {
    const { q: query, limit = "50" } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Query parameter required" });
    }
    
    const result = await callPythonService("search", query, String(limit));
    res.json(result);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search songs" });
  }
});

app.get("/api/ytmusic/charts", async (req, res) => {
  try {
    // First try to get admin-configured featured songs
    const featuredSongs = await vercelStorage.getFeaturedSongs();
    
    if (featuredSongs && featuredSongs.length > 0) {
      // Convert featured songs to the expected format
      const songs = featuredSongs.map(song => ({
        id: song.videoId,
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration,
        audioUrl: `https://www.youtube.com/watch?v=${song.videoId}`
      }));
      
      res.json({ songs });
    } else {
      // Fallback to YouTube Music charts if no featured songs
      const { country = "ID" } = req.query;
      const result = await callPythonService("charts", String(country));
      res.json(result);
    }
  } catch (error) {
    console.error("Charts error:", error);
    res.status(500).json({ error: "Failed to get charts" });
  }
});

app.get("/api/ytmusic/song/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const result = await callPythonService("song", videoId);
    res.json(result);
  } catch (error) {
    console.error("Song details error:", error);
    res.status(500).json({ error: "Failed to get song details" });
  }
});

// Test endpoint for debugging
app.get("/api/test", async (req, res) => {
  try {
    await initializeVercelApp();
    
    // Check admin count
    const admin = await vercelStorage.getAdminByUsername("admin");
    
    res.json({ 
      status: "OK", 
      database: "Connected",
      adminExists: !!admin,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "ERROR", 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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
  
  return app(req, res);
}