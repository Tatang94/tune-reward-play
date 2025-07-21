import { 
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
import { IStorage } from "./storage";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";

export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private admins: Admin[] = [];
  private adminSessions: { token: string; adminId: number; expiresAt: Date }[] = [];
  private withdrawRequests: WithdrawRequest[] = [];
  private adminSettings: AdminSettings[] = [];
  private featuredSongs: FeaturedSong[] = [];
  private nextUserId = 1;
  private nextAdminId = 1;
  private nextWithdrawId = 1;
  private nextSettingId = 1;
  private nextFeaturedSongId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default admin user
    const hashedPassword = await bcrypt.hash("audio", 10);
    this.admins.push({
      id: this.nextAdminId++,
      username: "admin",
      password: hashedPassword,
      createdAt: new Date(),
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      ...insertUser,
    };
    this.users.push(user);
    return user;
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return this.admins.find(admin => admin.username === username);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const admin: Admin = {
      id: this.nextAdminId++,
      ...insertAdmin,
      createdAt: new Date(),
    };
    this.admins.push(admin);
    return admin;
  }

  async createAdminSession(adminId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    this.adminSessions.push({
      adminId,
      token,
      expiresAt,
    });

    return token;
  }

  async validateAdminSession(token: string): Promise<Admin | undefined> {
    const session = this.adminSessions.find(s => 
      s.token === token && s.expiresAt > new Date()
    );
    
    if (!session) return undefined;
    
    return this.admins.find(admin => admin.id === session.adminId);
  }

  async deleteAdminSession(token: string): Promise<void> {
    const index = this.adminSessions.findIndex(s => s.token === token);
    if (index !== -1) {
      this.adminSessions.splice(index, 1);
    }
  }

  // Withdraw request operations
  async getWithdrawRequests(): Promise<WithdrawRequest[]> {
    return [...this.withdrawRequests].sort((a, b) => 
      a.createdAt!.getTime() - b.createdAt!.getTime()
    );
  }

  async createWithdrawRequest(request: InsertWithdrawRequest): Promise<WithdrawRequest> {
    const withdrawRequest: WithdrawRequest = {
      id: this.nextWithdrawId++,
      ...request,
      status: request.status || "pending",
      createdAt: new Date(),
      processedAt: null,
    };
    this.withdrawRequests.push(withdrawRequest);
    return withdrawRequest;
  }

  async updateWithdrawRequestStatus(id: number, status: string): Promise<void> {
    const request = this.withdrawRequests.find(r => r.id === id);
    if (request) {
      request.status = status;
      request.processedAt = new Date();
    }
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<AdminSettings | undefined> {
    return this.adminSettings.find(setting => setting.settingKey === key);
  }

  async setAdminSetting(key: string, value: string): Promise<void> {
    const existing = this.adminSettings.find(setting => setting.settingKey === key);
    if (existing) {
      existing.settingValue = value;
      existing.updatedAt = new Date();
    } else {
      const setting: AdminSettings = {
        id: this.nextSettingId++,
        settingKey: key,
        settingValue: value,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.adminSettings.push(setting);
    }
  }

  // Featured songs operations
  async getFeaturedSongs(): Promise<FeaturedSong[]> {
    return this.featuredSongs
      .filter(song => song.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }

  async addFeaturedSong(song: InsertFeaturedSong): Promise<FeaturedSong> {
    const featuredSong: FeaturedSong = {
      id: this.nextFeaturedSongId++,
      ...song,
      thumbnail: song.thumbnail || null,
      duration: song.duration || null,
      isActive: song.isActive !== undefined ? song.isActive : true,
      displayOrder: song.displayOrder || null,
      createdAt: new Date(),
    };
    this.featuredSongs.push(featuredSong);
    return featuredSong;
  }

  async removeFeaturedSong(id: number): Promise<void> {
    const index = this.featuredSongs.findIndex(song => song.id === id);
    if (index !== -1) {
      this.featuredSongs.splice(index, 1);
    }
  }

  async updateFeaturedSongOrder(id: number, order: number): Promise<void> {
    const song = this.featuredSongs.find(s => s.id === id);
    if (song) {
      song.displayOrder = order;
    }
  }

  async toggleFeaturedSongStatus(id: number, isActive: boolean): Promise<void> {
    const song = this.featuredSongs.find(s => s.id === id);
    if (song) {
      song.isActive = isActive;
    }
  }
}