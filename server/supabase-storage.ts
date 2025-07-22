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
import { createClient } from '@supabase/supabase-js';

export class SupabaseStorage implements IStorage {
  private supabase: any;

  constructor() {
    try {
      const supabaseUrl = process.env.SUPABASE_URL?.trim();
      const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim();
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
      }
      
      // Clean URL if it has any extra characters
      const cleanUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;
      
      this.supabase = createClient(cleanUrl, supabaseKey);
      console.log('Supabase client initialized successfully');
      this.initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      throw error;
    }
  }

  private async initializeDatabase() {
    try {
      // Check if admin table exists and create default admin
      const { data: existingAdmin } = await this.supabase
        .from('admins')
        .select('id')
        .eq('username', 'admin')
        .single();

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("audio", 10);
        await this.supabase
          .from('admins')
          .insert({
            username: "admin",
            password: hashedPassword
          });
        console.log("Default admin account created: admin/audio");
      }
    } catch (error) {
      console.error("Failed to initialize Supabase database:", error);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const { data } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data } = await this.supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    return data || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data } = await this.supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    return data!;
  }

  // Admin operations
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const { data } = await this.supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();
    return data || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const { data } = await this.supabase
      .from('admins')
      .insert(insertAdmin)
      .select()
      .single();
    return data!;
  }

  async createAdminSession(adminId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        token: token,
        expires_at: expiresAt.toISOString()
      });

    return token;
  }

  async validateAdminSession(token: string): Promise<Admin | undefined> {
    const { data: session } = await this.supabase
      .from('admin_sessions')
      .select(`
        *,
        admins (*)
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    return session?.admins || undefined;
  }

  async deleteAdminSession(token: string): Promise<void> {
    await this.supabase
      .from('admin_sessions')
      .delete()
      .eq('token', token);
  }

  // Withdraw request operations
  async getWithdrawRequests(): Promise<WithdrawRequest[]> {
    const { data } = await this.supabase
      .from('withdraw_requests')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async createWithdrawRequest(request: InsertWithdrawRequest): Promise<WithdrawRequest> {
    const { data } = await this.supabase
      .from('withdraw_requests')
      .insert(request)
      .select()
      .single();
    return data!;
  }

  async updateWithdrawRequestStatus(id: number, status: string): Promise<void> {
    await this.supabase
      .from('withdraw_requests')
      .update({ 
        status: status,
        processed_at: new Date().toISOString()
      })
      .eq('id', id);
  }

  // Admin settings operations
  async getAdminSetting(key: string): Promise<AdminSettings | undefined> {
    const { data } = await this.supabase
      .from('admin_settings')
      .select('*')
      .eq('setting_key', key)
      .single();
    return data || undefined;
  }

  async setAdminSetting(key: string, value: string): Promise<void> {
    const { data: existing } = await this.supabase
      .from('admin_settings')
      .select('id')
      .eq('setting_key', key)
      .single();

    if (existing) {
      await this.supabase
        .from('admin_settings')
        .update({ 
          setting_value: value,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', key);
    } else {
      await this.supabase
        .from('admin_settings')
        .insert({
          setting_key: key,
          setting_value: value
        });
    }
  }

  async getAdSettings(): Promise<any> {
    const { data: settings } = await this.supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['headerScript', 'footerScript', 'bannerScript', 'popupScript', 'adsEnabled']);

    const settingsMap = (settings || []).reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {});

    return {
      headerScript: settingsMap.headerScript || '',
      footerScript: settingsMap.footerScript || '',
      bannerScript: settingsMap.bannerScript || '',
      popupScript: settingsMap.popupScript || '',
      isEnabled: settingsMap.adsEnabled === 'true'
    };
  }

  async saveAdSettings(settings: any): Promise<void> {
    const updates = [
      { key: 'headerScript', value: settings.headerScript || '' },
      { key: 'footerScript', value: settings.footerScript || '' },
      { key: 'bannerScript', value: settings.bannerScript || '' },
      { key: 'popupScript', value: settings.popupScript || '' },
      { key: 'adsEnabled', value: settings.isEnabled ? 'true' : 'false' }
    ];

    for (const update of updates) {
      await this.setAdminSetting(update.key, update.value);
    }
  }

  // Featured songs operations
  async getFeaturedSongs(): Promise<FeaturedSong[]> {
    const { data } = await this.supabase
      .from('featured_songs')
      .select('*')
      .order('display_order', { ascending: true, nullsFirst: false });
    return data || [];
  }

  async addFeaturedSong(song: InsertFeaturedSong): Promise<FeaturedSong> {
    const { data } = await this.supabase
      .from('featured_songs')
      .insert({
        video_id: song.videoId,
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration,
        is_active: song.isActive !== undefined ? song.isActive : true,
        display_order: song.displayOrder
      })
      .select()
      .single();
    return data!;
  }

  async removeFeaturedSong(id: number): Promise<void> {
    await this.supabase
      .from('featured_songs')
      .delete()
      .eq('id', id);
  }

  async updateFeaturedSongOrder(id: number, order: number): Promise<void> {
    await this.supabase
      .from('featured_songs')
      .update({ display_order: order })
      .eq('id', id);
  }

  async toggleFeaturedSongStatus(id: number, isActive: boolean): Promise<void> {
    await this.supabase
      .from('featured_songs')
      .update({ is_active: isActive })
      .eq('id', id);
  }
}