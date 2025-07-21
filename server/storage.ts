import { 
  users, 
  admins, 
  adminSessions, 
  withdrawRequests,
  type User, 
  type InsertUser,
  type Admin,
  type InsertAdmin,
  type WithdrawRequest,
  type InsertWithdrawRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt } from "drizzle-orm";
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
}

export class DatabaseStorage implements IStorage {
  // User operations
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
      .select({
        admin: admins,
      })
      .from(adminSessions)
      .innerJoin(admins, eq(adminSessions.adminId, admins.id))
      .where(
        and(
          eq(adminSessions.token, token),
          gt(adminSessions.expiresAt, new Date())
        )
      );

    return session?.admin;
  }

  async deleteAdminSession(token: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }

  // Withdraw request operations
  async getWithdrawRequests(): Promise<WithdrawRequest[]> {
    return db.select().from(withdrawRequests).orderBy(withdrawRequests.createdAt);
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
}

export const storage = new DatabaseStorage();
