import { eq, desc } from "drizzle-orm";
import { db } from "./db-vercel";
import { admins, adminSessions, withdrawRequests, featuredSongs } from "@shared/schema";
import type { 
  Admin, 
  InsertAdmin, 
  WithdrawRequest, 
  InsertWithdrawRequest,
  FeaturedSong,
  InsertFeaturedSong 
} from "@shared/schema";
import crypto from "crypto";

export class VercelStorage {
  // Admin management
  async getAdminByUsername(username: string): Promise<Admin | null> {
    try {
      console.log("Looking for admin with username:", username);
      const result = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
      console.log("Admin query result:", result.length > 0 ? "Found" : "Not found");
      return result[0] || null;
    } catch (error) {
      console.error("Error getting admin by username:", error);
      return null;
    }
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    try {
      console.log("Creating admin with username:", adminData.username);
      const result = await db.insert(admins).values(adminData).returning();
      console.log("Admin created successfully with ID:", result[0]?.id);
      return result[0];
    } catch (error) {
      console.error("Error creating admin:", error);
      throw error;
    }
  }

  async createAdminSession(adminId: number): Promise<string> {
    try {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(adminSessions).values({
        adminId,
        token,
        expiresAt,
      });

      return token;
    } catch (error) {
      console.error("Error creating admin session:", error);
      throw error;
    }
  }

  async validateAdminSession(token: string): Promise<Admin | null> {
    try {
      const result = await db
        .select({
          admin: admins,
          session: adminSessions,
        })
        .from(adminSessions)
        .innerJoin(admins, eq(adminSessions.adminId, admins.id))
        .where(eq(adminSessions.token, token))
        .limit(1);

      if (!result[0]) return null;

      const { admin, session } = result[0];
      
      // Check if session is expired
      if (session.expiresAt < new Date()) {
        await this.deleteAdminSession(token);
        return null;
      }

      return admin;
    } catch (error) {
      console.error("Error validating admin session:", error);
      return null;
    }
  }

  async deleteAdminSession(token: string): Promise<void> {
    try {
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
    } catch (error) {
      console.error("Error deleting admin session:", error);
    }
  }

  // Withdraw requests management
  async getWithdrawRequests(): Promise<WithdrawRequest[]> {
    try {
      return await db.select().from(withdrawRequests).orderBy(desc(withdrawRequests.createdAt));
    } catch (error) {
      console.error("Error getting withdraw requests:", error);
      return [];
    }
  }

  async updateWithdrawRequestStatus(id: number, status: string): Promise<void> {
    try {
      await db
        .update(withdrawRequests)
        .set({ 
          status, 
          processedAt: new Date() 
        })
        .where(eq(withdrawRequests.id, id));
    } catch (error) {
      console.error("Error updating withdraw request status:", error);
      throw error;
    }
  }

  async createWithdrawRequest(requestData: InsertWithdrawRequest): Promise<WithdrawRequest> {
    try {
      const result = await db.insert(withdrawRequests).values(requestData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating withdraw request:", error);
      throw error;
    }
  }

  // Featured songs management
  async getFeaturedSongs(): Promise<FeaturedSong[]> {
    try {
      return await db
        .select()
        .from(featuredSongs)
        .where(eq(featuredSongs.isActive, true))
        .orderBy(featuredSongs.displayOrder, featuredSongs.createdAt);
    } catch (error) {
      console.error("Error getting featured songs:", error);
      return [];
    }
  }

  async addFeaturedSong(songData: InsertFeaturedSong): Promise<FeaturedSong> {
    try {
      const result = await db.insert(featuredSongs).values(songData).returning();
      return result[0];
    } catch (error) {
      console.error("Error adding featured song:", error);
      throw error;
    }
  }

  async removeFeaturedSong(id: number): Promise<void> {
    try {
      await db.delete(featuredSongs).where(eq(featuredSongs.id, id));
    } catch (error) {
      console.error("Error removing featured song:", error);
      throw error;
    }
  }

  async updateFeaturedSongOrder(id: number, displayOrder: number): Promise<void> {
    try {
      await db
        .update(featuredSongs)
        .set({ displayOrder })
        .where(eq(featuredSongs.id, id));
    } catch (error) {
      console.error("Error updating featured song order:", error);
      throw error;
    }
  }

  async toggleFeaturedSongStatus(id: number, isActive: boolean): Promise<void> {
    try {
      await db
        .update(featuredSongs)
        .set({ isActive })
        .where(eq(featuredSongs.id, id));
    } catch (error) {
      console.error("Error toggling featured song status:", error);
      throw error;
    }
  }
}

export const vercelStorage = new VercelStorage();