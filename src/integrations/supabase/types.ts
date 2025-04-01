export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      notebooks: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          last_edited_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: number
          last_edited_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          last_edited_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string | null
          id: number
          last_edited_at: string | null
          order: number | null
          section_id: number
          tags: string[] | null
          title: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: never
          last_edited_at?: string | null
          order?: number | null
          section_id: number
          tags?: string[] | null
          title: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: never
          last_edited_at?: string | null
          order?: number | null
          section_id?: number
          tags?: string[] | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_section"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string | null
          id: number
          notebook_id: number
          order: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          notebook_id: number
          order?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: never
          notebook_id?: number
          order?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notebook"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      dblink: {
        Args: {
          "": string
        }
        Returns: Record<string, unknown>[]
      }
      dblink_cancel_query: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_close: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_connect: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_connect_u: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_current_query: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dblink_disconnect:
        | {
            Args: Record<PropertyKey, never>
            Returns: string
          }
        | {
            Args: {
              "": string
            }
            Returns: string
          }
      dblink_error_message: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_exec: {
        Args: {
          "": string
        }
        Returns: string
      }
      dblink_fdw_validator: {
        Args: {
          options: string[]
          catalog: unknown
        }
        Returns: undefined
      }
      dblink_get_connections: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      dblink_get_notify:
        | {
            Args: Record<PropertyKey, never>
            Returns: Record<string, unknown>[]
          }
        | {
            Args: {
              conname: string
            }
            Returns: Record<string, unknown>[]
          }
      dblink_get_pkey: {
        Args: {
          "": string
        }
        Returns: Database["public"]["CompositeTypes"]["dblink_pkey_results"][]
      }
      dblink_get_result: {
        Args: {
          "": string
        }
        Returns: Record<string, unknown>[]
      }
      dblink_is_busy: {
        Args: {
          "": string
        }
        Returns: number
      }
      execute_sql: {
        Args: {
          query: string
          params: string[]
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      dblink_pkey_results: {
        position: number | null
        colname: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
