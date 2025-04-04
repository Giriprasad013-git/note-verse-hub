
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notebooks: {
        Row: {
          id: number
          created_at: string
          title: string
          description: string
          user_id: string
          last_edited_at: string
        }
        Insert: {
          id?: number  // Make id optional for insert operations
          created_at?: string
          title: string
          description?: string
          user_id: string
          last_edited_at?: string
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          description?: string
          user_id?: string
          last_edited_at?: string
        }
      }
      sections: {
        Row: {
          id: number
          created_at: string
          title: string
          notebook_id: number
          order: number
          user_id: string  // Added user_id field
        }
        Insert: {
          id?: number  // Make id optional for insert operations
          created_at?: string
          title: string
          notebook_id: number
          order?: number
          user_id?: string  // Make user_id optional for insert (trigger will set it)
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          notebook_id?: number
          order?: number
          user_id?: string
        }
      }
      pages: {
        Row: {
          id: number
          created_at: string
          title: string
          content: string
          section_id: number
          type: string
          last_edited_at: string
          tags: string[] | null
          order: number
          user_id: string  // Added user_id field
        }
        Insert: {
          id?: number  // Make id optional for insert operations
          created_at?: string
          title: string
          content?: string
          section_id: number
          type?: string
          last_edited_at?: string
          tags?: string[] | null
          order?: number
          user_id?: string  // Make user_id optional for insert (trigger will set it)
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          content?: string
          section_id?: number
          type?: string
          last_edited_at?: string
          tags?: string[] | null
          order?: number
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
