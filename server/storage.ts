import { 
  users, 
  admins, 
  adminSessions, 
  withdrawRequests,
  adminSettings,
  featuredSongs,
  type User, 
  type InsertUser,
  type Admin,
  type InsertAdmin,
  type WithdrawRequest,
  type InsertWithdrawRequest,
  type AdminSettings,
  type InsertAdminSettings,
  type FeaturedSong,
  type InsertFeaturedSong
} from "@shared/schema";
import { randomBytes } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  createAdminSession(adminId: number): Promise<string>;
  validateAdminSession(token: string): Promise<Admin | undefined>;
  deleteAdminSession(token: string): Promise<void>;
  
  // Withdraw request operations
  getWithdrawRequests(): Promise<WithdrawRequest[]>;
  createWithdrawRequest(request: InsertWithdrawRequest): Promise<WithdrawRequest>;
  updateWithdrawRequestStatus(id: number, status: string): Promise<void>;
  
  // Admin settings operations
  getAdminSetting(key: string): Promise<AdminSettings | undefined>;
  setAdminSetting(key: string, value: string): Promise<void>;
  
  // Featured songs operations
  getFeaturedSongs(): Promise<FeaturedSong[]>;
  addFeaturedSong(song: InsertFeaturedSong): Promise<FeaturedSong>;
  removeFeaturedSong(id: number): Promise<void>;
  updateFeaturedSongOrder(id: number, order: number): Promise<void>;
  toggleFeaturedSongStatus(id: number, isActive: boolean): Promise<void>;
}

import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async createAdminSession(adminId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(adminSessions).values({
      adminId,
      token,
      expiresAt,
    });

    return token;
  }

  async validateAdminSession(token: string): Promise<Admin | undefined> {
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token));
    
    if (!session || session.expiresAt < new Date()) return undefined;
    
    const [admin] = await db.select().from(admins).where(eq(admins.id, session.adminId!));
    return admin || undefined;
  }

  async deleteAdminSession(token: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }

  // Withdraw request operations
  async getWithdrawRequests(): Promise<WithdrawRequest[]> {
    return await db.select().from(withdrawRequests).orderBy(desc(withdrawRequests.createdAt));
  }

  async createWithdrawRequest(request: InsertWithdrawRequest): Promise<WithdrawRequest> {
    const [withdrawRequest] = await db
      .insert(withdrawRequests)
      .values(request)
      .returning();
    return withdrawRequest;
  }

  async updateWithdrawRequestStatus(id: number, status: string): Promise<void> {
    await db
      .update(withdrawRequests)
      .set({ 
        status,
        processedAt: new Date()
      })
      .where(eq(withdrawRequests.id, id));
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<AdminSettings | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.settingKey, key));
    return setting || undefined;
  }

  async setAdminSetting(key: string, value: string): Promise<void> {
    const existing = await this.getAdminSetting(key);
    
    if (existing) {
      await db
        .update(adminSettings)
        .set({ 
          settingValue: value,
          updatedAt: new Date()
        })
        .where(eq(adminSettings.settingKey, key));
    } else {
      await db.insert(adminSettings).values({
        settingKey: key,
        settingValue: value,
      });
    }
  }

  // Featured songs operations
  async getFeaturedSongs(): Promise<FeaturedSong[]> {
    return await db
      .select()
      .from(featuredSongs)
      .where(eq(featuredSongs.isActive, true))
      .orderBy(featuredSongs.displayOrder);
  }

  async addFeaturedSong(song: InsertFeaturedSong): Promise<FeaturedSong> {
    const [newSong] = await db
      .insert(featuredSongs)
      .values(song)
      .returning();
    return newSong;
  }

  async removeFeaturedSong(id: number): Promise<void> {
    await db.delete(featuredSongs).where(eq(featuredSongs.id, id));
  }

  async updateFeaturedSongOrder(id: number, order: number): Promise<void> {
    await db
      .update(featuredSongs)
      .set({ displayOrder: order })
      .where(eq(featuredSongs.id, id));
  }

  async toggleFeaturedSongStatus(id: number, isActive: boolean): Promise<void> {
    await db
      .update(featuredSongs)
      .set({ isActive })
      .where(eq(featuredSongs.id, id));
  }
}

export const storage = new DatabaseStorage();
