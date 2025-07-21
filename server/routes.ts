import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import fetch from "node-fetch";

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
      await storage.removeFeaturedSong(parseInt(videoId));
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

      // Note: reorderFeaturedSongs is not implemented in storage
      return res.json({ success: true, message: "Reorder not implemented yet" });
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
        walletAddress: `${paymentMethod}: ${paymentDetails}`,
        status: "pending"
      });

      res.json({ success: true, request });
    } catch (error) {
      console.error("Withdraw request error:", error);
      res.status(500).json({ error: "Failed to create withdraw request" });
    }
  });

  // YouTube Data API v3 routes
  const YOUTUBE_API_KEY = 'AIzaSyCdgmEsPW59-U4bNKj-u-FSHHVaFfFO_VM';
  
  app.get("/api/ytmusic/search", async (req, res) => {
    try {
      const { q: query, limit = "25" } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
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
        duration: 180, // Default duration
        audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      })) || [];
      
      res.json({ songs });
      
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
        
        res.json({ songs });
      }
    } catch (error) {
      console.error("Charts error:", error);
      res.status(500).json({ error: "Failed to get charts" });
    }
  });

  app.get("/api/ytmusic/song/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      
      // First check in featured songs
      const featuredSongs = await storage.getFeaturedSongs();
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
      res.json({ 
        song: {
          id: videoId,
          title: item.snippet.title,
          artist: item.snippet.channelTitle,
          duration: 180, // You can parse contentDetails.duration if needed
          thumbnail: item.snippet.thumbnails?.medium?.url || '',
          audioUrl: `https://www.youtube.com/watch?v=${videoId}`
        }
      });
      
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