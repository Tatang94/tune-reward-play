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
  getAdSettings(): Promise<any>;
  saveAdSettings(settings: any): Promise<void>;
  
  // Featured songs operations
  getFeaturedSongs(): Promise<FeaturedSong[]>;
  addFeaturedSong(song: InsertFeaturedSong): Promise<FeaturedSong>;
  removeFeaturedSong(id: number): Promise<void>;
  updateFeaturedSongOrder(id: number, order: number): Promise<void>;
  toggleFeaturedSongStatus(id: number, isActive: boolean): Promise<void>;
}

// Import storages
import { MemoryStorage } from "./memory-storage";
import { SupabaseStorage } from "./supabase-storage";

// Initialize storage based on environment
const createStorage = (): IStorage => {
  try {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_ANON_KEY?.trim();
    
    if (url && key && url.length > 10 && key.length > 10) {
      console.log("Attempting to use Supabase storage");
      const supabaseStorage = new SupabaseStorage();
      return supabaseStorage;
    } else {
      console.log("Using memory storage (Supabase credentials not available)");
      return new MemoryStorage();
    }
  } catch (error) {
    console.log("Fallback to memory storage due to Supabase error:", error.message);
    return new MemoryStorage();
  }
};

export const storage = createStorage();