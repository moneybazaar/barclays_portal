export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      app_users: {
        Row: {
          address: string | null
          auth_source: string | null
          company: string | null
          created_at: string | null
          email: string
          external_user_id: string | null
          id: string
          kyc_reviewed_at: string | null
          kyc_reviewed_by: string | null
          kyc_status: string | null
          name: string | null
          password_hash: string | null
          phone: string | null
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          auth_source?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          external_user_id?: string | null
          id?: string
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: string | null
          name?: string | null
          password_hash?: string | null
          phone?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          auth_source?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          external_user_id?: string | null
          id?: string
          kyc_reviewed_at?: string | null
          kyc_reviewed_by?: string | null
          kyc_status?: string | null
          name?: string | null
          password_hash?: string | null
          phone?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          id: string
          invoice_url: string | null
          received_at: string | null
          reference_code: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          invoice_url?: string | null
          received_at?: string | null
          reference_code: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          invoice_url?: string | null
          received_at?: string | null
          reference_code?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          doc_type: string
          file_path: string | null
          file_url: string | null
          id: string
          title: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string
          file_path?: string | null
          file_url?: string | null
          id?: string
          title: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_path?: string | null
          file_url?: string | null
          id?: string
          title?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at: string
          currency: string | null
          current_price: number
          id: string
          institution: string | null
          maturity_date: string | null
          name: string
          principal: number | null
          purchase_price: number
          rate: number | null
          risk_level: string | null
          shares: number | null
          ticker: string | null
          units: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          currency?: string | null
          current_price: number
          id?: string
          institution?: string | null
          maturity_date?: string | null
          name: string
          principal?: number | null
          purchase_price: number
          rate?: number | null
          risk_level?: string | null
          shares?: number | null
          ticker?: string | null
          units?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["asset_type"]
          created_at?: string
          currency?: string | null
          current_price?: number
          id?: string
          institution?: string | null
          maturity_date?: string | null
          name?: string
          principal?: number | null
          purchase_price?: number
          rate?: number | null
          risk_level?: string | null
          shares?: number | null
          ticker?: string | null
          units?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      interest_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          interest_type: string
          investment_amount: number | null
          message: string | null
          metadata: Json | null
          name: string | null
          phone: string | null
          processed_at: string | null
          source_domain: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest_type?: string
          investment_amount?: number | null
          message?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          processed_at?: string | null
          source_domain?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest_type?: string
          investment_amount?: number | null
          message?: string | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          processed_at?: string | null
          source_domain?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pending_access_codes: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          user_email: string
          verified_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          user_email: string
          verified_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          user_email?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      pending_invitations: {
        Row: {
          code: string
          created_at: string | null
          expires_at: string
          status: string | null
          used_at: string | null
          user_email: string
          user_name: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          expires_at: string
          status?: string | null
          used_at?: string | null
          user_email: string
          user_name?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          expires_at?: string
          status?: string | null
          used_at?: string | null
          user_email?: string
          user_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_posts: {
        Row: {
          author: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          published_at: string | null
          summary: string | null
          title: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          summary?: string | null
          title: string
        }
        Update: {
          author?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          published_at?: string | null
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      asset_type: "stock" | "bond" | "fund" | "cd"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      asset_type: ["stock", "bond", "fund", "cd"],
    },
  },
} as const
