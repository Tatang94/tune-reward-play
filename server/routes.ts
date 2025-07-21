import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import path from "path";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // YouTube Music API routes
  app.get("/api/ytmusic/search", async (req, res) => {
    try {
      const { q: query, limit = "10" } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "Query parameter required" });
      }
      
      const result = await callPythonService("search", query, limit);
      res.json(result);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Failed to search songs" });
    }
  });
  
  app.get("/api/ytmusic/charts", async (req, res) => {
    try {
      const { country = "ID" } = req.query;
      const result = await callPythonService("charts", country);
      res.json(result);
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

  const httpServer = createServer(app);
  return httpServer;
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
