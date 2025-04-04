
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Set a flag to track if we're using real Supabase or mock data
export const isUsingMockData = false;

// Export the client
export const supabase = supabaseClient;

// Helper function to convert UUID string to Supabase UUID type
export const toUUID = (id: string) => id as unknown as Database['public']['Tables']['notebooks']['Row']['user_id'];

// Define a mock client type that matches the structure we need - for compatibility
export const mockSupabaseClient = {
  from: () => ({
    select: () => Promise.reject(new Error('Supabase client not initialized')),
    insert: () => Promise.reject(new Error('Supabase client not initialized')),
    update: () => Promise.reject(new Error('Supabase client not initialized')),
    delete: () => Promise.reject(new Error('Supabase client not initialized')),
    eq: () => ({
      order: () => Promise.reject(new Error('Supabase client not initialized')),
    }),
  }),
};
