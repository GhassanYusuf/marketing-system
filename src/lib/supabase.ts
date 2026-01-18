// Supabase integration for settings persistence
// This is a suggestion for future implementation

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (you would need to add your project URL and anon key)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Settings interface for Supabase
export interface SystemSettings {
  id: string;
  default_country: string;
  default_currency: string;
  updated_at: string;
  updated_by: string;
}

// Settings functions for Supabase integration
export const getSystemSettings = async (): Promise<SystemSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

export const updateSystemSettings = async (
  country: string,
  currency: string,
  userId: string
): Promise<SystemSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        id: 'default_settings', // Single row for system-wide settings
        default_country: country,
        default_currency: currency,
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating settings:', error);
    return null;
  }
};

// Migration suggestion: SQL to create the settings table in Supabase
/*
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  default_country TEXT NOT NULL DEFAULT 'United States',
  default_currency TEXT NOT NULL DEFAULT 'USD',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to read/write settings
CREATE POLICY "Admin can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
*/
