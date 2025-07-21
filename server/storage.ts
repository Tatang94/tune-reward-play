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

// Database storage implementation removed temporarily
// Will be restored once PostgreSQL database is properly configured

import { MemoryStorage } from "./memory-storage";

// Use memory storage for now until database is properly set up
export const storage = new MemoryStorage();
