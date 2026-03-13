export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      account_api_keys: {
        Row: {
          account: string | null;
          created_at: string;
          id: string;
          key_hash: string | null;
          last_used: string | null;
          name: string;
        };
        Insert: {
          account?: string | null;
          created_at?: string;
          id?: string;
          key_hash?: string | null;
          last_used?: string | null;
          name: string;
        };
        Update: {
          account?: string | null;
          created_at?: string;
          id?: string;
          key_hash?: string | null;
          last_used?: string | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_api_keys_account_fkey";
            columns: ["account"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      account_artist_ids: {
        Row: {
          account_id: string | null;
          artist_id: string | null;
          id: string;
          pinned: boolean;
          updated_at: string | null;
        };
        Insert: {
          account_id?: string | null;
          artist_id?: string | null;
          id?: string;
          pinned?: boolean;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string | null;
          artist_id?: string | null;
          id?: string;
          pinned?: boolean;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "account_artist_ids_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_artist_ids_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      account_catalogs: {
        Row: {
          account: string;
          catalog: string;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          account: string;
          catalog: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          account?: string;
          catalog?: string;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_catalogs_account_fkey";
            columns: ["account"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_catalogs_catalog_fkey";
            columns: ["catalog"];
            isOneToOne: false;
            referencedRelation: "catalogs";
            referencedColumns: ["id"];
          },
        ];
      };
      account_emails: {
        Row: {
          account_id: string | null;
          email: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          account_id?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string;
        };
        Update: {
          account_id?: string | null;
          email?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_emails_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      account_info: {
        Row: {
          account_id: string | null;
          company_name: string | null;
          id: string;
          image: string | null;
          instruction: string | null;
          job_title: string | null;
          knowledges: Json | null;
          label: string | null;
          onboarding_data: Json | null;
          onboarding_status: Json | null;
          organization: string | null;
          role_type: string | null;
          updated_at: string;
        };
        Insert: {
          account_id?: string | null;
          company_name?: string | null;
          id?: string;
          image?: string | null;
          instruction?: string | null;
          job_title?: string | null;
          knowledges?: Json | null;
          label?: string | null;
          onboarding_data?: Json | null;
          onboarding_status?: Json | null;
          organization?: string | null;
          role_type?: string | null;
          updated_at?: string;
        };
        Update: {
          account_id?: string | null;
          company_name?: string | null;
          id?: string;
          image?: string | null;
          instruction?: string | null;
          job_title?: string | null;
          knowledges?: Json | null;
          label?: string | null;
          onboarding_data?: Json | null;
          onboarding_status?: Json | null;
          organization?: string | null;
          role_type?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_info_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      account_organization_ids: {
        Row: {
          account_id: string | null;
          id: string;
          organization_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_id?: string | null;
          id?: string;
          organization_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string | null;
          id?: string;
          organization_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "account_organization_ids_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_organization_ids_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      account_phone_numbers: {
        Row: {
          account_id: string;
          id: string;
          phone_number: string;
          updated_at: string | null;
        };
        Insert: {
          account_id: string;
          id?: string;
          phone_number: string;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string;
          id?: string;
          phone_number?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "account_phone_numbers_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      account_socials: {
        Row: {
          account_id: string | null;
          id: string;
          social_id: string;
        };
        Insert: {
          account_id?: string | null;
          id?: string;
          social_id?: string;
        };
        Update: {
          account_id?: string | null;
          id?: string;
          social_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_socials_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_socials_social_id_fkey";
            columns: ["social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
        ];
      };
      account_wallets: {
        Row: {
          account_id: string;
          id: string;
          updated_at: string | null;
          wallet: string;
        };
        Insert: {
          account_id: string;
          id?: string;
          updated_at?: string | null;
          wallet: string;
        };
        Update: {
          account_id?: string;
          id?: string;
          updated_at?: string | null;
          wallet?: string;
        };
        Relationships: [
          {
            foreignKeyName: "account_wallets_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      account_workspace_ids: {
        Row: {
          account_id: string | null;
          id: string;
          updated_at: string | null;
          workspace_id: string | null;
        };
        Insert: {
          account_id?: string | null;
          id?: string;
          updated_at?: string | null;
          workspace_id?: string | null;
        };
        Update: {
          account_id?: string | null;
          id?: string;
          updated_at?: string | null;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "account_workspace_ids_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_workspace_ids_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      accounts: {
        Row: {
          id: string;
          name: string | null;
          timestamp: number | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          timestamp?: number | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      accounts_memberships: {
        Row: {
          account_id: string;
          account_role: string;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
        };
        Insert: {
          account_id: string;
          account_role: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string;
          account_role?: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "accounts_memberships_account_role_fkey";
            columns: ["account_role"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["name"];
          },
        ];
      };
      admin_expenses: {
        Row: {
          amount: number;
          category: string;
          created_at: string | null;
          created_by: string | null;
          id: string;
          is_active: boolean | null;
          item_name: string;
          updated_at: string | null;
        };
        Insert: {
          amount?: number;
          category: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_active?: boolean | null;
          item_name: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          category?: string;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          is_active?: boolean | null;
          item_name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      admin_user_profiles: {
        Row: {
          company: string | null;
          context_notes: string | null;
          created_at: string | null;
          email: string;
          id: string;
          job_title: string | null;
          last_contact_date: string | null;
          meeting_notes: string | null;
          observations: string | null;
          opportunities: string | null;
          pain_points: string | null;
          sentiment: string | null;
          tags: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          company?: string | null;
          context_notes?: string | null;
          created_at?: string | null;
          email: string;
          id?: string;
          job_title?: string | null;
          last_contact_date?: string | null;
          meeting_notes?: string | null;
          observations?: string | null;
          opportunities?: string | null;
          pain_points?: string | null;
          sentiment?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          company?: string | null;
          context_notes?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          job_title?: string | null;
          last_contact_date?: string | null;
          meeting_notes?: string | null;
          observations?: string | null;
          opportunities?: string | null;
          pain_points?: string | null;
          sentiment?: string | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      agent_status: {
        Row: {
          agent_id: string;
          id: string;
          progress: number | null;
          social_id: string;
          status: number | null;
          updated_at: string;
        };
        Insert: {
          agent_id?: string;
          id?: string;
          progress?: number | null;
          social_id: string;
          status?: number | null;
          updated_at?: string;
        };
        Update: {
          agent_id?: string;
          id?: string;
          progress?: number | null;
          social_id?: string;
          status?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_status_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_status_social_id_fkey";
            columns: ["social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_template_favorites: {
        Row: {
          created_at: string | null;
          template_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          template_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_template_favorites_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "agent_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_template_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_template_shares: {
        Row: {
          created_at: string | null;
          template_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          template_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_template_shares_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "agent_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agent_template_shares_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      agent_templates: {
        Row: {
          created_at: string;
          creator: string | null;
          description: string;
          favorites_count: number;
          id: string;
          is_private: boolean;
          prompt: string;
          tags: string[];
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          creator?: string | null;
          description: string;
          favorites_count?: number;
          id?: string;
          is_private?: boolean;
          prompt: string;
          tags?: string[];
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          creator?: string | null;
          description?: string;
          favorites_count?: number;
          id?: string;
          is_private?: boolean;
          prompt?: string;
          tags?: string[];
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "agent_templates_creator_fkey";
            columns: ["creator"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      agents: {
        Row: {
          id: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_store_link_clicked: {
        Row: {
          clientId: string | null;
          id: string | null;
          timestamp: number | null;
        };
        Insert: {
          clientId?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Update: {
          clientId?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      apple_login_button_clicked: {
        Row: {
          campaignId: string | null;
          clientId: string | null;
          fanId: string | null;
          game: string | null;
          id: string | null;
          timestamp: number | null;
        };
        Insert: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Update: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "apple_login_button_clicked_campaignId_fkey";
            columns: ["campaignId"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      apple_music: {
        Row: {
          fanId: string | null;
          game: string | null;
          id: string | null;
          syncid: string | null;
          syncId: string | null;
          timestamp: number | null;
        };
        Insert: {
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          syncid?: string | null;
          syncId?: string | null;
          timestamp?: number | null;
        };
        Update: {
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          syncid?: string | null;
          syncId?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      apple_play_button_clicked: {
        Row: {
          appleId: string | null;
          campaignId: string | null;
          clientId: string | null;
          fanId: string | null;
          game: string | null;
          id: string;
          timestamp: number | null;
        };
        Insert: {
          appleId?: string | null;
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string;
          timestamp?: number | null;
        };
        Update: {
          appleId?: string | null;
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string;
          timestamp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "apple_play_button_clicked_campaignId_fkey";
            columns: ["campaignId"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      artist_fan_segment: {
        Row: {
          artist_social_id: string | null;
          fan_social_id: string | null;
          id: string;
          segment_name: string | null;
          updated_at: string;
        };
        Insert: {
          artist_social_id?: string | null;
          fan_social_id?: string | null;
          id?: string;
          segment_name?: string | null;
          updated_at?: string;
        };
        Update: {
          artist_social_id?: string | null;
          fan_social_id?: string | null;
          id?: string;
          segment_name?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "artist_fan_segment_artist_social_id_fkey";
            columns: ["artist_social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artist_fan_segment_fan_social_id_fkey";
            columns: ["fan_social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
        ];
      };
      artist_organization_ids: {
        Row: {
          artist_id: string;
          created_at: string | null;
          id: string;
          organization_id: string;
          updated_at: string | null;
        };
        Insert: {
          artist_id: string;
          created_at?: string | null;
          id?: string;
          organization_id: string;
          updated_at?: string | null;
        };
        Update: {
          artist_id?: string;
          created_at?: string | null;
          id?: string;
          organization_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "artist_organization_ids_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artist_organization_ids_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      artist_segments: {
        Row: {
          artist_account_id: string;
          id: string;
          segment_id: string;
          updated_at: string | null;
        };
        Insert: {
          artist_account_id: string;
          id?: string;
          segment_id: string;
          updated_at?: string | null;
        };
        Update: {
          artist_account_id?: string;
          id?: string;
          segment_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "artist_segments_artist_account_id_fkey";
            columns: ["artist_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "artist_segments_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "segments";
            referencedColumns: ["id"];
          },
        ];
      };
      billing_customers: {
        Row: {
          account_id: string;
          customer_id: string;
          email: string | null;
          id: number;
          provider: Database["public"]["Enums"]["billing_provider"];
        };
        Insert: {
          account_id: string;
          customer_id: string;
          email?: string | null;
          id?: number;
          provider: Database["public"]["Enums"]["billing_provider"];
        };
        Update: {
          account_id?: string;
          customer_id?: string;
          email?: string | null;
          id?: number;
          provider?: Database["public"]["Enums"]["billing_provider"];
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          artist_id: string | null;
          clientId: string | null;
          id: string;
          timestamp: number | null;
        };
        Insert: {
          artist_id?: string | null;
          clientId?: string | null;
          id?: string;
          timestamp?: number | null;
        };
        Update: {
          artist_id?: string | null;
          clientId?: string | null;
          id?: string;
          timestamp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "campaigns_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      catalog_songs: {
        Row: {
          catalog: string;
          created_at: string;
          id: string;
          song: string;
          updated_at: string;
        };
        Insert: {
          catalog: string;
          created_at?: string;
          id?: string;
          song: string;
          updated_at?: string;
        };
        Update: {
          catalog?: string;
          created_at?: string;
          id?: string;
          song?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "catalog_songs_catalog_fkey";
            columns: ["catalog"];
            isOneToOne: false;
            referencedRelation: "catalogs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "catalog_songs_song_fkey";
            columns: ["song"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["isrc"];
          },
        ];
      };
      catalogs: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      config: {
        Row: {
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          enable_account_billing: boolean;
          enable_team_account_billing: boolean;
          enable_team_accounts: boolean;
        };
        Insert: {
          billing_provider?: Database["public"]["Enums"]["billing_provider"];
          enable_account_billing?: boolean;
          enable_team_account_billing?: boolean;
          enable_team_accounts?: boolean;
        };
        Update: {
          billing_provider?: Database["public"]["Enums"]["billing_provider"];
          enable_account_billing?: boolean;
          enable_team_account_billing?: boolean;
          enable_team_accounts?: boolean;
        };
        Relationships: [];
      };
      cookie_players: {
        Row: {
          game: string | null;
          id: string | null;
          timestamp: number | null;
          uniquePlayerID: string | null;
        };
        Insert: {
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
          uniquePlayerID?: string | null;
        };
        Update: {
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
          uniquePlayerID?: string | null;
        };
        Relationships: [];
      };
      credits_usage: {
        Row: {
          account_id: string;
          id: number;
          remaining_credits: number;
          timestamp: string | null;
        };
        Insert: {
          account_id: string;
          id?: number;
          remaining_credits?: number;
          timestamp?: string | null;
        };
        Update: {
          account_id?: string;
          id?: number;
          remaining_credits?: number;
          timestamp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "credits_usage_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      cta_redirect: {
        Row: {
          clientId: string;
          id: number;
          timestamp: string | null;
          url: string | null;
        };
        Insert: {
          clientId: string;
          id?: number;
          timestamp?: string | null;
          url?: string | null;
        };
        Update: {
          clientId?: string;
          id?: number;
          timestamp?: string | null;
          url?: string | null;
        };
        Relationships: [];
      };
      error_logs: {
        Row: {
          account_id: string | null;
          created_at: string;
          error_message: string | null;
          error_timestamp: string | null;
          error_type: string | null;
          id: string;
          last_message: string | null;
          raw_message: string;
          room_id: string | null;
          stack_trace: string | null;
          telegram_message_id: number | null;
          tool_name: string | null;
        };
        Insert: {
          account_id?: string | null;
          created_at?: string;
          error_message?: string | null;
          error_timestamp?: string | null;
          error_type?: string | null;
          id?: string;
          last_message?: string | null;
          raw_message: string;
          room_id?: string | null;
          stack_trace?: string | null;
          telegram_message_id?: number | null;
          tool_name?: string | null;
        };
        Update: {
          account_id?: string | null;
          created_at?: string;
          error_message?: string | null;
          error_timestamp?: string | null;
          error_type?: string | null;
          id?: string;
          last_message?: string | null;
          raw_message?: string;
          room_id?: string | null;
          stack_trace?: string | null;
          telegram_message_id?: number | null;
          tool_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "error_logs_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "error_logs_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      fan_segments: {
        Row: {
          fan_social_id: string;
          id: string;
          segment_id: string;
          updated_at: string | null;
        };
        Insert: {
          fan_social_id: string;
          id?: string;
          segment_id: string;
          updated_at?: string | null;
        };
        Update: {
          fan_social_id?: string;
          id?: string;
          segment_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fan_segments_fan_social_id_fkey";
            columns: ["fan_social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fan_segments_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "segments";
            referencedColumns: ["id"];
          },
        ];
      };
      fans: {
        Row: {
          account_status: string | null;
          apple_token: string | null;
          campaign_id: string | null;
          campaign_interaction_count: number | null;
          campaignId: string | null;
          city: string | null;
          click_through_rate: number | null;
          clientId: string | null;
          consent_given: boolean | null;
          country: string | null;
          custom_tags: Json | null;
          discord_username: string | null;
          display_name: string | null;
          email: string | null;
          email_open_rate: number | null;
          engagement_level: string | null;
          episodes: Json | null;
          explicit_content_filter_enabled: boolean | null;
          explicit_content_filter_locked: boolean | null;
          "explicit_content.filter_enabled": boolean | null;
          "explicit_content.filter_locked": boolean | null;
          external_urls_spotify: string | null;
          "external_urls.spotify": string | null;
          facebook_profile_url: string | null;
          first_stream_date: string | null;
          followedArtists: Json | null;
          followers_total: number | null;
          "followers.href": string | null;
          "followers.total": number | null;
          gamification_points: number | null;
          genres: Json | null;
          heavyRotations: Json | null;
          href: string | null;
          id: string;
          images: Json | null;
          instagram_handle: string | null;
          last_campaign_interaction: string | null;
          last_login: string | null;
          last_purchase_date: string | null;
          last_stream_date: string | null;
          linkedin_profile_url: string | null;
          os_type: string | null;
          playlist: Json | null;
          preferences: Json | null;
          preferred_artists: Json | null;
          preferred_device: string | null;
          product: string | null;
          recentlyPlayed: Json | null;
          recommendations: Json | null;
          recommended_events: Json | null;
          reddit_username: string | null;
          saved_podcasts: Json | null;
          savedAlbums: Json | null;
          savedAudioBooks: Json | null;
          savedShows: Json | null;
          savedTracks: Json | null;
          social_shares: number | null;
          spotify_token: string | null;
          subscription_tier: string | null;
          testField: string | null;
          tiktok_handle: string | null;
          time_zone: string | null;
          timestamp: string | null;
          top_artists_long_term: Json | null;
          top_artists_medium_term: Json | null;
          top_tracks_long_term: Json | null;
          top_tracks_medium_term: Json | null;
          top_tracks_short_term: Json | null;
          topArtists: Json | null;
          topTracks: Json | null;
          total_spent: number | null;
          total_streams: number | null;
          twitter_handle: string | null;
          type: string | null;
          uri: string | null;
          youtube_channel_url: string | null;
        };
        Insert: {
          account_status?: string | null;
          apple_token?: string | null;
          campaign_id?: string | null;
          campaign_interaction_count?: number | null;
          campaignId?: string | null;
          city?: string | null;
          click_through_rate?: number | null;
          clientId?: string | null;
          consent_given?: boolean | null;
          country?: string | null;
          custom_tags?: Json | null;
          discord_username?: string | null;
          display_name?: string | null;
          email?: string | null;
          email_open_rate?: number | null;
          engagement_level?: string | null;
          episodes?: Json | null;
          explicit_content_filter_enabled?: boolean | null;
          explicit_content_filter_locked?: boolean | null;
          "explicit_content.filter_enabled"?: boolean | null;
          "explicit_content.filter_locked"?: boolean | null;
          external_urls_spotify?: string | null;
          "external_urls.spotify"?: string | null;
          facebook_profile_url?: string | null;
          first_stream_date?: string | null;
          followedArtists?: Json | null;
          followers_total?: number | null;
          "followers.href"?: string | null;
          "followers.total"?: number | null;
          gamification_points?: number | null;
          genres?: Json | null;
          heavyRotations?: Json | null;
          href?: string | null;
          id?: string;
          images?: Json | null;
          instagram_handle?: string | null;
          last_campaign_interaction?: string | null;
          last_login?: string | null;
          last_purchase_date?: string | null;
          last_stream_date?: string | null;
          linkedin_profile_url?: string | null;
          os_type?: string | null;
          playlist?: Json | null;
          preferences?: Json | null;
          preferred_artists?: Json | null;
          preferred_device?: string | null;
          product?: string | null;
          recentlyPlayed?: Json | null;
          recommendations?: Json | null;
          recommended_events?: Json | null;
          reddit_username?: string | null;
          saved_podcasts?: Json | null;
          savedAlbums?: Json | null;
          savedAudioBooks?: Json | null;
          savedShows?: Json | null;
          savedTracks?: Json | null;
          social_shares?: number | null;
          spotify_token?: string | null;
          subscription_tier?: string | null;
          testField?: string | null;
          tiktok_handle?: string | null;
          time_zone?: string | null;
          timestamp?: string | null;
          top_artists_long_term?: Json | null;
          top_artists_medium_term?: Json | null;
          top_tracks_long_term?: Json | null;
          top_tracks_medium_term?: Json | null;
          top_tracks_short_term?: Json | null;
          topArtists?: Json | null;
          topTracks?: Json | null;
          total_spent?: number | null;
          total_streams?: number | null;
          twitter_handle?: string | null;
          type?: string | null;
          uri?: string | null;
          youtube_channel_url?: string | null;
        };
        Update: {
          account_status?: string | null;
          apple_token?: string | null;
          campaign_id?: string | null;
          campaign_interaction_count?: number | null;
          campaignId?: string | null;
          city?: string | null;
          click_through_rate?: number | null;
          clientId?: string | null;
          consent_given?: boolean | null;
          country?: string | null;
          custom_tags?: Json | null;
          discord_username?: string | null;
          display_name?: string | null;
          email?: string | null;
          email_open_rate?: number | null;
          engagement_level?: string | null;
          episodes?: Json | null;
          explicit_content_filter_enabled?: boolean | null;
          explicit_content_filter_locked?: boolean | null;
          "explicit_content.filter_enabled"?: boolean | null;
          "explicit_content.filter_locked"?: boolean | null;
          external_urls_spotify?: string | null;
          "external_urls.spotify"?: string | null;
          facebook_profile_url?: string | null;
          first_stream_date?: string | null;
          followedArtists?: Json | null;
          followers_total?: number | null;
          "followers.href"?: string | null;
          "followers.total"?: number | null;
          gamification_points?: number | null;
          genres?: Json | null;
          heavyRotations?: Json | null;
          href?: string | null;
          id?: string;
          images?: Json | null;
          instagram_handle?: string | null;
          last_campaign_interaction?: string | null;
          last_login?: string | null;
          last_purchase_date?: string | null;
          last_stream_date?: string | null;
          linkedin_profile_url?: string | null;
          os_type?: string | null;
          playlist?: Json | null;
          preferences?: Json | null;
          preferred_artists?: Json | null;
          preferred_device?: string | null;
          product?: string | null;
          recentlyPlayed?: Json | null;
          recommendations?: Json | null;
          recommended_events?: Json | null;
          reddit_username?: string | null;
          saved_podcasts?: Json | null;
          savedAlbums?: Json | null;
          savedAudioBooks?: Json | null;
          savedShows?: Json | null;
          savedTracks?: Json | null;
          social_shares?: number | null;
          spotify_token?: string | null;
          subscription_tier?: string | null;
          testField?: string | null;
          tiktok_handle?: string | null;
          time_zone?: string | null;
          timestamp?: string | null;
          top_artists_long_term?: Json | null;
          top_artists_medium_term?: Json | null;
          top_tracks_long_term?: Json | null;
          top_tracks_medium_term?: Json | null;
          top_tracks_short_term?: Json | null;
          topArtists?: Json | null;
          topTracks?: Json | null;
          total_spent?: number | null;
          total_streams?: number | null;
          twitter_handle?: string | null;
          type?: string | null;
          uri?: string | null;
          youtube_channel_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fans_campaignId_fkey";
            columns: ["campaignId"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      files: {
        Row: {
          artist_account_id: string;
          created_at: string;
          description: string | null;
          file_name: string;
          id: string;
          is_directory: boolean;
          mime_type: string | null;
          owner_account_id: string;
          size_bytes: number | null;
          storage_key: string;
          tags: string[] | null;
          updated_at: string;
        };
        Insert: {
          artist_account_id: string;
          created_at?: string;
          description?: string | null;
          file_name: string;
          id?: string;
          is_directory?: boolean;
          mime_type?: string | null;
          owner_account_id: string;
          size_bytes?: number | null;
          storage_key: string;
          tags?: string[] | null;
          updated_at?: string;
        };
        Update: {
          artist_account_id?: string;
          created_at?: string;
          description?: string | null;
          file_name?: string;
          id?: string;
          is_directory?: boolean;
          mime_type?: string | null;
          owner_account_id?: string;
          size_bytes?: number | null;
          storage_key?: string;
          tags?: string[] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "files_artist_account_id_fkey";
            columns: ["artist_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "files_owner_account_id_fkey";
            columns: ["owner_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          game: string | null;
          id: string | null;
          timestamp: number | null;
        };
        Insert: {
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Update: {
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      founder_dashboard_chart_annotations: {
        Row: {
          chart_type: string | null;
          created_at: string | null;
          event_date: string;
          event_description: string | null;
          id: string;
        };
        Insert: {
          chart_type?: string | null;
          created_at?: string | null;
          event_date: string;
          event_description?: string | null;
          id?: string;
        };
        Update: {
          chart_type?: string | null;
          created_at?: string | null;
          event_date?: string;
          event_description?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      funnel_analytics: {
        Row: {
          artist_id: string | null;
          handle: string | null;
          id: string;
          pilot_id: string | null;
          status: number | null;
          type: Database["public"]["Enums"]["social_type"] | null;
          updated_at: string;
        };
        Insert: {
          artist_id?: string | null;
          handle?: string | null;
          id?: string;
          pilot_id?: string | null;
          status?: number | null;
          type?: Database["public"]["Enums"]["social_type"] | null;
          updated_at?: string;
        };
        Update: {
          artist_id?: string | null;
          handle?: string | null;
          id?: string;
          pilot_id?: string | null;
          status?: number | null;
          type?: Database["public"]["Enums"]["social_type"] | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "funnel_analytics_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      funnel_analytics_accounts: {
        Row: {
          account_id: string | null;
          analysis_id: string | null;
          created_at: string;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          account_id?: string | null;
          analysis_id?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string | null;
          analysis_id?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "account_funnel_analytics_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "account_funnel_analytics_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "funnel_analytics";
            referencedColumns: ["id"];
          },
        ];
      };
      funnel_analytics_segments: {
        Row: {
          analysis_id: string | null;
          created_at: string;
          icon: string | null;
          id: string;
          name: string | null;
          size: number | null;
        };
        Insert: {
          analysis_id?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string | null;
          size?: number | null;
        };
        Update: {
          analysis_id?: string | null;
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string | null;
          size?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "funnel_analytics_segments_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "funnel_analytics";
            referencedColumns: ["id"];
          },
        ];
      };
      funnel_reports: {
        Row: {
          id: string;
          next_steps: string | null;
          report: string | null;
          stack_unique_id: string | null;
          timestamp: string;
          type: Database["public"]["Enums"]["social_type"] | null;
        };
        Insert: {
          id?: string;
          next_steps?: string | null;
          report?: string | null;
          stack_unique_id?: string | null;
          timestamp?: string;
          type?: Database["public"]["Enums"]["social_type"] | null;
        };
        Update: {
          id?: string;
          next_steps?: string | null;
          report?: string | null;
          stack_unique_id?: string | null;
          timestamp?: string;
          type?: Database["public"]["Enums"]["social_type"] | null;
        };
        Relationships: [];
      };
      game_start: {
        Row: {
          clientId: string | null;
          fanId: Json | null;
          game: string | null;
          id: string | null;
          timestamp: number | null;
        };
        Insert: {
          clientId?: string | null;
          fanId?: Json | null;
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Update: {
          clientId?: string | null;
          fanId?: Json | null;
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: number;
          invite_token?: string;
          invited_by?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_role_fkey";
            columns: ["role"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["name"];
          },
        ];
      };
      ios_redirect: {
        Row: {
          clientId: string | null;
          fanId: string | null;
          id: string | null;
          timestamp: number | null;
        };
        Insert: {
          clientId?: string | null;
          fanId?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Update: {
          clientId?: string | null;
          fanId?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      leaderboard: {
        Row: {
          id: string | null;
          Name: string | null;
          Number: string | null;
          Score: string | null;
          Spotify: string | null;
          "Time._nanoseconds": string | null;
          "Time._seconds": string | null;
        };
        Insert: {
          id?: string | null;
          Name?: string | null;
          Number?: string | null;
          Score?: string | null;
          Spotify?: string | null;
          "Time._nanoseconds"?: string | null;
          "Time._seconds"?: string | null;
        };
        Update: {
          id?: string | null;
          Name?: string | null;
          Number?: string | null;
          Score?: string | null;
          Spotify?: string | null;
          "Time._nanoseconds"?: string | null;
          "Time._seconds"?: string | null;
        };
        Relationships: [];
      };
      leaderboard_boogie: {
        Row: {
          clientId: string | null;
          displayName: string | null;
          fanId: string | null;
          gameType: string | null;
          id: string | null;
          score: number | null;
          timestamp: string | null;
        };
        Insert: {
          clientId?: string | null;
          displayName?: string | null;
          fanId?: string | null;
          gameType?: string | null;
          id?: string | null;
          score?: number | null;
          timestamp?: string | null;
        };
        Update: {
          clientId?: string | null;
          displayName?: string | null;
          fanId?: string | null;
          gameType?: string | null;
          id?: string | null;
          score?: number | null;
          timestamp?: string | null;
        };
        Relationships: [];
      };
      leaderboard_luh_tyler_3d: {
        Row: {
          FanId: string | null;
          id: string | null;
          Score: string | null;
          ScorePerTime: string | null;
          Time: string | null;
          timestamp: string | null;
          UserName: string | null;
        };
        Insert: {
          FanId?: string | null;
          id?: string | null;
          Score?: string | null;
          ScorePerTime?: string | null;
          Time?: string | null;
          timestamp?: string | null;
          UserName?: string | null;
        };
        Update: {
          FanId?: string | null;
          id?: string | null;
          Score?: string | null;
          ScorePerTime?: string | null;
          Time?: string | null;
          timestamp?: string | null;
          UserName?: string | null;
        };
        Relationships: [];
      };
      leaderboard_luv: {
        Row: {
          f: string | null;
          id: string | null;
        };
        Insert: {
          f?: string | null;
          id?: string | null;
        };
        Update: {
          f?: string | null;
          id?: string | null;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          content: Json;
          id: string;
          room_id: string | null;
          updated_at: string;
        };
        Insert: {
          content: Json;
          id?: string;
          room_id?: string | null;
          updated_at?: string;
        };
        Update: {
          content?: Json;
          id?: string;
          room_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memories_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          account_id: string;
          body: string;
          channel: Database["public"]["Enums"]["notification_channel"];
          created_at: string;
          dismissed: boolean;
          expires_at: string | null;
          id: number;
          link: string | null;
          type: Database["public"]["Enums"]["notification_type"];
        };
        Insert: {
          account_id: string;
          body: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          dismissed?: boolean;
          expires_at?: string | null;
          id?: never;
          link?: string | null;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Update: {
          account_id?: string;
          body?: string;
          channel?: Database["public"]["Enums"]["notification_channel"];
          created_at?: string;
          dismissed?: boolean;
          expires_at?: string | null;
          id?: never;
          link?: string | null;
          type?: Database["public"]["Enums"]["notification_type"];
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          price_amount: number | null;
          product_id: string;
          quantity: number;
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          order_id: string;
          price_amount?: number | null;
          product_id: string;
          quantity?: number;
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          price_amount?: number | null;
          product_id?: string;
          quantity?: number;
          updated_at?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          account_id: string;
          billing_customer_id: number;
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          created_at: string;
          currency: string;
          id: string;
          status: Database["public"]["Enums"]["payment_status"];
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          billing_customer_id: number;
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          created_at?: string;
          currency: string;
          id: string;
          status: Database["public"]["Enums"]["payment_status"];
          total_amount: number;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          billing_customer_id?: number;
          billing_provider?: Database["public"]["Enums"]["billing_provider"];
          created_at?: string;
          currency?: string;
          id?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_billing_customer_id_fkey";
            columns: ["billing_customer_id"];
            isOneToOne: false;
            referencedRelation: "billing_customers";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_domains: {
        Row: {
          created_at: string | null;
          domain: string;
          id: string;
          organization_id: string;
        };
        Insert: {
          created_at?: string | null;
          domain: string;
          id?: string;
          organization_id: string;
        };
        Update: {
          created_at?: string | null;
          domain?: string;
          id?: string;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_domains_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      plans: {
        Row: {
          name: string;
          tokens_quota: number;
          variant_id: string;
        };
        Insert: {
          name: string;
          tokens_quota: number;
          variant_id: string;
        };
        Update: {
          name?: string;
          tokens_quota?: number;
          variant_id?: string;
        };
        Relationships: [];
      };
      popup_open: {
        Row: {
          campaignId: string | null;
          clientId: string | null;
          fanId: string | null;
          game: string | null;
          id: string | null;
          timestamp: string | null;
        };
        Insert: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          timestamp?: string | null;
        };
        Update: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          timestamp?: string | null;
        };
        Relationships: [];
      };
      post_comments: {
        Row: {
          comment: string | null;
          commented_at: string;
          id: string;
          post_id: string | null;
          social_id: string | null;
        };
        Insert: {
          comment?: string | null;
          commented_at: string;
          id?: string;
          post_id?: string | null;
          social_id?: string | null;
        };
        Update: {
          comment?: string | null;
          commented_at?: string;
          id?: string;
          post_id?: string | null;
          social_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_comments_social_id_fkey";
            columns: ["social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          post_url: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_url: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_url?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      presave: {
        Row: {
          accessToken: string | null;
          fanId: string | null;
          "fanId.error.code": string | null;
          "fanId.error.name": string | null;
          id: string | null;
          presaveId: string | null;
          presaveReleaseDate: string | null;
          refreshToken: string | null;
          timestamp: number | null;
        };
        Insert: {
          accessToken?: string | null;
          fanId?: string | null;
          "fanId.error.code"?: string | null;
          "fanId.error.name"?: string | null;
          id?: string | null;
          presaveId?: string | null;
          presaveReleaseDate?: string | null;
          refreshToken?: string | null;
          timestamp?: number | null;
        };
        Update: {
          accessToken?: string | null;
          fanId?: string | null;
          "fanId.error.code"?: string | null;
          "fanId.error.name"?: string | null;
          id?: string | null;
          presaveId?: string | null;
          presaveReleaseDate?: string | null;
          refreshToken?: string | null;
          timestamp?: number | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          id: number;
          permission: Database["public"]["Enums"]["app_permissions"];
          role: string;
        };
        Insert: {
          id?: number;
          permission: Database["public"]["Enums"]["app_permissions"];
          role: string;
        };
        Update: {
          id?: number;
          permission?: Database["public"]["Enums"]["app_permissions"];
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_fkey";
            columns: ["role"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["name"];
          },
        ];
      };
      roles: {
        Row: {
          hierarchy_level: number;
          name: string;
        };
        Insert: {
          hierarchy_level: number;
          name: string;
        };
        Update: {
          hierarchy_level?: number;
          name?: string;
        };
        Relationships: [];
      };
      room_reports: {
        Row: {
          id: string;
          report_id: string;
          room_id: string | null;
        };
        Insert: {
          id?: string;
          report_id?: string;
          room_id?: string | null;
        };
        Update: {
          id?: string;
          report_id?: string;
          room_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "room_reports_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "segment_reports";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "room_reports_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: {
          account_id: string | null;
          artist_id: string | null;
          id: string;
          topic: string | null;
          updated_at: string;
        };
        Insert: {
          account_id?: string | null;
          artist_id?: string | null;
          id?: string;
          topic?: string | null;
          updated_at?: string;
        };
        Update: {
          account_id?: string | null;
          artist_id?: string | null;
          id?: string;
          topic?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "rooms_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      sales_pipeline_customers: {
        Row: {
          activity_count: number | null;
          assigned_to: string | null;
          company_size: string | null;
          competitors: string[] | null;
          contact_email: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          contacts: Json | null;
          conversion_stage: string | null;
          conversion_target_date: string | null;
          created_at: string | null;
          current_artists: number;
          current_mrr: number;
          custom_fields: Json | null;
          days_in_stage: number | null;
          domain: string | null;
          email: string | null;
          engagement_health: string | null;
          expected_close_date: string | null;
          external_ids: Json | null;
          id: string;
          industry: string | null;
          internal_owner: string | null;
          last_activity_date: string | null;
          last_activity_type: string | null;
          last_contact_date: string;
          logo_url: string | null;
          lost_reason: string | null;
          name: string;
          next_action: string | null;
          next_activity_date: string | null;
          next_activity_type: string | null;
          notes: string | null;
          order_index: number | null;
          organization: string | null;
          potential_artists: number;
          potential_mrr: number;
          priority: string | null;
          probability: number | null;
          recoupable_user_id: string | null;
          source: string | null;
          stage: string;
          stage_entered_at: string | null;
          tags: string[] | null;
          todos: Json | null;
          trial_end_date: string | null;
          trial_start_date: string | null;
          type: string | null;
          updated_at: string | null;
          use_case_type: string | null;
          website: string | null;
          weighted_mrr: number | null;
          win_reason: string | null;
        };
        Insert: {
          activity_count?: number | null;
          assigned_to?: string | null;
          company_size?: string | null;
          competitors?: string[] | null;
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contacts?: Json | null;
          conversion_stage?: string | null;
          conversion_target_date?: string | null;
          created_at?: string | null;
          current_artists?: number;
          current_mrr?: number;
          custom_fields?: Json | null;
          days_in_stage?: number | null;
          domain?: string | null;
          email?: string | null;
          engagement_health?: string | null;
          expected_close_date?: string | null;
          external_ids?: Json | null;
          id?: string;
          industry?: string | null;
          internal_owner?: string | null;
          last_activity_date?: string | null;
          last_activity_type?: string | null;
          last_contact_date?: string;
          logo_url?: string | null;
          lost_reason?: string | null;
          name: string;
          next_action?: string | null;
          next_activity_date?: string | null;
          next_activity_type?: string | null;
          notes?: string | null;
          order_index?: number | null;
          organization?: string | null;
          potential_artists?: number;
          potential_mrr?: number;
          priority?: string | null;
          probability?: number | null;
          recoupable_user_id?: string | null;
          source?: string | null;
          stage: string;
          stage_entered_at?: string | null;
          tags?: string[] | null;
          todos?: Json | null;
          trial_end_date?: string | null;
          trial_start_date?: string | null;
          type?: string | null;
          updated_at?: string | null;
          use_case_type?: string | null;
          website?: string | null;
          weighted_mrr?: number | null;
          win_reason?: string | null;
        };
        Update: {
          activity_count?: number | null;
          assigned_to?: string | null;
          company_size?: string | null;
          competitors?: string[] | null;
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contacts?: Json | null;
          conversion_stage?: string | null;
          conversion_target_date?: string | null;
          created_at?: string | null;
          current_artists?: number;
          current_mrr?: number;
          custom_fields?: Json | null;
          days_in_stage?: number | null;
          domain?: string | null;
          email?: string | null;
          engagement_health?: string | null;
          expected_close_date?: string | null;
          external_ids?: Json | null;
          id?: string;
          industry?: string | null;
          internal_owner?: string | null;
          last_activity_date?: string | null;
          last_activity_type?: string | null;
          last_contact_date?: string;
          logo_url?: string | null;
          lost_reason?: string | null;
          name?: string;
          next_action?: string | null;
          next_activity_date?: string | null;
          next_activity_type?: string | null;
          notes?: string | null;
          order_index?: number | null;
          organization?: string | null;
          potential_artists?: number;
          potential_mrr?: number;
          priority?: string | null;
          probability?: number | null;
          recoupable_user_id?: string | null;
          source?: string | null;
          stage?: string;
          stage_entered_at?: string | null;
          tags?: string[] | null;
          todos?: Json | null;
          trial_end_date?: string | null;
          trial_start_date?: string | null;
          type?: string | null;
          updated_at?: string | null;
          use_case_type?: string | null;
          website?: string | null;
          weighted_mrr?: number | null;
          win_reason?: string | null;
        };
        Relationships: [];
      };
      save_track: {
        Row: {
          game: string | null;
          id: string | null;
          timestamp: string | null;
        };
        Insert: {
          game?: string | null;
          id?: string | null;
          timestamp?: string | null;
        };
        Update: {
          game?: string | null;
          id?: string | null;
          timestamp?: string | null;
        };
        Relationships: [];
      };
      scheduled_actions: {
        Row: {
          account_id: string;
          artist_account_id: string;
          created_at: string | null;
          enabled: boolean | null;
          id: string;
          last_run: string | null;
          model: string | null;
          next_run: string | null;
          prompt: string;
          schedule: string;
          title: string;
          trigger_schedule_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          account_id: string;
          artist_account_id: string;
          created_at?: string | null;
          enabled?: boolean | null;
          id?: string;
          last_run?: string | null;
          model?: string | null;
          next_run?: string | null;
          prompt: string;
          schedule: string;
          title: string;
          trigger_schedule_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          account_id?: string;
          artist_account_id?: string;
          created_at?: string | null;
          enabled?: boolean | null;
          id?: string;
          last_run?: string | null;
          model?: string | null;
          next_run?: string | null;
          prompt?: string;
          schedule?: string;
          title?: string;
          trigger_schedule_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "scheduled_actions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scheduled_actions_artist_account_id_fkey";
            columns: ["artist_account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      segment_reports: {
        Row: {
          artist_id: string | null;
          id: string;
          next_steps: string | null;
          report: string | null;
          updated_at: string | null;
        };
        Insert: {
          artist_id?: string | null;
          id?: string;
          next_steps?: string | null;
          report?: string | null;
          updated_at?: string | null;
        };
        Update: {
          artist_id?: string | null;
          id?: string;
          next_steps?: string | null;
          report?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "segment_reports_artist_id_fkey";
            columns: ["artist_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
      segment_rooms: {
        Row: {
          id: string;
          room_id: string;
          segment_id: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          segment_id: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          segment_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "segment_rooms_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "segment_rooms_segment_id_fkey";
            columns: ["segment_id"];
            isOneToOne: false;
            referencedRelation: "segments";
            referencedColumns: ["id"];
          },
        ];
      };
      segments: {
        Row: {
          id: string;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      social_fans: {
        Row: {
          artist_social_id: string;
          created_at: string;
          fan_social_id: string;
          id: string;
          latest_engagement: string | null;
          latest_engagement_id: string | null;
          updated_at: string;
        };
        Insert: {
          artist_social_id: string;
          created_at?: string;
          fan_social_id: string;
          id?: string;
          latest_engagement?: string | null;
          latest_engagement_id?: string | null;
          updated_at?: string;
        };
        Update: {
          artist_social_id?: string;
          created_at?: string;
          fan_social_id?: string;
          id?: string;
          latest_engagement?: string | null;
          latest_engagement_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_fans_artist_social_id_fkey";
            columns: ["artist_social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_fans_fan_social_id_fkey";
            columns: ["fan_social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_fans_latest_engagement_id_fkey";
            columns: ["latest_engagement_id"];
            isOneToOne: false;
            referencedRelation: "post_comments";
            referencedColumns: ["id"];
          },
        ];
      };
      social_posts: {
        Row: {
          id: string;
          post_id: string | null;
          social_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          post_id?: string | null;
          social_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string | null;
          social_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "social_posts_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_posts_social_id_fkey";
            columns: ["social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
        ];
      };
      social_spotify_albums: {
        Row: {
          album_id: string | null;
          id: string;
          social_id: string | null;
          updated_at: string;
        };
        Insert: {
          album_id?: string | null;
          id?: string;
          social_id?: string | null;
          updated_at?: string;
        };
        Update: {
          album_id?: string | null;
          id?: string;
          social_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_spotify_albums_album_id_fkey";
            columns: ["album_id"];
            isOneToOne: false;
            referencedRelation: "spotify_albums";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_spotify_albums_social_id_fkey";
            columns: ["social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
        ];
      };
      social_spotify_tracks: {
        Row: {
          id: string;
          social_id: string;
          track_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          social_id?: string;
          track_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          social_id?: string;
          track_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "social_spotify_tracks_social_id_fkey";
            columns: ["social_id"];
            isOneToOne: false;
            referencedRelation: "socials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_spotify_tracks_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "spotify_tracks";
            referencedColumns: ["id"];
          },
        ];
      };
      socials: {
        Row: {
          avatar: string | null;
          bio: string | null;
          followerCount: number | null;
          followingCount: number | null;
          id: string;
          profile_url: string;
          region: string | null;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar?: string | null;
          bio?: string | null;
          followerCount?: number | null;
          followingCount?: number | null;
          id?: string;
          profile_url: string;
          region?: string | null;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar?: string | null;
          bio?: string | null;
          followerCount?: number | null;
          followingCount?: number | null;
          id?: string;
          profile_url?: string;
          region?: string | null;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      song_artists: {
        Row: {
          artist: string;
          created_at: string;
          id: string;
          song: string;
          updated_at: string;
        };
        Insert: {
          artist: string;
          created_at?: string;
          id?: string;
          song: string;
          updated_at?: string;
        };
        Update: {
          artist?: string;
          created_at?: string;
          id?: string;
          song?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "song_artists_artist_fkey";
            columns: ["artist"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "song_artists_song_fkey";
            columns: ["song"];
            isOneToOne: false;
            referencedRelation: "songs";
            referencedColumns: ["isrc"];
          },
        ];
      };
      songs: {
        Row: {
          album: string | null;
          isrc: string;
          name: string | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          album?: string | null;
          isrc: string;
          name?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          album?: string | null;
          isrc?: string;
          name?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      spotify: {
        Row: {
          clientId: string | null;
          country: string | null;
          display_name: string | null;
          email: string | null;
          "explicit_content.filter_enabled": string | null;
          "explicit_content.filter_locked": string | null;
          "external_urls.spotify": Json | null;
          fanId: string | null;
          "fanId.country": string | null;
          "fanId.display_name": string | null;
          "fanId.email": string | null;
          "fanId.explicit_content.filter_enabled": string | null;
          "fanId.explicit_content.filter_locked": string | null;
          "fanId.external_urls.spotify": string | null;
          "fanId.followers.total": string | null;
          "fanId.href": string | null;
          "fanId.id": string | null;
          "fanId.images": string | null;
          "fanId.isNewFan": string | null;
          "fanId.playlist": string | null;
          "fanId.presavedData.clientId": string | null;
          "fanId.presavedData.country": string | null;
          "fanId.presavedData.display_name": string | null;
          "fanId.presavedData.email": string | null;
          "fanId.presavedData.explicit_content.filter_enabled": string | null;
          "fanId.presavedData.explicit_content.filter_locked": string | null;
          "fanId.presavedData.external_urls.spotify": string | null;
          "fanId.presavedData.followers.total": string | null;
          "fanId.presavedData.href": string | null;
          "fanId.presavedData.id": string | null;
          "fanId.presavedData.images": string | null;
          "fanId.presavedData.playlist": string | null;
          "fanId.presavedData.product": string | null;
          "fanId.presavedData.recentlyPlayed": string | null;
          "fanId.presavedData.timestamp": string | null;
          "fanId.presavedData.type": string | null;
          "fanId.presavedData.uri": string | null;
          "fanId.product": string | null;
          "fanId.timestamp": string | null;
          "fanId.type": string | null;
          "fanId.uri": string | null;
          "followers.total": Json | null;
          game: string | null;
          href: string | null;
          id: string | null;
          images: Json | null;
          playlist: Json | null;
          product: string | null;
          syncId: string | null;
          timestamp: string | null;
          type: string | null;
          uri: string | null;
        };
        Insert: {
          clientId?: string | null;
          country?: string | null;
          display_name?: string | null;
          email?: string | null;
          "explicit_content.filter_enabled"?: string | null;
          "explicit_content.filter_locked"?: string | null;
          "external_urls.spotify"?: Json | null;
          fanId?: string | null;
          "fanId.country"?: string | null;
          "fanId.display_name"?: string | null;
          "fanId.email"?: string | null;
          "fanId.explicit_content.filter_enabled"?: string | null;
          "fanId.explicit_content.filter_locked"?: string | null;
          "fanId.external_urls.spotify"?: string | null;
          "fanId.followers.total"?: string | null;
          "fanId.href"?: string | null;
          "fanId.id"?: string | null;
          "fanId.images"?: string | null;
          "fanId.isNewFan"?: string | null;
          "fanId.playlist"?: string | null;
          "fanId.presavedData.clientId"?: string | null;
          "fanId.presavedData.country"?: string | null;
          "fanId.presavedData.display_name"?: string | null;
          "fanId.presavedData.email"?: string | null;
          "fanId.presavedData.explicit_content.filter_enabled"?: string | null;
          "fanId.presavedData.explicit_content.filter_locked"?: string | null;
          "fanId.presavedData.external_urls.spotify"?: string | null;
          "fanId.presavedData.followers.total"?: string | null;
          "fanId.presavedData.href"?: string | null;
          "fanId.presavedData.id"?: string | null;
          "fanId.presavedData.images"?: string | null;
          "fanId.presavedData.playlist"?: string | null;
          "fanId.presavedData.product"?: string | null;
          "fanId.presavedData.recentlyPlayed"?: string | null;
          "fanId.presavedData.timestamp"?: string | null;
          "fanId.presavedData.type"?: string | null;
          "fanId.presavedData.uri"?: string | null;
          "fanId.product"?: string | null;
          "fanId.timestamp"?: string | null;
          "fanId.type"?: string | null;
          "fanId.uri"?: string | null;
          "followers.total"?: Json | null;
          game?: string | null;
          href?: string | null;
          id?: string | null;
          images?: Json | null;
          playlist?: Json | null;
          product?: string | null;
          syncId?: string | null;
          timestamp?: string | null;
          type?: string | null;
          uri?: string | null;
        };
        Update: {
          clientId?: string | null;
          country?: string | null;
          display_name?: string | null;
          email?: string | null;
          "explicit_content.filter_enabled"?: string | null;
          "explicit_content.filter_locked"?: string | null;
          "external_urls.spotify"?: Json | null;
          fanId?: string | null;
          "fanId.country"?: string | null;
          "fanId.display_name"?: string | null;
          "fanId.email"?: string | null;
          "fanId.explicit_content.filter_enabled"?: string | null;
          "fanId.explicit_content.filter_locked"?: string | null;
          "fanId.external_urls.spotify"?: string | null;
          "fanId.followers.total"?: string | null;
          "fanId.href"?: string | null;
          "fanId.id"?: string | null;
          "fanId.images"?: string | null;
          "fanId.isNewFan"?: string | null;
          "fanId.playlist"?: string | null;
          "fanId.presavedData.clientId"?: string | null;
          "fanId.presavedData.country"?: string | null;
          "fanId.presavedData.display_name"?: string | null;
          "fanId.presavedData.email"?: string | null;
          "fanId.presavedData.explicit_content.filter_enabled"?: string | null;
          "fanId.presavedData.explicit_content.filter_locked"?: string | null;
          "fanId.presavedData.external_urls.spotify"?: string | null;
          "fanId.presavedData.followers.total"?: string | null;
          "fanId.presavedData.href"?: string | null;
          "fanId.presavedData.id"?: string | null;
          "fanId.presavedData.images"?: string | null;
          "fanId.presavedData.playlist"?: string | null;
          "fanId.presavedData.product"?: string | null;
          "fanId.presavedData.recentlyPlayed"?: string | null;
          "fanId.presavedData.timestamp"?: string | null;
          "fanId.presavedData.type"?: string | null;
          "fanId.presavedData.uri"?: string | null;
          "fanId.product"?: string | null;
          "fanId.timestamp"?: string | null;
          "fanId.type"?: string | null;
          "fanId.uri"?: string | null;
          "followers.total"?: Json | null;
          game?: string | null;
          href?: string | null;
          id?: string | null;
          images?: Json | null;
          playlist?: Json | null;
          product?: string | null;
          syncId?: string | null;
          timestamp?: string | null;
          type?: string | null;
          uri?: string | null;
        };
        Relationships: [];
      };
      spotify_albums: {
        Row: {
          id: string;
          name: string | null;
          release_date: string | null;
          updated_at: string;
          uri: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          release_date?: string | null;
          updated_at?: string;
          uri: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          release_date?: string | null;
          updated_at?: string;
          uri?: string;
        };
        Relationships: [];
      };
      spotify_analytics_albums: {
        Row: {
          analysis_id: string | null;
          artist_name: string | null;
          created_at: string;
          id: string;
          name: string | null;
          release_date: number | null;
          uri: string | null;
        };
        Insert: {
          analysis_id?: string | null;
          artist_name?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          release_date?: number | null;
          uri?: string | null;
        };
        Update: {
          analysis_id?: string | null;
          artist_name?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          release_date?: number | null;
          uri?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "spotify_analytics_albums_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "funnel_analytics";
            referencedColumns: ["id"];
          },
        ];
      };
      spotify_analytics_tracks: {
        Row: {
          analysis_id: string | null;
          artist_name: string | null;
          created_at: string;
          id: string;
          name: string | null;
          popularity: number | null;
          uri: string | null;
        };
        Insert: {
          analysis_id?: string | null;
          artist_name?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          popularity?: number | null;
          uri?: string | null;
        };
        Update: {
          analysis_id?: string | null;
          artist_name?: string | null;
          created_at?: string;
          id?: string;
          name?: string | null;
          popularity?: number | null;
          uri?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "spotify_analytics_tracks_analysis_id_fkey";
            columns: ["analysis_id"];
            isOneToOne: false;
            referencedRelation: "funnel_analytics";
            referencedColumns: ["id"];
          },
        ];
      };
      spotify_login_button_clicked: {
        Row: {
          campaignId: string | null;
          clientId: string | null;
          fanId: string | null;
          game: string | null;
          id: string | null;
          timestamp: number | null;
        };
        Insert: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Update: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string | null;
          timestamp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "spotify_login_button_clicked_campaignId_fkey";
            columns: ["campaignId"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      spotify_play_button_clicked: {
        Row: {
          campaignId: string | null;
          clientId: string | null;
          fanId: string | null;
          game: string | null;
          id: string;
          isPremium: boolean | null;
          timestamp: number | null;
        };
        Insert: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string;
          isPremium?: boolean | null;
          timestamp?: number | null;
        };
        Update: {
          campaignId?: string | null;
          clientId?: string | null;
          fanId?: string | null;
          game?: string | null;
          id?: string;
          isPremium?: boolean | null;
          timestamp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "spotify_play_button_clicked_campaignId_fkey";
            columns: ["campaignId"];
            isOneToOne: false;
            referencedRelation: "campaigns";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "spotify_play_button_clicked_fanId_fkey";
            columns: ["fanId"];
            isOneToOne: false;
            referencedRelation: "fans";
            referencedColumns: ["id"];
          },
        ];
      };
      spotify_tracks: {
        Row: {
          id: string;
          name: string | null;
          popularity: number | null;
          updated_at: string;
          uri: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          popularity?: number | null;
          updated_at?: string;
          uri: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          popularity?: number | null;
          updated_at?: string;
          uri?: string;
        };
        Relationships: [];
      };
      subscription_items: {
        Row: {
          created_at: string;
          id: string;
          interval: string;
          interval_count: number;
          price_amount: number | null;
          product_id: string;
          quantity: number;
          subscription_id: string;
          type: Database["public"]["Enums"]["subscription_item_type"];
          updated_at: string;
          variant_id: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          interval: string;
          interval_count: number;
          price_amount?: number | null;
          product_id: string;
          quantity?: number;
          subscription_id: string;
          type: Database["public"]["Enums"]["subscription_item_type"];
          updated_at?: string;
          variant_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          interval?: string;
          interval_count?: number;
          price_amount?: number | null;
          product_id?: string;
          quantity?: number;
          subscription_id?: string;
          type?: Database["public"]["Enums"]["subscription_item_type"];
          updated_at?: string;
          variant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_items_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          account_id: string;
          active: boolean;
          billing_customer_id: number;
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          cancel_at_period_end: boolean;
          created_at: string;
          currency: string;
          id: string;
          period_ends_at: string;
          period_starts_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          trial_starts_at: string | null;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          active: boolean;
          billing_customer_id: number;
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          cancel_at_period_end: boolean;
          created_at?: string;
          currency: string;
          id: string;
          period_ends_at: string;
          period_starts_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          trial_starts_at?: string | null;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          active?: boolean;
          billing_customer_id?: number;
          billing_provider?: Database["public"]["Enums"]["billing_provider"];
          cancel_at_period_end?: boolean;
          created_at?: string;
          currency?: string;
          id?: string;
          period_ends_at?: string;
          period_starts_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          trial_starts_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_billing_customer_id_fkey";
            columns: ["billing_customer_id"];
            isOneToOne: false;
            referencedRelation: "billing_customers";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          account_id: string;
          created_at: string;
          description: string | null;
          done: boolean;
          id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          description?: string | null;
          done?: boolean;
          id?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          description?: string | null;
          done?: boolean;
          id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      test_emails: {
        Row: {
          created_at: string;
          email: string | null;
          id: number;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id?: number;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      youtube_tokens: {
        Row: {
          access_token: string;
          artist_account_id: string;
          created_at: string;
          expires_at: string;
          id: string;
          refresh_token: string | null;
          updated_at: string;
        };
        Insert: {
          access_token: string;
          artist_account_id: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          refresh_token?: string | null;
          updated_at?: string;
        };
        Update: {
          access_token?: string;
          artist_account_id?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          refresh_token?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "youtube_tokens_artist_account_id_fkey";
            columns: ["artist_account_id"];
            isOneToOne: true;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invitation: {
        Args: { token: string; user_id: string };
        Returns: string;
      };
      add_invitations_to_account: {
        Args: {
          account_slug: string;
          invitations: Database["public"]["CompositeTypes"]["invitation"][];
        };
        Returns: Database["public"]["Tables"]["invitations"]["Row"][];
      };
      can_action_account_member: {
        Args: { target_team_account_id: string; target_user_id: string };
        Returns: boolean;
      };
      count_reports_by_day: {
        Args: { end_date: string; start_date: string };
        Returns: {
          count: number;
          date_key: string;
        }[];
      };
      count_reports_by_month: {
        Args: { end_date: string; start_date: string };
        Returns: {
          count: number;
          date_key: string;
        }[];
      };
      count_reports_by_week: {
        Args: { end_date: string; start_date: string };
        Returns: {
          count: number;
          date_key: string;
        }[];
      };
      create_invitation: {
        Args: { account_id: string; email: string; role: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "invitations";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      deduct_credits: {
        Args: { account_id: string; amount: number };
        Returns: undefined;
      };
      extract_domain: { Args: { email: string }; Returns: string };
      get_account_invitations: {
        Args: { account_slug: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invited_by: string;
          inviter_email: string;
          inviter_name: string;
          role: string;
          updated_at: string;
        }[];
      };
      get_account_members: {
        Args: { account_slug: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          id: string;
          name: string;
          picture_url: string;
          primary_owner_user_id: string;
          role: string;
          role_hierarchy_level: number;
          updated_at: string;
          user_id: string;
        }[];
      };
      get_campaign:
        | { Args: { clientid: string }; Returns: Json }
        | {
            Args: { artistid: string; campaignid: string; email: string };
            Returns: Json;
          };
      get_campaign_fans: {
        Args: { artistid: string; email: string };
        Returns: Json;
      };
      get_config: { Args: never; Returns: Json };
      get_fans_listening_top_songs: {
        Args: { artistid: string; email: string };
        Returns: Json;
      };
      get_message_counts_by_user:
        | {
            Args: { start_date: string };
            Returns: {
              account_email: string;
              message_count: number;
            }[];
          }
        | {
            Args: { end_date: string; start_date: string };
            Returns: {
              account_email: string;
              message_count: number;
            }[];
          };
      get_rooms_created_by_user: {
        Args: { start_date: string };
        Returns: {
          account_email: string;
          rooms_created: number;
        }[];
      };
      get_segment_reports_by_user: {
        Args: { start_date: string };
        Returns: {
          email: string;
          segment_report_count: number;
        }[];
      };
      get_upper_system_role: { Args: never; Returns: string };
      has_active_subscription: {
        Args: { target_account_id: string };
        Returns: boolean;
      };
      has_credits: { Args: { account_id: string }; Returns: boolean };
      has_more_elevated_role: {
        Args: {
          role_name: string;
          target_account_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      has_permission: {
        Args: {
          account_id: string;
          permission_name: Database["public"]["Enums"]["app_permissions"];
          user_id: string;
        };
        Returns: boolean;
      };
      has_role_on_account: {
        Args: { account_id: string; account_role?: string };
        Returns: boolean;
      };
      has_same_role_hierarchy_level: {
        Args: {
          role_name: string;
          target_account_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      is_account_owner: { Args: { account_id: string }; Returns: boolean };
      is_account_team_member: {
        Args: { target_account_id: string };
        Returns: boolean;
      };
      is_set: { Args: { field_name: string }; Returns: boolean };
      is_team_member: {
        Args: { account_id: string; user_id: string };
        Returns: boolean;
      };
      team_account_workspace: {
        Args: { account_slug: string };
        Returns: {
          id: string;
          name: string;
          permissions: Database["public"]["Enums"]["app_permissions"][];
          picture_url: string;
          primary_owner_user_id: string;
          role: string;
          role_hierarchy_level: number;
          slug: string;
          subscription_status: Database["public"]["Enums"]["subscription_status"];
        }[];
      };
      transfer_team_account_ownership: {
        Args: { new_owner_id: string; target_account_id: string };
        Returns: undefined;
      };
      upsert_order: {
        Args: {
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          currency: string;
          line_items: Json;
          status: Database["public"]["Enums"]["payment_status"];
          target_account_id: string;
          target_customer_id: string;
          target_order_id: string;
          total_amount: number;
        };
        Returns: {
          account_id: string;
          billing_customer_id: number;
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          created_at: string;
          currency: string;
          id: string;
          status: Database["public"]["Enums"]["payment_status"];
          total_amount: number;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "orders";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      upsert_subscription: {
        Args: {
          active: boolean;
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          cancel_at_period_end: boolean;
          currency: string;
          line_items: Json;
          period_ends_at: string;
          period_starts_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          target_account_id: string;
          target_customer_id: string;
          target_subscription_id: string;
          trial_ends_at?: string;
          trial_starts_at?: string;
        };
        Returns: {
          account_id: string;
          active: boolean;
          billing_customer_id: number;
          billing_provider: Database["public"]["Enums"]["billing_provider"];
          cancel_at_period_end: boolean;
          created_at: string;
          currency: string;
          id: string;
          period_ends_at: string;
          period_starts_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          trial_starts_at: string | null;
          updated_at: string;
        };
        SetofOptions: {
          from: "*";
          to: "subscriptions";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      app_permissions:
        | "roles.manage"
        | "billing.manage"
        | "settings.manage"
        | "members.manage"
        | "invites.manage"
        | "tasks.write"
        | "tasks.delete";
      billing_provider: "stripe" | "lemon-squeezy" | "paddle";
      chat_role: "user" | "assistant";
      notification_channel: "in_app" | "email";
      notification_type: "info" | "warning" | "error";
      payment_status: "pending" | "succeeded" | "failed";
      social_type: "TIKTOK" | "YOUTUBE" | "INSTAGRAM" | "TWITTER" | "SPOTIFY" | "APPLE";
      subscription_item_type: "flat" | "per_seat" | "metered";
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused";
    };
    CompositeTypes: {
      invitation: {
        email: string | null;
        role: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_permissions: [
        "roles.manage",
        "billing.manage",
        "settings.manage",
        "members.manage",
        "invites.manage",
        "tasks.write",
        "tasks.delete",
      ],
      billing_provider: ["stripe", "lemon-squeezy", "paddle"],
      chat_role: ["user", "assistant"],
      notification_channel: ["in_app", "email"],
      notification_type: ["info", "warning", "error"],
      payment_status: ["pending", "succeeded", "failed"],
      social_type: ["TIKTOK", "YOUTUBE", "INSTAGRAM", "TWITTER", "SPOTIFY", "APPLE"],
      subscription_item_type: ["flat", "per_seat", "metered"],
      subscription_status: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
      ],
    },
  },
} as const;
