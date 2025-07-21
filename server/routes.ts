import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin account if it doesn't exist
  await initializeDefaultAdmin();

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

  // Get featured songs (for admin management)
  app.get("/api/admin/featured-songs", async (req, res) => {
    try {
      const songs = await storage.getFeaturedSongs();
      res.json({ songs });
    } catch (error) {
      console.error("Get featured songs error:", error);
      res.status(500).json({ error: "Failed to get featured songs" });
    }
  });

  // Add featured song
  app.post("/api/admin/featured-songs", async (req, res) => {
    try {
      const { videoId, title, artist, thumbnail, duration } = req.body;
      
      if (!videoId || !title || !artist) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await storage.addFeaturedSong({
        videoId,
        title,
        artist,
        thumbnail: thumbnail || "",
        duration: duration || 180
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Add featured song error:", error);
      res.status(500).json({ error: "Failed to add featured song" });
    }
  });

  // Remove featured song
  app.delete("/api/admin/featured-songs/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      await storage.removeFeaturedSong(videoId);
      res.json({ success: true });
    } catch (error) {
      console.error("Remove featured song error:", error);
      res.status(500).json({ error: "Failed to remove featured song" });
    }
  });

  // Reorder featured songs
  app.patch("/api/admin/featured-songs/reorder", async (req, res) => {
    try {
      const { songIds } = req.body;
      
      if (!Array.isArray(songIds)) {
        return res.status(400).json({ error: "songIds must be an array" });
      }

      await storage.reorderFeaturedSongs(songIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Reorder songs error:", error);
      res.status(500).json({ error: "Failed to reorder songs" });
    }
  });

  // User routes
  app.post("/api/user/withdraw", async (req, res) => {
    try {
      const { amount, paymentMethod, paymentDetails } = req.body;
      
      if (!amount || !paymentMethod || !paymentDetails) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (amount < 10000) {
        return res.status(400).json({ error: "Minimum withdrawal amount is Rp 10,000" });
      }

      const request = await storage.createWithdrawRequest({
        userId: "1", // Default user
        amount,
        paymentMethod,
        paymentDetails,
        status: "pending"
      });

      res.json({ success: true, request });
    } catch (error) {
      console.error("Withdraw request error:", error);
      res.status(500).json({ error: "Failed to create withdraw request" });
    }
  });

  // YTMusic API routes - using featured songs data only
  app.get("/api/ytmusic/search", async (req, res) => {
    try {
      const { q: query, limit = "10" } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      // Search in featured songs only
      const featuredSongs = await storage.getFeaturedSongs();
      const searchTerm = query.toLowerCase();
      
      const filteredSongs = featuredSongs
        .filter(song => 
          song.title.toLowerCase().includes(searchTerm) ||
          song.artist.toLowerCase().includes(searchTerm)
        )
        .slice(0, parseInt(String(limit)))
        .map(song => ({
          id: song.videoId,
          title: song.title,
          artist: song.artist,
          thumbnail: song.thumbnail,
          duration: song.duration,
          audioUrl: `https://www.youtube.com/watch?v=${song.videoId}`
        }));
      
      res.json({ songs: filteredSongs });
      
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search songs" });
    }
  });

  app.get("/api/ytmusic/charts", async (req, res) => {
    try {
      // Get admin-configured featured songs only
      const featuredSongs = await storage.getFeaturedSongs();
      
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
        // Return empty chart if no featured songs
        res.json({ songs: [] });
      }
    } catch (error) {
      console.error("Charts error:", error);
      res.status(500).json({ error: "Failed to get charts" });
    }
  });

  app.get("/api/ytmusic/song/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      // Find song in featured songs
      const featuredSongs = await storage.getFeaturedSongs();
      const song = featuredSongs.find(s => s.videoId === videoId);
      
      if (song) {
        res.json({ 
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
        res.json({ 
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
    } catch (error) {
      console.error("Song details error:", error);
      res.status(500).json({ 
        error: "Failed to get song details", 
        details: error instanceof Error ? error.message : String(error)
      });
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