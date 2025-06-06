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
      project_rows: {
        Row: {
          counter: number
          created_at: string
          id: string
          image_url: string | null
          instructions: string
          is_locked: boolean
          label: string | null
          make_mode_counter: number
          make_mode_status: string
          position: number
          project_id: string
          total_stitches: string
          type: string
          updated_at: string
        }
        Insert: {
          counter?: number
          created_at?: string
          id?: string
          image_url?: string | null
          instructions: string
          is_locked?: boolean
          label?: string | null
          make_mode_counter?: number
          make_mode_status?: string
          position: number
          project_id: string
          total_stitches?: string
          type?: string
          updated_at?: string
        }
        Update: {
          counter?: number
          created_at?: string
          id?: string
          image_url?: string | null
          instructions?: string
          is_locked?: boolean
          label?: string | null
          make_mode_counter?: number
          make_mode_status?: string
          position?: number
          project_id?: string
          total_stitches?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_rows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          created_at: string
          id: string
          project_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_tags_project_id"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_tags_tag_id"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          details: string | null
          featured_image_url: string | null
          hook_size: Database["public"]["Enums"]["hook_size"]
          id: string
          is_favorite: boolean
          last_mode: string | null
          name: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string
          user_id: string
          yarn_weight: Database["public"]["Enums"]["yarn_weight"]
        }
        Insert: {
          created_at?: string
          details?: string | null
          featured_image_url?: string | null
          hook_size: Database["public"]["Enums"]["hook_size"]
          id?: string
          is_favorite?: boolean
          last_mode?: string | null
          name: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
          user_id: string
          yarn_weight: Database["public"]["Enums"]["yarn_weight"]
        }
        Update: {
          created_at?: string
          details?: string | null
          featured_image_url?: string | null
          hook_size?: Database["public"]["Enums"]["hook_size"]
          id?: string
          is_favorite?: boolean
          last_mode?: string | null
          name?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string
          user_id?: string
          yarn_weight?: Database["public"]["Enums"]["yarn_weight"]
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      hook_size:
        | "1.5mm"
        | "1.75mm"
        | "2mm"
        | "2.2mm"
        | "3mm"
        | "3.5mm"
        | "4mm"
        | "4.5mm"
        | "5mm"
        | "5.5mm"
        | "6mm"
        | "6.5mm"
        | "9mm"
        | "10mm"
      project_status: "Writing" | "Ready" | "Making" | "Made"
      yarn_weight: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      hook_size: [
        "1.5mm",
        "1.75mm",
        "2mm",
        "2.2mm",
        "3mm",
        "3.5mm",
        "4mm",
        "4.5mm",
        "5mm",
        "5.5mm",
        "6mm",
        "6.5mm",
        "9mm",
        "10mm",
      ],
      project_status: ["Writing", "Ready", "Making", "Made"],
      yarn_weight: ["0", "1", "2", "3", "4", "5", "6", "7"],
    },
  },
} as const
