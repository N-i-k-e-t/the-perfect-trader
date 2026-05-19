/**
 * Generated from your Supabase schema.
 * Run: npm run db:types
 * (requires local Supabase: npm run db:start)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      trader_snapshots: {
        Row: {
          user_id: string;
          data: Json;
          version: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          data?: Json;
          version?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          data?: Json;
          version?: string;
          updated_at?: string;
        };
      };
    };
  };
}
