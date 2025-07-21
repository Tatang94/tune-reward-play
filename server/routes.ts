import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import path from "path";
import { storage } from "./storage";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin account if it doesn't exist
  await initializeDefaultAdmin();

  // Admin authentication middleware
  const requireAdminAuth = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "Token required" });
    }

    const admin = await storage.validateAdminSession(token);
    if (!admin) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.admin = admin;
    next();
  };

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = await storage.createAdminSession(admin.id);
      res.json({ 
        token, 
        admin: { id: admin.id, username: admin.username } 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", requireAdminAuth, async (req: any, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await storage.deleteAdminSession(token);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // Get admin profile
  app.get("/api/admin/profile", requireAdminAuth, async (req: any, res) => {
    res.json({ admin: { id: req.admin.id, username: req.admin.username } });
  });

  // Get withdraw requests (admin only)
  app.get("/api/admin/withdrawals", requireAdminAuth, async (req, res) => {
    try {
      const requests = await storage.getWithdrawRequests();
      res.json({ requests });
    } catch (error) {
      console.error("Get withdrawals error:", error);
      res.status(500).json({ error: "Failed to get withdraw requests" });
    }
  });

  // Update withdraw request status (admin only)
  app.patch("/api/admin/withdrawals/:id", requireAdminAuth, async (req, res) => {
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
