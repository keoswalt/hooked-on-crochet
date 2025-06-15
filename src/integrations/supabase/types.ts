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
      canvas_elements: {
        Row: {
          created_at: string
          element_type: string
          height: number | null
          id: string
          plan_id: string
          position_x: number
          position_y: number
          properties: Json | null
          rotation: number | null
          updated_at: string
          width: number | null
          z_index: number | null
        }
        Insert: {
          created_at?: string
          element_type: string
          height?: number | null
          id?: string
          plan_id: string
          position_x?: number
          position_y?: number
          properties?: Json | null
          rotation?: number | null
          updated_at?: string
          width?: number | null
          z_index?: number | null
        }
        Update: {
          created_at?: string
          element_type?: string
          height?: number | null
          id?: string
          plan_id?: string
          position_x?: number
          position_y?: number
          properties?: Json | null
          rotation?: number | null
          updated_at?: string
          width?: number | null
          z_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "canvas_elements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_images: {
        Row: {
          id: string
          image_url: string
          is_featured: boolean | null
          plan_id: string
          position: number
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          image_url: string
          is_featured?: boolean | null
          plan_id: string
          position?: number
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          image_url?: string
          is_featured?: boolean | null
          plan_id?: string
          position?: number
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_images_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_resources: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          plan_id: string
          resource_type: string | null
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          plan_id: string
          resource_type?: string | null
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          plan_id?: string
          resource_type?: string | null
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_resources_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_swatch_attachments: {
        Row: {
          attached_at: string | null
          id: string
          plan_id: string
          swatch_id: string
          user_id: string
        }
        Insert: {
          attached_at?: string | null
          id?: string
          plan_id: string
          swatch_id: string
          user_id: string
        }
        Update: {
          attached_at?: string | null
          id?: string
          plan_id?: string
          swatch_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_swatch_attachments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_swatch_attachments_swatch_id_fkey"
            columns: ["swatch_id"]
            isOneToOne: false
            referencedRelation: "swatches"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_yarn_attachments: {
        Row: {
          attached_at: string | null
          id: string
          plan_id: string
          user_id: string
          yarn_id: string
        }
        Insert: {
          attached_at?: string | null
          id?: string
          plan_id: string
          user_id: string
          yarn_id: string
        }
        Update: {
          attached_at?: string | null
          id?: string
          plan_id?: string
          user_id?: string
          yarn_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_yarn_attachments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_yarn_attachments_yarn_id_fkey"
            columns: ["yarn_id"]
            isOneToOne: false
            referencedRelation: "yarn_stash"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          canvas_data: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          canvas_data?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          canvas_data?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
            foreignKeyName: "fk_project_tags_tag_id"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      swatch_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          swatch_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          swatch_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          swatch_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swatch_images_swatch_id_fkey"
            columns: ["swatch_id"]
            isOneToOne: false
            referencedRelation: "swatches"
            referencedColumns: ["id"]
          },
        ]
      }
      swatches: {
        Row: {
          created_at: string
          description: string | null
          hook_size: string | null
          id: string
          notes: string | null
          rows_per_inch: number | null
          stitches_per_inch: number | null
          title: string
          updated_at: string
          user_id: string
          yarn_used: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          hook_size?: string | null
          id?: string
          notes?: string | null
          rows_per_inch?: number | null
          stitches_per_inch?: number | null
          title: string
          updated_at?: string
          user_id: string
          yarn_used?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          hook_size?: string | null
          id?: string
          notes?: string | null
          rows_per_inch?: number | null
          stitches_per_inch?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          yarn_used?: string | null
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
      yarn_stash: {
        Row: {
          brand: string | null
          color: string | null
          created_at: string
          id: string
          image_url: string | null
          material: string | null
          name: string
          notes: string | null
          remaining_yardage: number | null
          updated_at: string
          user_id: string
          weight: Database["public"]["Enums"]["yarn_weight"] | null
          yardage: number | null
        }
        Insert: {
          brand?: string | null
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          material?: string | null
          name: string
          notes?: string | null
          remaining_yardage?: number | null
          updated_at?: string
          user_id: string
          weight?: Database["public"]["Enums"]["yarn_weight"] | null
          yardage?: number | null
        }
        Update: {
          brand?: string | null
          color?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          material?: string | null
          name?: string
          notes?: string | null
          remaining_yardage?: number | null
          updated_at?: string
          user_id?: string
          weight?: Database["public"]["Enums"]["yarn_weight"] | null
          yardage?: number | null
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
