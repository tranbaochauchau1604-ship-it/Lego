// Type sinh theo schema trong supabase/migrations/001_init.sql.
// Có thể sinh lại tự động bằng:
//   npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3";
  };
  public: {
    Tables: {
      site_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      admins: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          set_number: string | null;
          category_id: string | null;
          theme: string | null;
          price: number;
          sale_price: number | null;
          stock: number;
          pieces: number | null;
          age_range: string | null;
          release_year: number | null;
          short_description: string | null;
          description: string | null;
          images: string[];
          thumbnail: string | null;
          is_featured: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          effective_price: number;
          is_on_sale: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          set_number?: string | null;
          category_id?: string | null;
          theme?: string | null;
          price?: number;
          sale_price?: number | null;
          stock?: number;
          pieces?: number | null;
          age_range?: string | null;
          release_year?: number | null;
          short_description?: string | null;
          description?: string | null;
          images?: string[];
          thumbnail?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          effective_price?: never;
          is_on_sale?: never;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          set_number?: string | null;
          category_id?: string | null;
          theme?: string | null;
          price?: number;
          sale_price?: number | null;
          stock?: number;
          pieces?: number | null;
          age_range?: string | null;
          release_year?: number | null;
          short_description?: string | null;
          description?: string | null;
          images?: string[];
          thumbnail?: string | null;
          is_featured?: boolean;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          effective_price?: never;
          is_on_sale?: never;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
