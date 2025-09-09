export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          slug: string
          status: 'draft' | 'published' | 'archived' | 'deleted'
          is_public: boolean
          allow_anonymous: boolean
          require_captcha: boolean
          max_submissions: number | null
          submission_limit: number | null
          submission_count: number
          settings: any
          theme: any
          brand_kit: any
          published_at: string | null
          expires_at: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          slug: string
          status?: 'draft' | 'published' | 'archived' | 'deleted'
          is_public?: boolean
          allow_anonymous?: boolean
          require_captcha?: boolean
          max_submissions?: number | null
          submission_limit?: number | null
          submission_count?: number
          settings?: any
          theme?: any
          brand_kit?: any
          published_at?: string | null
          expires_at?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          slug?: string
          status?: 'draft' | 'published' | 'archived' | 'deleted'
          is_public?: boolean
          allow_anonymous?: boolean
          require_captcha?: boolean
          max_submissions?: number | null
          submission_limit?: number | null
          submission_count?: number
          settings?: any
          theme?: any
          brand_kit?: any
          published_at?: string | null
          expires_at?: string | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      form_fields: {
        Row: {
          id: string
          form_id: string
          type: string
          label: string
          placeholder: string | null
          required: boolean
          validation: any
          options: any
          order: number
          settings: any
          conditional_logic: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          type: string
          label: string
          placeholder?: string | null
          required?: boolean
          validation?: any
          options?: any
          order: number
          settings?: any
          conditional_logic?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          type?: string
          label?: string
          placeholder?: string | null
          required?: boolean
          validation?: any
          options?: any
          order?: number
          settings?: any
          conditional_logic?: any
          created_at?: string
          updated_at?: string
        }
      }
      form_submissions: {
        Row: {
          id: string
          form_id: string
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          status: 'pending' | 'approved' | 'rejected' | 'spam'
          is_spam: boolean
          spam_score: number | null
          data: any
          metadata: any
          submitted_at: string
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          form_id: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'spam'
          is_spam?: boolean
          spam_score?: number | null
          data: any
          metadata?: any
          submitted_at?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'spam'
          is_spam?: boolean
          spam_score?: number | null
          data?: any
          metadata?: any
          submitted_at?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string | null
          first_name: string | null
          last_name: string | null
          role: 'user' | 'admin' | 'super_admin'
          status: 'active' | 'inactive' | 'suspended' | 'pending'
          email_verified: boolean
          email_verification_token: string | null
          password_reset_token: string | null
          password_reset_expires: string | null
          last_login_at: string | null
          stripe_customer_id: string | null
          subscription_tier: string
          subscription_status: string
          subscription_expires_at: string | null
          settings: any
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash?: string | null
          first_name?: string | null
          last_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          status?: 'active' | 'inactive' | 'suspended' | 'pending'
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          last_login_at?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_expires_at?: string | null
          settings?: any
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string | null
          first_name?: string | null
          last_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          status?: 'active' | 'inactive' | 'suspended' | 'pending'
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          last_login_at?: string | null
          stripe_customer_id?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_expires_at?: string | null
          settings?: any
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          avatar: string | null
          bio: string | null
          company: string | null
          website: string | null
          phone: string | null
          address: any
          timezone: string | null
          language: string
          preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          avatar?: string | null
          bio?: string | null
          company?: string | null
          website?: string | null
          phone?: string | null
          address?: any
          timezone?: string | null
          language?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          avatar?: string | null
          bio?: string | null
          company?: string | null
          website?: string | null
          phone?: string | null
          address?: any
          timezone?: string | null
          language?: string
          preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      anonymous_users: {
        Row: {
          id: string
          fingerprint: string
          session_data: any
          last_seen: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fingerprint: string
          session_data?: any
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fingerprint?: string
          session_data?: any
          last_seen?: string
          created_at?: string
          updated_at?: string
        }
      }
      payment_intents: {
        Row: {
          id: string
          stripe_payment_intent_id: string
          user_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stripe_payment_intent_id: string
          user_id?: string | null
          amount: number
          currency: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stripe_payment_intent_id?: string
          user_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      form_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          thumbnail: string | null
          template_data: any
          usage_count: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          thumbnail?: string | null
          template_data: any
          usage_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          thumbnail?: string | null
          template_data?: any
          usage_count?: number
          is_featured?: boolean
          created_at?: string
          updated_at?: string
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