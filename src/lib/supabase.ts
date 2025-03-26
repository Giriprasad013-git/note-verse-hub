
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Get environment variables or use test values for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly set
if (!supabaseUrl) {
  console.error('VITE_SUPABASE_URL is not set in your environment variables');
}

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY is not set in your environment variables');
}

// Provide fallback values for development/testing only
// In production, these should come from actual environment variables
const url = supabaseUrl || 'https://placeholder-project.supabase.co';
const anonKey = supabaseAnonKey || 'placeholder-anon-key';

// Set a flag to track if we're using real Supabase or mock data
export const isUsingMockData = !supabaseUrl || !supabaseAnonKey;

try {
  // Create the Supabase client
  export const supabase = createClient<Database>(url, anonKey);
  
  if (isUsingMockData) {
    console.warn('Using mock Supabase client. Real database operations will fail.');
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  // Create a mock client that will gracefully fail
  export const supabase = {
    from: () => ({
      select: () => Promise.reject(new Error('Supabase client not initialized')),
      insert: () => Promise.reject(new Error('Supabase client not initialized')),
      update: () => Promise.reject(new Error('Supabase client not initialized')),
      delete: () => Promise.reject(new Error('Supabase client not initialized')),
      eq: () => ({
        order: () => Promise.reject(new Error('Supabase client not initialized')),
      }),
    }),
  } as any;
}
