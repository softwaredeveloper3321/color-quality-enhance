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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accessibility_compliance: {
        Row: {
          alt_text_pass: boolean | null
          auditor_notes: string | null
          color_contrast_pass: boolean | null
          created_at: string | null
          id: string
          issues_found: number | null
          issues_resolved: number | null
          keyboard_nav_pass: boolean | null
          language_support: string[] | null
          last_audit_date: string | null
          page_url: string | null
          screen_reader_pass: boolean | null
          status: string | null
          wcag_level: string | null
        }
        Insert: {
          alt_text_pass?: boolean | null
          auditor_notes?: string | null
          color_contrast_pass?: boolean | null
          created_at?: string | null
          id?: string
          issues_found?: number | null
          issues_resolved?: number | null
          keyboard_nav_pass?: boolean | null
          language_support?: string[] | null
          last_audit_date?: string | null
          page_url?: string | null
          screen_reader_pass?: boolean | null
          status?: string | null
          wcag_level?: string | null
        }
        Update: {
          alt_text_pass?: boolean | null
          auditor_notes?: string | null
          color_contrast_pass?: boolean | null
          created_at?: string | null
          id?: string
          issues_found?: number | null
          issues_resolved?: number | null
          keyboard_nav_pass?: boolean | null
          language_support?: string[] | null
          last_audit_date?: string | null
          page_url?: string | null
          screen_reader_pass?: boolean | null
          status?: string | null
          wcag_level?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          badge: string
          created_at: string
          ends_at: string | null
          gradient: string
          icon_name: string
          id: string
          position: number
          starts_at: string | null
          text: string
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          badge?: string
          created_at?: string
          ends_at?: string | null
          gradient?: string
          icon_name?: string
          id?: string
          position?: number
          starts_at?: string | null
          text?: string
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          badge?: string
          created_at?: string
          ends_at?: string | null
          gradient?: string
          icon_name?: string
          id?: string
          position?: number
          starts_at?: string | null
          text?: string
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      applications: {
        Row: {
          applicant_name: string
          author_id: string | null
          country: string | null
          created_at: string
          decided_at: string | null
          email: string
          id: string
          notes: string | null
          reviewer_email: string | null
          stage: Database["public"]["Enums"]["application_stage"]
          submitted_at: string
          updated_at: string
        }
        Insert: {
          applicant_name: string
          author_id?: string | null
          country?: string | null
          created_at?: string
          decided_at?: string | null
          email: string
          id?: string
          notes?: string | null
          reviewer_email?: string | null
          stage?: Database["public"]["Enums"]["application_stage"]
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          author_id?: string | null
          country?: string | null
          created_at?: string
          decided_at?: string | null
          email?: string
          id?: string
          notes?: string | null
          reviewer_email?: string | null
          stage?: Database["public"]["Enums"]["application_stage"]
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
          severity: string
          summary: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          severity?: string
          summary: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
          severity?: string
          summary?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string | null
          id: string
          meta_json: Json | null
          module: string | null
          role: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          id?: string
          meta_json?: Json | null
          module?: string | null
          role?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          id?: string
          meta_json?: Json | null
          module?: string | null
          role?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_gate_events: {
        Row: {
          email: string | null
          id: string
          ip: string | null
          message: string | null
          occurred_at: string
          state: string
          status_code: number | null
          user_agent: string | null
          user_id: string | null
          wall_route: string
        }
        Insert: {
          email?: string | null
          id?: string
          ip?: string | null
          message?: string | null
          occurred_at?: string
          state: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
          wall_route: string
        }
        Update: {
          email?: string | null
          id?: string
          ip?: string | null
          message?: string | null
          occurred_at?: string
          state?: string
          status_code?: number | null
          user_agent?: string | null
          user_id?: string | null
          wall_route?: string
        }
        Relationships: []
      }
      auth_qr_sessions: {
        Row: {
          approved_email: string | null
          created_at: string
          expires_at: string
          id: string
          status: string
          token: string
          user_id: string | null
        }
        Insert: {
          approved_email?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
          token: string
          user_id?: string | null
        }
        Update: {
          approved_email?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          status?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      authors: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          email: string
          health_score: number
          id: string
          joined_at: string
          name: string
          products_count: number
          rating: number | null
          revenue: number
          risk_score: number
          royalties: number
          status: Database["public"]["Enums"]["author_status"]
          updated_at: string
          verified: boolean
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          email: string
          health_score?: number
          id?: string
          joined_at?: string
          name: string
          products_count?: number
          rating?: number | null
          revenue?: number
          risk_score?: number
          royalties?: number
          status?: Database["public"]["Enums"]["author_status"]
          updated_at?: string
          verified?: boolean
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string
          health_score?: number
          id?: string
          joined_at?: string
          name?: string
          products_count?: number
          rating?: number | null
          revenue?: number
          risk_score?: number
          royalties?: number
          status?: Database["public"]["Enums"]["author_status"]
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      business_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      demo_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_taken: string | null
          alert_type: string | null
          created_at: string | null
          demo_id: string | null
          escalated_to: string[] | null
          id: string
          is_active: boolean | null
          message: string | null
          requires_action: boolean | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_taken?: string | null
          alert_type?: string | null
          created_at?: string | null
          demo_id?: string | null
          escalated_to?: string[] | null
          id?: string
          is_active?: boolean | null
          message?: string | null
          requires_action?: boolean | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_taken?: string | null
          alert_type?: string | null
          created_at?: string | null
          demo_id?: string | null
          escalated_to?: string[] | null
          id?: string
          is_active?: boolean | null
          message?: string | null
          requires_action?: boolean | null
        }
        Relationships: []
      }
      demo_analytics: {
        Row: {
          avg_duration_seconds: number | null
          bounce_rate: number | null
          conversion_count: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string | null
          demo_id: string | null
          device_breakdown: Json | null
          id: string
          region_breakdown: Json | null
          top_pages: Json | null
          total_views: number | null
          unique_views: number | null
        }
        Insert: {
          avg_duration_seconds?: number | null
          bounce_rate?: number | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string | null
          demo_id?: string | null
          device_breakdown?: Json | null
          id?: string
          region_breakdown?: Json | null
          top_pages?: Json | null
          total_views?: number | null
          unique_views?: number | null
        }
        Update: {
          avg_duration_seconds?: number | null
          bounce_rate?: number | null
          conversion_count?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string | null
          demo_id?: string | null
          device_breakdown?: Json | null
          id?: string
          region_breakdown?: Json | null
          top_pages?: Json | null
          total_views?: number | null
          unique_views?: number | null
        }
        Relationships: []
      }
      demo_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string | null
        }
        Relationships: []
      }
      demo_clicks: {
        Row: {
          browser: string | null
          city: string | null
          clicked_at: string | null
          converted: boolean | null
          country: string | null
          demo_id: string | null
          device_type: string | null
          franchise_id: string | null
          id: string
          ip_address: string | null
          referrer: string | null
          region: string | null
          reseller_id: string | null
          session_duration: number | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          clicked_at?: string | null
          converted?: boolean | null
          country?: string | null
          demo_id?: string | null
          device_type?: string | null
          franchise_id?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          region?: string | null
          reseller_id?: string | null
          session_duration?: number | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          clicked_at?: string | null
          converted?: boolean | null
          country?: string | null
          demo_id?: string | null
          device_type?: string | null
          franchise_id?: string | null
          id?: string
          ip_address?: string | null
          referrer?: string | null
          region?: string | null
          reseller_id?: string | null
          session_duration?: number | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      demo_deployments: {
        Row: {
          approved_domain: string | null
          approved_ips: string[] | null
          blocked_attempts: number | null
          created_at: string | null
          created_by: string | null
          daily_demo_id: string | null
          demo_id: string | null
          deployment_status: string | null
          encryption_key_ref: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_domain_locked: boolean | null
          is_encrypted: boolean | null
          is_obfuscated: boolean | null
          last_verification_at: string | null
          license_key: string | null
          license_key_hash: string | null
          order_id: string | null
          verification_count: number | null
        }
        Insert: {
          approved_domain?: string | null
          approved_ips?: string[] | null
          blocked_attempts?: number | null
          created_at?: string | null
          created_by?: string | null
          daily_demo_id?: string | null
          demo_id?: string | null
          deployment_status?: string | null
          encryption_key_ref?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_domain_locked?: boolean | null
          is_encrypted?: boolean | null
          is_obfuscated?: boolean | null
          last_verification_at?: string | null
          license_key?: string | null
          license_key_hash?: string | null
          order_id?: string | null
          verification_count?: number | null
        }
        Update: {
          approved_domain?: string | null
          approved_ips?: string[] | null
          blocked_attempts?: number | null
          created_at?: string | null
          created_by?: string | null
          daily_demo_id?: string | null
          demo_id?: string | null
          deployment_status?: string | null
          encryption_key_ref?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_domain_locked?: boolean | null
          is_encrypted?: boolean | null
          is_obfuscated?: boolean | null
          last_verification_at?: string | null
          license_key?: string | null
          license_key_hash?: string | null
          order_id?: string | null
          verification_count?: number | null
        }
        Relationships: []
      }
      demo_escalations: {
        Row: {
          acknowledged_at: string | null
          alert_id: string | null
          auto_escalated: boolean | null
          created_at: string | null
          demo_id: string | null
          escalated_to_role: string | null
          escalated_to_user: string | null
          escalation_level: number | null
          id: string
          reason: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          alert_id?: string | null
          auto_escalated?: boolean | null
          created_at?: string | null
          demo_id?: string | null
          escalated_to_role?: string | null
          escalated_to_user?: string | null
          escalation_level?: number | null
          id?: string
          reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          alert_id?: string | null
          auto_escalated?: boolean | null
          created_at?: string | null
          demo_id?: string | null
          escalated_to_role?: string | null
          escalated_to_user?: string | null
          escalation_level?: number | null
          id?: string
          reason?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      demo_health: {
        Row: {
          checked_at: string | null
          demo_id: string | null
          error_message: string | null
          id: string
          response_time: number | null
          status: string | null
        }
        Insert: {
          checked_at?: string | null
          demo_id?: string | null
          error_message?: string | null
          id?: string
          response_time?: number | null
          status?: string | null
        }
        Update: {
          checked_at?: string | null
          demo_id?: string | null
          error_message?: string | null
          id?: string
          response_time?: number | null
          status?: string | null
        }
        Relationships: []
      }
      demo_login_credentials: {
        Row: {
          created_at: string | null
          demo_id: string | null
          id: string
          is_active: boolean | null
          login_url: string | null
          notes: string | null
          password: string | null
          role_type: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          demo_id?: string | null
          id?: string
          is_active?: boolean | null
          login_url?: string | null
          notes?: string | null
          password?: string | null
          role_type?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          demo_id?: string | null
          id?: string
          is_active?: boolean | null
          login_url?: string | null
          notes?: string | null
          password?: string | null
          role_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
      demo_login_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          demo_id: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          password_encrypted: string | null
          role_name: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          demo_id?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          password_encrypted?: string | null
          role_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          demo_id?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          password_encrypted?: string | null
          role_name?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      demo_renewal_logs: {
        Row: {
          auto_renewed: boolean | null
          created_at: string | null
          demo_id: string | null
          id: string
          new_expiry: string | null
          notes: string | null
          previous_expiry: string | null
          renewed_by: string | null
        }
        Insert: {
          auto_renewed?: boolean | null
          created_at?: string | null
          demo_id?: string | null
          id?: string
          new_expiry?: string | null
          notes?: string | null
          previous_expiry?: string | null
          renewed_by?: string | null
        }
        Update: {
          auto_renewed?: boolean | null
          created_at?: string | null
          demo_id?: string | null
          id?: string
          new_expiry?: string | null
          notes?: string | null
          previous_expiry?: string | null
          renewed_by?: string | null
        }
        Relationships: []
      }
      demo_report_cards: {
        Row: {
          action_timestamp: string | null
          action_type: string | null
          auto_registered: boolean | null
          completion_time_seconds: number | null
          created_at: string | null
          demo_id: string | null
          demo_name: string | null
          demo_status: string | null
          error_details: string | null
          fix_details: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          performed_by_role: string | null
          sector: string | null
          sub_category: string | null
          uptime_state: string | null
          workflow_status: string | null
        }
        Insert: {
          action_timestamp?: string | null
          action_type?: string | null
          auto_registered?: boolean | null
          completion_time_seconds?: number | null
          created_at?: string | null
          demo_id?: string | null
          demo_name?: string | null
          demo_status?: string | null
          error_details?: string | null
          fix_details?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          performed_by_role?: string | null
          sector?: string | null
          sub_category?: string | null
          uptime_state?: string | null
          workflow_status?: string | null
        }
        Update: {
          action_timestamp?: string | null
          action_type?: string | null
          auto_registered?: boolean | null
          completion_time_seconds?: number | null
          created_at?: string | null
          demo_id?: string | null
          demo_name?: string | null
          demo_status?: string | null
          error_details?: string | null
          fix_details?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          performed_by_role?: string | null
          sector?: string | null
          sub_category?: string | null
          uptime_state?: string | null
          workflow_status?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          client_email: string | null
          client_name: string | null
          company_name: string | null
          created_at: string | null
          id: string
          interested_category: string | null
          message: string | null
          notes: string | null
          phone: string | null
          responded_at: string | null
          responded_by: string | null
          status: string | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          interested_category?: string | null
          message?: string | null
          notes?: string | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          interested_category?: string | null
          message?: string | null
          notes?: string | null
          phone?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      demo_url_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          demo_url_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          demo_url_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          demo_url_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      demo_validation_logs: {
        Row: {
          created_at: string | null
          demo_id: string | null
          demo_url: string | null
          error_message: string | null
          http_status: number | null
          id: string
          response_time_ms: number | null
          status: string | null
          validated_at: string | null
          validated_by: string | null
          validation_type: string | null
        }
        Insert: {
          created_at?: string | null
          demo_id?: string | null
          demo_url?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          response_time_ms?: number | null
          status?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_type?: string | null
        }
        Update: {
          created_at?: string | null
          demo_id?: string | null
          demo_url?: string | null
          error_message?: string | null
          http_status?: number | null
          id?: string
          response_time_ms?: number | null
          status?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_type?: string | null
        }
        Relationships: []
      }
      demos: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          ai_category_suggestion: string | null
          ai_tech_suggestion: string | null
          backup_url: string | null
          category: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          demo_banner_text: string | null
          demo_type: string | null
          description: string | null
          disable_destructive: boolean | null
          disable_exports: boolean | null
          expiry_date: string | null
          health_check_interval: number | null
          health_score: number | null
          http_status: number | null
          id: string
          is_bulk_created: boolean | null
          is_trending: boolean | null
          last_health_check: string | null
          last_verified_at: string | null
          lifecycle_status: string | null
          login_url: string | null
          masked_url: string | null
          max_concurrent_logins: number | null
          multi_login_enabled: boolean | null
          normalized_url: string | null
          renewal_date: string | null
          response_time_ms: number | null
          status: string | null
          tech_stack: string | null
          technology_id: string | null
          title: string | null
          total_login_roles: number | null
          updated_at: string | null
          uptime_percentage: number | null
          url: string | null
          verification_status: string | null
          video_fallback_url: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          ai_category_suggestion?: string | null
          ai_tech_suggestion?: string | null
          backup_url?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_banner_text?: string | null
          demo_type?: string | null
          description?: string | null
          disable_destructive?: boolean | null
          disable_exports?: boolean | null
          expiry_date?: string | null
          health_check_interval?: number | null
          health_score?: number | null
          http_status?: number | null
          id?: string
          is_bulk_created?: boolean | null
          is_trending?: boolean | null
          last_health_check?: string | null
          last_verified_at?: string | null
          lifecycle_status?: string | null
          login_url?: string | null
          masked_url?: string | null
          max_concurrent_logins?: number | null
          multi_login_enabled?: boolean | null
          normalized_url?: string | null
          renewal_date?: string | null
          response_time_ms?: number | null
          status?: string | null
          tech_stack?: string | null
          technology_id?: string | null
          title?: string | null
          total_login_roles?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
          url?: string | null
          verification_status?: string | null
          video_fallback_url?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          ai_category_suggestion?: string | null
          ai_tech_suggestion?: string | null
          backup_url?: string | null
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_banner_text?: string | null
          demo_type?: string | null
          description?: string | null
          disable_destructive?: boolean | null
          disable_exports?: boolean | null
          expiry_date?: string | null
          health_check_interval?: number | null
          health_score?: number | null
          http_status?: number | null
          id?: string
          is_bulk_created?: boolean | null
          is_trending?: boolean | null
          last_health_check?: string | null
          last_verified_at?: string | null
          lifecycle_status?: string | null
          login_url?: string | null
          masked_url?: string | null
          max_concurrent_logins?: number | null
          multi_login_enabled?: boolean | null
          normalized_url?: string | null
          renewal_date?: string | null
          response_time_ms?: number | null
          status?: string | null
          tech_stack?: string | null
          technology_id?: string | null
          title?: string | null
          total_login_roles?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
          url?: string | null
          verification_status?: string | null
          video_fallback_url?: string | null
        }
        Relationships: []
      }
      feature_strip_items: {
        Row: {
          color_class: string
          created_at: string
          icon_name: string
          id: string
          label: string
          position: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          color_class?: string
          created_at?: string
          icon_name?: string
          id?: string
          label: string
          position?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          color_class?: string
          created_at?: string
          icon_name?: string
          id?: string
          label?: string
          position?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      home_hero_slides: {
        Row: {
          accent: string
          created_at: string
          cta_link: string
          cta_primary: string
          cta_secondary: string
          gradient: string
          highlight: string
          icon_name: string
          id: string
          kicker: string
          position: number
          published_at: string | null
          slug: string
          subtitle: string
          title: string
          unpublish_at: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          accent: string
          created_at?: string
          cta_link?: string
          cta_primary: string
          cta_secondary: string
          gradient: string
          highlight?: string
          icon_name: string
          id?: string
          kicker: string
          position?: number
          published_at?: string | null
          slug: string
          subtitle: string
          title: string
          unpublish_at?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          accent?: string
          created_at?: string
          cta_link?: string
          cta_primary?: string
          cta_secondary?: string
          gradient?: string
          highlight?: string
          icon_name?: string
          id?: string
          kicker?: string
          position?: number
          published_at?: string | null
          slug?: string
          subtitle?: string
          title?: string
          unpublish_at?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          id: string
          label: string
          position: number
          section_key: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          position?: number
          section_key: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          position?: number
          section_key?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      license_keys: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          last_used_at: string | null
          license_key: string
          plan: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          license_key: string
          plan?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          license_key?: string
          plan?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      marketplace_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_key: string | null
          is_featured: boolean
          is_hidden: boolean
          name: string
          seo: Json
          slug: string
          sort_order: number
          tone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_key?: string | null
          is_featured?: boolean
          is_hidden?: boolean
          name: string
          seo?: Json
          slug: string
          sort_order?: number
          tone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_key?: string | null
          is_featured?: boolean
          is_hidden?: boolean
          name?: string
          seo?: Json
          slug?: string
          sort_order?: number
          tone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_homepage_sections: {
        Row: {
          config: Json
          created_at: string
          enabled: boolean
          id: string
          key: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          badge: string | null
          category_id: string | null
          created_at: string
          downloads: number
          downloads_label: string | null
          icon: string | null
          id: string
          industry_label: string | null
          is_ai: boolean
          is_best_seller: boolean
          is_featured: boolean
          is_new_release: boolean
          is_trending: boolean
          name: string
          price_label: string
          price_period: string | null
          publish_at: string | null
          rating: number
          slug: string
          sort_order: number
          unpublish_at: string | null
          updated_at: string
          visible: boolean
        }
        Insert: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          downloads?: number
          downloads_label?: string | null
          icon?: string | null
          id?: string
          industry_label?: string | null
          is_ai?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new_release?: boolean
          is_trending?: boolean
          name: string
          price_label?: string
          price_period?: string | null
          publish_at?: string | null
          rating?: number
          slug: string
          sort_order?: number
          unpublish_at?: string | null
          updated_at?: string
          visible?: boolean
        }
        Update: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          downloads?: number
          downloads_label?: string | null
          icon?: string | null
          id?: string
          industry_label?: string | null
          is_ai?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new_release?: boolean
          is_trending?: boolean
          name?: string
          price_label?: string
          price_period?: string | null
          publish_at?: string | null
          rating?: number
          slug?: string
          sort_order?: number
          unpublish_at?: string | null
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_vendors: {
        Row: {
          country: string | null
          created_at: string
          id: string
          name: string
          product_count: number
          rating: number
          slug: string
          updated_at: string
          verified: boolean
          visible: boolean
        }
        Insert: {
          country?: string | null
          created_at?: string
          id?: string
          name: string
          product_count?: number
          rating?: number
          slug: string
          updated_at?: string
          verified?: boolean
          visible?: boolean
        }
        Update: {
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          product_count?: number
          rating?: number
          slug?: string
          updated_at?: string
          verified?: boolean
          visible?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      product_action_logs: {
        Row: {
          action: string | null
          action_details: Json | null
          created_at: string | null
          id: string
          performed_by: string | null
          performer_role: string | null
          product_id: string | null
          product_name: string | null
        }
        Insert: {
          action?: string | null
          action_details?: Json | null
          created_at?: string | null
          id?: string
          performed_by?: string | null
          performer_role?: string | null
          product_id?: string | null
          product_name?: string | null
        }
        Update: {
          action?: string | null
          action_details?: Json | null
          created_at?: string | null
          id?: string
          performed_by?: string | null
          performer_role?: string | null
          product_id?: string | null
          product_name?: string | null
        }
        Relationships: []
      }
      product_demo_mappings: {
        Row: {
          demo_id: string | null
          id: string
          linked_at: string | null
          linked_by: string | null
          product_id: string | null
        }
        Insert: {
          demo_id?: string | null
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          product_id?: string | null
        }
        Update: {
          demo_id?: string | null
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          product_id?: string | null
        }
        Relationships: []
      }
      product_demo_urls: {
        Row: {
          created_at: string
          demo_name: string
          description: string | null
          environment: string
          id: string
          last_checked_at: string | null
          last_http_status: number | null
          last_response_ms: number | null
          last_result: string
          password: string | null
          product_id: string | null
          role_name: string
          sort_order: number
          ssl_valid: boolean | null
          status: string
          updated_at: string
          url: string
          username: string | null
        }
        Insert: {
          created_at?: string
          demo_name: string
          description?: string | null
          environment?: string
          id?: string
          last_checked_at?: string | null
          last_http_status?: number | null
          last_response_ms?: number | null
          last_result?: string
          password?: string | null
          product_id?: string | null
          role_name?: string
          sort_order?: number
          ssl_valid?: boolean | null
          status?: string
          updated_at?: string
          url: string
          username?: string | null
        }
        Update: {
          created_at?: string
          demo_name?: string
          description?: string | null
          environment?: string
          id?: string
          last_checked_at?: string | null
          last_http_status?: number | null
          last_response_ms?: number | null
          last_result?: string
          password?: string | null
          product_id?: string | null
          role_name?: string
          sort_order?: number
          ssl_valid?: boolean | null
          status?: string
          updated_at?: string
          url?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_demo_urls_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_versions: {
        Row: {
          changelog: string
          id: string
          product_id: string
          released_at: string
          status: string
          version: string
        }
        Insert: {
          changelog?: string
          id?: string
          product_id: string
          released_at?: string
          status?: string
          version: string
        }
        Update: {
          changelog?: string
          id?: string
          product_id?: string
          released_at?: string
          status?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_versions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          abuse_reported: boolean | null
          additional_files: Json | null
          author_id: string | null
          blog_url: string | null
          business_category_id: string | null
          canonical_url: string | null
          category: string
          changelog: string | null
          compatibility: string[] | null
          conversion_count: number | null
          coupon_code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          demo_click_count: number | null
          demo_credentials: Json | null
          demo_embed: string | null
          demo_type: string | null
          demo_url: string | null
          demo_video_url: string | null
          description: string | null
          difficulty_level: string | null
          discount_price: number | null
          documentation_url: string | null
          downloads: number
          dynamic_pricing: Json | null
          feature_list: string[] | null
          featured_rank: number | null
          features_json: Json | null
          gallery_urls: string[] | null
          has_broken_demo: boolean | null
          id: string
          industry_tags: string[] | null
          installation_guide: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_free: boolean | null
          is_new: boolean | null
          is_subscription: boolean | null
          keywords: string[] | null
          last_updated_at: string | null
          license_tier: string | null
          license_type: string | null
          lifetime_price: number | null
          main_file_url: string | null
          manual_rank: number | null
          meta_description: string | null
          meta_title: string | null
          monthly_price: number | null
          name: string
          og_description: string | null
          og_image: string | null
          og_title: string | null
          popular_score: number | null
          preview_urls: string[] | null
          price: number
          pricing_model: string | null
          product_id: string | null
          product_name: string | null
          product_type: string | null
          rating: number | null
          release_notes: string | null
          requirements: string | null
          review_flagged: boolean | null
          search_keywords: string[] | null
          sections_json: Json | null
          short_description: string | null
          slug: string | null
          status: string
          subcategory_id: string | null
          support_response_time: string | null
          support_url: string | null
          synonyms: string[] | null
          tags: string[] | null
          tech_stack: string | null
          tech_stack_tags: string[] | null
          thumbnail_url: string | null
          trending: boolean | null
          type: string
          updated_at: string
          use_case_tags: string[] | null
          verified_author: boolean | null
          version: string
          video_thumbnail_url: string | null
          view_count: number | null
        }
        Insert: {
          abuse_reported?: boolean | null
          additional_files?: Json | null
          author_id?: string | null
          blog_url?: string | null
          business_category_id?: string | null
          canonical_url?: string | null
          category?: string
          changelog?: string | null
          compatibility?: string[] | null
          conversion_count?: number | null
          coupon_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          demo_click_count?: number | null
          demo_credentials?: Json | null
          demo_embed?: string | null
          demo_type?: string | null
          demo_url?: string | null
          demo_video_url?: string | null
          description?: string | null
          difficulty_level?: string | null
          discount_price?: number | null
          documentation_url?: string | null
          downloads?: number
          dynamic_pricing?: Json | null
          feature_list?: string[] | null
          featured_rank?: number | null
          features_json?: Json | null
          gallery_urls?: string[] | null
          has_broken_demo?: boolean | null
          id?: string
          industry_tags?: string[] | null
          installation_guide?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_new?: boolean | null
          is_subscription?: boolean | null
          keywords?: string[] | null
          last_updated_at?: string | null
          license_tier?: string | null
          license_type?: string | null
          lifetime_price?: number | null
          main_file_url?: string | null
          manual_rank?: number | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_price?: number | null
          name: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          popular_score?: number | null
          preview_urls?: string[] | null
          price?: number
          pricing_model?: string | null
          product_id?: string | null
          product_name?: string | null
          product_type?: string | null
          rating?: number | null
          release_notes?: string | null
          requirements?: string | null
          review_flagged?: boolean | null
          search_keywords?: string[] | null
          sections_json?: Json | null
          short_description?: string | null
          slug?: string | null
          status?: string
          subcategory_id?: string | null
          support_response_time?: string | null
          support_url?: string | null
          synonyms?: string[] | null
          tags?: string[] | null
          tech_stack?: string | null
          tech_stack_tags?: string[] | null
          thumbnail_url?: string | null
          trending?: boolean | null
          type?: string
          updated_at?: string
          use_case_tags?: string[] | null
          verified_author?: boolean | null
          version?: string
          video_thumbnail_url?: string | null
          view_count?: number | null
        }
        Update: {
          abuse_reported?: boolean | null
          additional_files?: Json | null
          author_id?: string | null
          blog_url?: string | null
          business_category_id?: string | null
          canonical_url?: string | null
          category?: string
          changelog?: string | null
          compatibility?: string[] | null
          conversion_count?: number | null
          coupon_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          demo_click_count?: number | null
          demo_credentials?: Json | null
          demo_embed?: string | null
          demo_type?: string | null
          demo_url?: string | null
          demo_video_url?: string | null
          description?: string | null
          difficulty_level?: string | null
          discount_price?: number | null
          documentation_url?: string | null
          downloads?: number
          dynamic_pricing?: Json | null
          feature_list?: string[] | null
          featured_rank?: number | null
          features_json?: Json | null
          gallery_urls?: string[] | null
          has_broken_demo?: boolean | null
          id?: string
          industry_tags?: string[] | null
          installation_guide?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_new?: boolean | null
          is_subscription?: boolean | null
          keywords?: string[] | null
          last_updated_at?: string | null
          license_tier?: string | null
          license_type?: string | null
          lifetime_price?: number | null
          main_file_url?: string | null
          manual_rank?: number | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_price?: number | null
          name?: string
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          popular_score?: number | null
          preview_urls?: string[] | null
          price?: number
          pricing_model?: string | null
          product_id?: string | null
          product_name?: string | null
          product_type?: string | null
          rating?: number | null
          release_notes?: string | null
          requirements?: string | null
          review_flagged?: boolean | null
          search_keywords?: string[] | null
          sections_json?: Json | null
          short_description?: string | null
          slug?: string | null
          status?: string
          subcategory_id?: string | null
          support_response_time?: string | null
          support_url?: string | null
          synonyms?: string[] | null
          tags?: string[] | null
          tech_stack?: string | null
          tech_stack_tags?: string[] | null
          thumbnail_url?: string | null
          trending?: boolean | null
          type?: string
          updated_at?: string
          use_case_tags?: string[] | null
          verified_author?: boolean | null
          version?: string
          video_thumbnail_url?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      server_backups: {
        Row: {
          backup_name: string | null
          backup_type: string | null
          checksum: string | null
          completed_at: string | null
          created_at: string | null
          encryption_enabled: boolean | null
          encryption_key_id: string | null
          error_message: string | null
          expires_at: string | null
          id: string
          is_auto_backup: boolean | null
          metadata: Json | null
          restore_point_id: string | null
          retention_days: number | null
          server_id: string | null
          size_gb: number | null
          started_at: string | null
          status: string | null
          storage_location: string | null
          triggered_by: string | null
        }
        Insert: {
          backup_name?: string | null
          backup_type?: string | null
          checksum?: string | null
          completed_at?: string | null
          created_at?: string | null
          encryption_enabled?: boolean | null
          encryption_key_id?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          is_auto_backup?: boolean | null
          metadata?: Json | null
          restore_point_id?: string | null
          retention_days?: number | null
          server_id?: string | null
          size_gb?: number | null
          started_at?: string | null
          status?: string | null
          storage_location?: string | null
          triggered_by?: string | null
        }
        Update: {
          backup_name?: string | null
          backup_type?: string | null
          checksum?: string | null
          completed_at?: string | null
          created_at?: string | null
          encryption_enabled?: boolean | null
          encryption_key_id?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          is_auto_backup?: boolean | null
          metadata?: Json | null
          restore_point_id?: string | null
          retention_days?: number | null
          server_id?: string | null
          size_gb?: number | null
          started_at?: string | null
          status?: string | null
          storage_location?: string | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      site_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_published: boolean
          kind: string
          link_url: string | null
          published_at: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_published?: boolean
          kind?: string
          link_url?: string | null
          published_at?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_published?: boolean
          kind?: string
          link_url?: string | null
          published_at?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      software_catalog: {
        Row: {
          base_price: number | null
          category: string | null
          created_at: string | null
          demo_id: string | null
          demo_url: string | null
          id: string
          is_demo_registered: boolean | null
          name: string | null
          type: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          demo_id?: string | null
          demo_url?: string | null
          id?: string
          is_demo_registered?: boolean | null
          name?: string | null
          type?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          created_at?: string | null
          demo_id?: string | null
          demo_url?: string | null
          id?: string
          is_demo_registered?: boolean | null
          name?: string | null
          type?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      source_repos: {
        Row: {
          build_status: string
          created_at: string
          default_branch: string
          dependency_count: number
          id: string
          last_build_at: string | null
          last_scan_at: string | null
          latest_version: string | null
          license_valid: boolean
          name: string
          outdated_dependencies: number
          product_id: string | null
          provider: string
          scan_findings: Json
          updated_at: string
          url: string
          vuln_critical: number
          vuln_high: number
          vuln_low: number
          vuln_medium: number
        }
        Insert: {
          build_status?: string
          created_at?: string
          default_branch?: string
          dependency_count?: number
          id?: string
          last_build_at?: string | null
          last_scan_at?: string | null
          latest_version?: string | null
          license_valid?: boolean
          name: string
          outdated_dependencies?: number
          product_id?: string | null
          provider?: string
          scan_findings?: Json
          updated_at?: string
          url: string
          vuln_critical?: number
          vuln_high?: number
          vuln_low?: number
          vuln_medium?: number
        }
        Update: {
          build_status?: string
          created_at?: string
          default_branch?: string
          dependency_count?: number
          id?: string
          last_build_at?: string | null
          last_scan_at?: string | null
          latest_version?: string | null
          license_valid?: boolean
          name?: string
          outdated_dependencies?: number
          product_id?: string | null
          provider?: string
          scan_findings?: Json
          updated_at?: string
          url?: string
          vuln_critical?: number
          vuln_high?: number
          vuln_low?: number
          vuln_medium?: number
        }
        Relationships: [
          {
            foreignKeyName: "source_repos_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      app_role:
        | "admin"
        | "boss"
        | "founder"
        | "developer"
        | "employee"
        | "vendor"
        | "author"
        | "affiliate"
        | "influencer"
        | "reseller"
        | "franchise"
        | "seo"
        | "marketing"
        | "sales"
        | "finance"
        | "support"
        | "customer"
        | "marketplace-user"
      application_stage:
        | "registration"
        | "identity"
        | "kyc"
        | "portfolio"
        | "interview"
        | "agreement"
        | "approved"
        | "rejected"
      author_status: "verified" | "pending" | "suspended" | "rejected"
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
      app_role: [
        "admin",
        "boss",
        "founder",
        "developer",
        "employee",
        "vendor",
        "author",
        "affiliate",
        "influencer",
        "reseller",
        "franchise",
        "seo",
        "marketing",
        "sales",
        "finance",
        "support",
        "customer",
        "marketplace-user",
      ],
      application_stage: [
        "registration",
        "identity",
        "kyc",
        "portfolio",
        "interview",
        "agreement",
        "approved",
        "rejected",
      ],
      author_status: ["verified", "pending", "suspended", "rejected"],
    },
  },
} as const
