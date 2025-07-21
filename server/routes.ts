import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import path from "path";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import ytdl from "ytdl-core";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin account if it doesn't exist
  await initializeDefaultAdmin();

  // No authentication middleware - direct access to admin features

  // Admin routes - no authentication required

  // Get withdraw requests
  app.get("/api/admin/withdrawals", async (req, res) => {
    try {
      const requests = await storage.getWithdrawRequests();
      res.json({ requests });
    } catch (error) {
      console.error("Get withdrawals error:", error);
      res.status(500).json({ error: "Failed to get withdraw requests" });
    }
  });

  // Update withdraw request status
  app.patch("/api/admin/withdrawals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await storage.updateWithdrawRequestStatus(parseInt(id), status);
      res.json({ success: true });
    } catch (error) {
      console.error("Update withdrawal error:", error);
      res.status(500).json({ error: "Failed to update withdraw request" });
    }
  });

  // Featured songs management
  app.get("/api/admin/featured-songs", async (req, res) => {
    try {
      const songs = await storage.getFeaturedSongs();
      res.json({ songs });
    } catch (error) {
      console.error("Get featured songs error:", error);
      res.status(500).json({ error: "Failed to get featured songs" });
    }
  });

  app.post("/api/admin/featured-songs", async (req, res) => {
    try {
      const { videoId, title, artist, thumbnail, duration, displayOrder } = req.body;

      if (!videoId || !title || !artist) {
        return res.status(400).json({ error: "VideoId, title, and artist are required" });
      }

      const song = await storage.addFeaturedSong({
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

  app.delete("/api/admin/featured-songs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.removeFeaturedSong(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Remove featured song error:", error);
      res.status(500).json({ error: "Failed to remove featured song" });
    }
  });

  app.patch("/api/admin/featured-songs/:id/order", async (req, res) => {
    try {
      const { id } = req.params;
      const { displayOrder } = req.body;

      if (displayOrder === undefined) {
        return res.status(400).json({ error: "Display order is required" });
      }

      await storage.updateFeaturedSongOrder(parseInt(id), displayOrder);
      res.json({ success: true });
    } catch (error) {
      console.error("Update song order error:", error);
      res.status(500).json({ error: "Failed to update song order" });
    }
  });

  app.patch("/api/admin/featured-songs/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({ error: "Active status is required" });
      }

      await storage.toggleFeaturedSongStatus(parseInt(id), isActive);
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
      const featuredSongs = await storage.getFeaturedSongs();
      
      if (featuredSongs && featuredSongs.length > 0) {
        // Convert featured songs to the expected format
        const songs = featuredSongs.map(song => ({
          id: song.videoId,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          duration: song.duration,
          audioUrl: `https://music.youtube.com/watch?v=${song.videoId}`
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

  // Audio streaming endpoint using ytdl-core
  app.get("/api/audio/stream/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      // Validate YouTube video ID
      if (!ytdl.validateID(videoId)) {
        return res.status(400).json({ error: "Invalid video ID" });
      }

      // Get video info first
      const info = await ytdl.getInfo(videoId);
      const title = info.videoDetails.title;
      
      // Set response headers for audio streaming
      res.setHeader('Content-Type', 'audio/webm');
      res.setHeader('Content-Disposition', `inline; filename="${title}.webm"`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Stream audio with best quality
      const audioStream = ytdl(videoId, {
        filter: 'audioonly',
        quality: 'highestaudio'
      });
      
      // Pipe the audio stream to response
      audioStream.pipe(res);
      
      // Handle stream errors
      audioStream.on('error', (error) => {
        console.error('Audio stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to stream audio" });
        }
      });
      
    } catch (error) {
      console.error("Stream audio error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream audio" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize default admin account
async function initializeDefaultAdmin() {
  try {
    const existingAdmin = await storage.getAdminByUsername("admin");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("audio", 10);
      await storage.createAdmin({
        username: "admin",
        password: hashedPassword,
      });
      console.log("Default admin account created: admin/audio");
    }
  } catch (error) {
    console.error("Failed to initialize default admin:", error);
  }
}

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
