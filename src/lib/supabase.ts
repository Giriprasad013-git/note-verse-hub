
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
const url = supabaseUrl || 'https://your-project-url.supabase.co';
const anonKey = supabaseAnonKey || 'your-anon-key';

export const supabase = createClient<Database>(url, anonKey);
