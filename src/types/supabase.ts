
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
          id: string
          created_at: string
          title: string
          description: string
          user_id: string
          last_edited_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          user_id: string
          last_edited_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          user_id?: string
          last_edited_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          created_at: string
          title: string
          notebook_id: string
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          notebook_id: string
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          notebook_id?: string
          order?: number
        }
      }
      pages: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          section_id: string
          type: string
          last_edited_at: string
          tags: string[] | null
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content?: string
          section_id: string
          type?: string
          last_edited_at?: string
          tags?: string[] | null
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          section_id?: string
          type?: string
          last_edited_at?: string
          tags?: string[] | null
          order?: number
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
