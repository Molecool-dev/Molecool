// Database types for Supabase
// This file can be auto-generated using: npx supabase gen types typescript --project-id <project-id>
// For now, we define them manually based on our schema

export interface Database {
  public: {
    Tables: {
      widgets: {
        Row: {
          id: string;
          widget_id: string;
          name: string;
          display_name: string;
          description: string;
          author_name: string;
          author_email: string;
          version: string;
          downloads: number;
          permissions: WidgetPermissions;
          sizes: WidgetSizes;
          icon_url: string | null;
          download_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['widgets']['Row'], 'id' | 'created_at' | 'updated_at' | 'icon_url'> & {
          id?: string;
          icon_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['widgets']['Insert']>;
      };
    };
  };
}

// Export Widget type alias for convenience
export type Widget = Database['public']['Tables']['widgets']['Row'];

export interface WidgetPermissions {
  systemInfo?: {
    cpu?: boolean;
    memory?: boolean;
  };
  network?: {
    enabled?: boolean;
    allowedDomains?: string[];
  };
}

export interface WidgetSizes {
  default: {
    width: number;
    height: number;
  };
  min?: {
    width: number;
    height: number;
  };
  max?: {
    width: number;
    height: number;
  };
}
