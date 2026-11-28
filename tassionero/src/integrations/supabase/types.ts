
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "appointment_history": {
                  Row: {
                    "appointment_id": string,"changed_by": string | null,"created_at": string,"id": string,"kind": Database["public"]['Enums']["history_kind"],"new_value": string | null,"note": string,"old_value": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "appointment_id": string,"changed_by"?: string | null,"created_at"?: string,"id"?: string,"kind": Database["public"]['Enums']["history_kind"],"new_value"?: string | null,"note"?: string,"old_value"?: string | null
                  }
                  Update: {
                    "appointment_id"?: string,"changed_by"?: string | null,"created_at"?: string,"id"?: string,"kind"?: Database["public"]['Enums']["history_kind"],"new_value"?: string | null,"note"?: string,"old_value"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointment_history_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    }
                  ]
                },"appointment_items": {
                  Row: {
                    "appointment_id": string,"duration_minutes_snapshot": number,"final_price": number | null,"id": string,"position": number,"pricing_mode_snapshot": Database["public"]['Enums']["pricing_mode"],"reference_price_snapshot": number | null,"service_id": string | null,"service_name_snapshot": string
                  }
                  ComputedFields: never
                  Insert: {
                    "appointment_id": string,"duration_minutes_snapshot": number,"final_price"?: number | null,"id"?: string,"position"?: number,"pricing_mode_snapshot": Database["public"]['Enums']["pricing_mode"],"reference_price_snapshot"?: number | null,"service_id"?: string | null,"service_name_snapshot": string
                  }
                  Update: {
                    "appointment_id"?: string,"duration_minutes_snapshot"?: number,"final_price"?: number | null,"id"?: string,"position"?: number,"pricing_mode_snapshot"?: Database["public"]['Enums']["pricing_mode"],"reference_price_snapshot"?: number | null,"service_id"?: string | null,"service_name_snapshot"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointment_items_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointment_items_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id"]
    }
                  ]
                },"appointments": {
                  Row: {
                    "amount_paid": number,"created_at": string,"customer_id": string,"customer_name_snapshot": string,"customer_notes": string,"customer_phone_snapshot": string,"ends_at": string,"final_total": number | null,"id": string,"internal_notes": string,"payment_method": Database["public"]['Enums']["booking_payment_method"],"payment_status": Database["public"]['Enums']["payment_status"],"public_code": string,"reference_total": number | null,"source": Database["public"]['Enums']["appointment_source"],"starts_at": string,"status": Database["public"]['Enums']["appointment_status"],"status_changed_at": string,"updated_at": string,"vehicle_id": string,"vehicle_snapshot": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_paid"?: number,"created_at"?: string,"customer_id": string,"customer_name_snapshot": string,"customer_notes"?: string,"customer_phone_snapshot": string,"ends_at": string,"final_total"?: number | null,"id"?: string,"internal_notes"?: string,"payment_method": Database["public"]['Enums']["booking_payment_method"],"payment_status"?: Database["public"]['Enums']["payment_status"],"public_code": string,"reference_total"?: number | null,"source"?: Database["public"]['Enums']["appointment_source"],"starts_at": string,"status"?: Database["public"]['Enums']["appointment_status"],"status_changed_at"?: string,"updated_at"?: string,"vehicle_id": string,"vehicle_snapshot": string
                  }
                  Update: {
                    "amount_paid"?: number,"created_at"?: string,"customer_id"?: string,"customer_name_snapshot"?: string,"customer_notes"?: string,"customer_phone_snapshot"?: string,"ends_at"?: string,"final_total"?: number | null,"id"?: string,"internal_notes"?: string,"payment_method"?: Database["public"]['Enums']["booking_payment_method"],"payment_status"?: Database["public"]['Enums']["payment_status"],"public_code"?: string,"reference_total"?: number | null,"source"?: Database["public"]['Enums']["appointment_source"],"starts_at"?: string,"status"?: Database["public"]['Enums']["appointment_status"],"status_changed_at"?: string,"updated_at"?: string,"vehicle_id"?: string,"vehicle_snapshot"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointments_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_vehicle_id_fkey"
      columns: ["vehicle_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id"]
    }
                  ]
                },"blocked_periods": {
                  Row: {
                    "created_at": string,"created_by": string | null,"ends_at": string,"id": string,"reason": string,"starts_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"ends_at": string,"id"?: string,"reason"?: string,"starts_at": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"ends_at"?: string,"id"?: string,"reason"?: string,"starts_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"booking_attempts": {
                  Row: {
                    "client_hash": string,"created_at": string,"id": number
                  }
                  ComputedFields: never
                  Insert: {
                    "client_hash": string,"created_at"?: string,"id"?: never
                  }
                  Update: {
                    "client_hash"?: string,"created_at"?: string,"id"?: never
                  }
                  Relationships: [
                    
                  ]
                },"business_hours": {
                  Row: {
                    "closes_at": string | null,"is_open": boolean,"opens_at": string | null,"weekday": number
                  }
                  ComputedFields: never
                  Insert: {
                    "closes_at"?: string | null,"is_open"?: boolean,"opens_at"?: string | null,"weekday": number
                  }
                  Update: {
                    "closes_at"?: string | null,"is_open"?: boolean,"opens_at"?: string | null,"weekday"?: number
                  }
                  Relationships: [
                    
                  ]
                },"business_settings": {
                  Row: {
                    "address": string,"booking_policy": string,"business_name": string,"city": string,"created_at": string,"facebook_url": string,"id": boolean,"instagram_url": string,"map_url": string,"max_advance_days": number,"max_pending_per_phone": number,"min_advance_minutes": number,"payment_instructions": string,"pending_alert_hours": number,"pix_holder_name": string,"pix_key": string,"pix_key_type": Database["public"]['Enums']["pix_key_type"] | null,"public_description": string,"slot_interval_minutes": number,"tagline": string,"tiktok_url": string,"timezone": string,"updated_at": string,"whatsapp_phone": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string,"booking_policy"?: string,"business_name"?: string,"city"?: string,"created_at"?: string,"facebook_url"?: string,"id"?: boolean,"instagram_url"?: string,"map_url"?: string,"max_advance_days"?: number,"max_pending_per_phone"?: number,"min_advance_minutes"?: number,"payment_instructions"?: string,"pending_alert_hours"?: number,"pix_holder_name"?: string,"pix_key"?: string,"pix_key_type"?: Database["public"]['Enums']["pix_key_type"] | null,"public_description"?: string,"slot_interval_minutes"?: number,"tagline"?: string,"tiktok_url"?: string,"timezone"?: string,"updated_at"?: string,"whatsapp_phone"?: string
                  }
                  Update: {
                    "address"?: string,"booking_policy"?: string,"business_name"?: string,"city"?: string,"created_at"?: string,"facebook_url"?: string,"id"?: boolean,"instagram_url"?: string,"map_url"?: string,"max_advance_days"?: number,"max_pending_per_phone"?: number,"min_advance_minutes"?: number,"payment_instructions"?: string,"pending_alert_hours"?: number,"pix_holder_name"?: string,"pix_key"?: string,"pix_key_type"?: Database["public"]['Enums']["pix_key_type"] | null,"public_description"?: string,"slot_interval_minutes"?: number,"tagline"?: string,"tiktok_url"?: string,"timezone"?: string,"updated_at"?: string,"whatsapp_phone"?: string
                  }
                  Relationships: [
                    
                  ]
                },"customers": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"notes": string,"phone": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"notes"?: string,"phone": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"notes"?: string,"phone"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"gallery_items": {
                  Row: {
                    "after_image_path": string | null,"before_image_path": string | null,"created_at": string,"description": string,"id": string,"image_path": string,"is_illustrative": boolean,"is_published": boolean,"service_id": string | null,"sort_order": number,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "after_image_path"?: string | null,"before_image_path"?: string | null,"created_at"?: string,"description"?: string,"id"?: string,"image_path": string,"is_illustrative"?: boolean,"is_published"?: boolean,"service_id"?: string | null,"sort_order"?: number,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "after_image_path"?: string | null,"before_image_path"?: string | null,"created_at"?: string,"description"?: string,"id"?: string,"image_path"?: string,"is_illustrative"?: boolean,"is_published"?: boolean,"service_id"?: string | null,"sort_order"?: number,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "gallery_items_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string | null,"id": string,"role": Database["public"]['Enums']["app_role"] | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"full_name"?: string | null,"id": string,"role"?: Database["public"]['Enums']["app_role"] | null,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["app_role"] | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"service_category_prices": {
                  Row: {
                    "id": string,"price": number,"service_id": string,"vehicle_category_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"price": number,"service_id": string,"vehicle_category_id": string
                  }
                  Update: {
                    "id"?: string,"price"?: number,"service_id"?: string,"vehicle_category_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "service_category_prices_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "services"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "service_category_prices_vehicle_category_id_fkey"
      columns: ["vehicle_category_id"]
isOneToOne: false
      referencedRelation: "vehicle_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"services": {
                  Row: {
                    "base_price": number | null,"booking_mode": Database["public"]['Enums']["booking_mode"],"category": string,"cover_image_path": string | null,"created_at": string,"description": string,"duration_minutes": number,"id": string,"internal_notes": string,"is_active": boolean,"is_demo": boolean,"is_featured": boolean,"name": string,"pricing_mode": Database["public"]['Enums']["pricing_mode"],"slug": string,"sort_order": number,"summary": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "base_price"?: number | null,"booking_mode"?: Database["public"]['Enums']["booking_mode"],"category"?: string,"cover_image_path"?: string | null,"created_at"?: string,"description"?: string,"duration_minutes": number,"id"?: string,"internal_notes"?: string,"is_active"?: boolean,"is_demo"?: boolean,"is_featured"?: boolean,"name": string,"pricing_mode"?: Database["public"]['Enums']["pricing_mode"],"slug": string,"sort_order"?: number,"summary"?: string,"updated_at"?: string
                  }
                  Update: {
                    "base_price"?: number | null,"booking_mode"?: Database["public"]['Enums']["booking_mode"],"category"?: string,"cover_image_path"?: string | null,"created_at"?: string,"description"?: string,"duration_minutes"?: number,"id"?: string,"internal_notes"?: string,"is_active"?: boolean,"is_demo"?: boolean,"is_featured"?: boolean,"name"?: string,"pricing_mode"?: Database["public"]['Enums']["pricing_mode"],"slug"?: string,"sort_order"?: number,"summary"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"transactions": {
                  Row: {
                    "amount": number,"appointment_id": string | null,"category": string,"created_at": string,"created_by": string | null,"description": string,"due_date": string | null,"id": string,"notes": string,"paid_at": string | null,"payment_method": Database["public"]['Enums']["money_method"] | null,"status": Database["public"]['Enums']["transaction_status"],"type": Database["public"]['Enums']["transaction_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"appointment_id"?: string | null,"category"?: string,"created_at"?: string,"created_by"?: string | null,"description": string,"due_date"?: string | null,"id"?: string,"notes"?: string,"paid_at"?: string | null,"payment_method"?: Database["public"]['Enums']["money_method"] | null,"status"?: Database["public"]['Enums']["transaction_status"],"type": Database["public"]['Enums']["transaction_type"],"updated_at"?: string
                  }
                  Update: {
                    "amount"?: number,"appointment_id"?: string | null,"category"?: string,"created_at"?: string,"created_by"?: string | null,"description"?: string,"due_date"?: string | null,"id"?: string,"notes"?: string,"paid_at"?: string | null,"payment_method"?: Database["public"]['Enums']["money_method"] | null,"status"?: Database["public"]['Enums']["transaction_status"],"type"?: Database["public"]['Enums']["transaction_type"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "transactions_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    }
                  ]
                },"vehicle_categories": {
                  Row: {
                    "created_at": string,"description": string,"id": string,"is_active": boolean,"is_quote_only": boolean,"name": string,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string,"id"?: string,"is_active"?: boolean,"is_quote_only"?: boolean,"name": string,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string,"id"?: string,"is_active"?: boolean,"is_quote_only"?: boolean,"name"?: string,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"vehicles": {
                  Row: {
                    "color": string,"created_at": string,"customer_id": string,"id": string,"make": string,"model": string,"notes": string,"updated_at": string,"vehicle_category_id": string,"year": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "color"?: string,"created_at"?: string,"customer_id": string,"id"?: string,"make"?: string,"model": string,"notes"?: string,"updated_at"?: string,"vehicle_category_id": string,"year"?: number | null
                  }
                  Update: {
                    "color"?: string,"created_at"?: string,"customer_id"?: string,"id"?: string,"make"?: string,"model"?: string,"notes"?: string,"updated_at"?: string,"vehicle_category_id"?: string,"year"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "vehicles_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vehicles_vehicle_category_id_fkey"
      columns: ["vehicle_category_id"]
isOneToOne: false
      referencedRelation: "vehicle_categories"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "_assert_owner":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"_client_hash":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"_insert_appointment":
{ Args: { "p_customer_id": string,"p_customer_name": string,"p_customer_notes": string,"p_customer_phone": string,"p_ends_at": string,"p_final_total": number,"p_internal_notes": string,"p_payment_method": Database["public"]['Enums']["booking_payment_method"],"p_require_online": boolean,"p_service_ids": (string)[],"p_source": Database["public"]['Enums']["appointment_source"],"p_starts_at": string,"p_status": Database["public"]['Enums']["appointment_status"],"p_vehicle_category_id": string,"p_vehicle_id": string,"p_vehicle_snapshot": string }; Returns: {
              "amount_paid": number,
"created_at": string,
"customer_id": string,
"customer_name_snapshot": string,
"customer_notes": string,
"customer_phone_snapshot": string,
"ends_at": string,
"final_total": number | null,
"id": string,
"internal_notes": string,
"payment_method": Database["public"]['Enums']["booking_payment_method"],
"payment_status": Database["public"]['Enums']["payment_status"],
"public_code": string,
"reference_total": number | null,
"source": Database["public"]['Enums']["appointment_source"],
"starts_at": string,
"status": Database["public"]['Enums']["appointment_status"],
"status_changed_at": string,
"updated_at": string,
"vehicle_id": string,
"vehicle_snapshot": string
            }
                          SetofOptions: {
        from: "*"
        to: "appointments"
        isOneToOne: true
        isSetofReturn: false
      } },
"_is_occupied":
{ Args: { "p_end": string,"p_ignore_appointment"?: string,"p_start": string }; Returns: boolean
                           },
"_lock_agenda":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"_log":
{ Args: { "p_appointment_id": string,"p_kind": Database["public"]['Enums']["history_kind"],"p_new": string,"p_note": string,"p_old": string }; Returns: undefined
                           },
"_new_public_code":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"_refresh_payment":
{ Args: { "p_appointment_id": string }; Returns: undefined
                           },
"_service_lines":
{ Args: { "p_require_online": boolean,"p_service_ids": (string)[],"p_vehicle_category_id": string }; Returns: {
              "duration_minutes": number,"item_position": number,"pricing_mode": Database["public"]['Enums']["pricing_mode"],"reference_price": number,"service_id": string,"service_name": string
            }[]
                           },
"_settings":
{ Args: Record<PropertyKey, never>; Returns: {
              "address": string,
"booking_policy": string,
"business_name": string,
"city": string,
"created_at": string,
"facebook_url": string,
"id": boolean,
"instagram_url": string,
"map_url": string,
"max_advance_days": number,
"max_pending_per_phone": number,
"min_advance_minutes": number,
"payment_instructions": string,
"pending_alert_hours": number,
"pix_holder_name": string,
"pix_key": string,
"pix_key_type": Database["public"]['Enums']["pix_key_type"] | null,
"public_description": string,
"slot_interval_minutes": number,
"tagline": string,
"tiktok_url": string,
"timezone": string,
"updated_at": string,
"whatsapp_phone": string
            }
                          SetofOptions: {
        from: "*"
        to: "business_settings"
        isOneToOne: true
        isSetofReturn: false
      } },
"_slot_candidates":
{ Args: { "p_date": string,"p_duration_minutes": number,"p_enforce_window": boolean,"p_ignore_appointment": string }; Returns: string[]
                           },
"create_public_appointment":
{ Args: { "p": Json }; Returns: Json
                           },
"get_available_slots":
{ Args: { "p_date": string,"p_service_ids": (string)[],"p_vehicle_category_id": string }; Returns: {
              "ends_at": string,"starts_at": string
            }[]
                           },
"get_public_appointment":
{ Args: { "p_code": string }; Returns: Json
                           },
"get_public_business_info":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"is_owner":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"normalize_br_phone":
{ Args: { "p": string }; Returns: string
                           },
"owner_available_slots":
{ Args: { "p_date": string,"p_duration_minutes": number,"p_ignore_appointment"?: string }; Returns: string[]
                           },
"owner_block_conflicts":
{ Args: { "p_end": string,"p_start": string }; Returns: {
              "customer_name": string,"ends_at": string,"id": string,"public_code": string,"starts_at": string,"status": Database["public"]['Enums']["appointment_status"],"vehicle": string
            }[]
                           },
"owner_create_appointment":
{ Args: { "p": Json }; Returns: {
              "amount_paid": number,
"created_at": string,
"customer_id": string,
"customer_name_snapshot": string,
"customer_notes": string,
"customer_phone_snapshot": string,
"ends_at": string,
"final_total": number | null,
"id": string,
"internal_notes": string,
"payment_method": Database["public"]['Enums']["booking_payment_method"],
"payment_status": Database["public"]['Enums']["payment_status"],
"public_code": string,
"reference_total": number | null,
"source": Database["public"]['Enums']["appointment_source"],
"starts_at": string,
"status": Database["public"]['Enums']["appointment_status"],
"status_changed_at": string,
"updated_at": string,
"vehicle_id": string,
"vehicle_snapshot": string
            }
                          SetofOptions: {
        from: "*"
        to: "appointments"
        isOneToOne: true
        isSetofReturn: false
      } },
"owner_create_block":
{ Args: { "p_end": string,"p_reason"?: string,"p_resolutions"?: Json,"p_start": string }; Returns: {
              "created_at": string,
"created_by": string | null,
"ends_at": string,
"id": string,
"reason": string,
"starts_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "blocked_periods"
        isOneToOne: true
        isSetofReturn: false
      } },
"owner_dashboard":
{ Args: { "p_from": string,"p_to": string }; Returns: Json
                           },
"owner_finance_report":
{ Args: { "p_from": string,"p_to": string }; Returns: Json
                           },
"owner_register_payment":
{ Args: { "p_amount": number,"p_appointment_id": string,"p_method": Database["public"]['Enums']["money_method"],"p_notes"?: string,"p_paid_at"?: string }; Returns: {
              "amount": number,
"appointment_id": string | null,
"category": string,
"created_at": string,
"created_by": string | null,
"description": string,
"due_date": string | null,
"id": string,
"notes": string,
"paid_at": string | null,
"payment_method": Database["public"]['Enums']["money_method"] | null,
"status": Database["public"]['Enums']["transaction_status"],
"type": Database["public"]['Enums']["transaction_type"],
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "transactions"
        isOneToOne: true
        isSetofReturn: false
      } },
"owner_register_refund":
{ Args: { "p_amount": number,"p_appointment_id": string,"p_method": Database["public"]['Enums']["money_method"],"p_notes"?: string,"p_paid_at"?: string }; Returns: {
              "amount": number,
"appointment_id": string | null,
"category": string,
"created_at": string,
"created_by": string | null,
"description": string,
"due_date": string | null,
"id": string,
"notes": string,
"paid_at": string | null,
"payment_method": Database["public"]['Enums']["money_method"] | null,
"status": Database["public"]['Enums']["transaction_status"],
"type": Database["public"]['Enums']["transaction_type"],
"updated_at": string
            }
                          SetofOptions: {
        from: "*"
        to: "transactions"
        isOneToOne: true
        isSetofReturn: false
      } },
"owner_reschedule_appointment":
{ Args: { "p_allow_outside_hours"?: boolean,"p_appointment_id": string,"p_new_start": string,"p_note"?: string }; Returns: {
              "amount_paid": number,
"created_at": string,
"customer_id": string,
"customer_name_snapshot": string,
"customer_notes": string,
"customer_phone_snapshot": string,
"ends_at": string,
"final_total": number | null,
"id": string,
"internal_notes": string,
"payment_method": Database["public"]['Enums']["booking_payment_method"],
"payment_status": Database["public"]['Enums']["payment_status"],
"public_code": string,
"reference_total": number | null,
"source": Database["public"]['Enums']["appointment_source"],
"starts_at": string,
"status": Database["public"]['Enums']["appointment_status"],
"status_changed_at": string,
"updated_at": string,
"vehicle_id": string,
"vehicle_snapshot": string
            }
                          SetofOptions: {
        from: "*"
        to: "appointments"
        isOneToOne: true
        isSetofReturn: false
      } },
"owner_update_appointment_status":
{ Args: { "p_appointment_id": string,"p_note"?: string,"p_status": Database["public"]['Enums']["appointment_status"] }; Returns: {
              "amount_paid": number,
"created_at": string,
"customer_id": string,
"customer_name_snapshot": string,
"customer_notes": string,
"customer_phone_snapshot": string,
"ends_at": string,
"final_total": number | null,
"id": string,
"internal_notes": string,
"payment_method": Database["public"]['Enums']["booking_payment_method"],
"payment_status": Database["public"]['Enums']["payment_status"],
"public_code": string,
"reference_total": number | null,
"source": Database["public"]['Enums']["appointment_source"],
"starts_at": string,
"status": Database["public"]['Enums']["appointment_status"],
"status_changed_at": string,
"updated_at": string,
"vehicle_id": string,
"vehicle_snapshot": string
            }
                          SetofOptions: {
        from: "*"
        to: "appointments"
        isOneToOne: true
        isSetofReturn: false
      } },
"owner_update_final_price":
{ Args: { "p_appointment_id": string,"p_final_total": number,"p_item_prices"?: Json,"p_note"?: string }; Returns: {
              "amount_paid": number,
"created_at": string,
"customer_id": string,
"customer_name_snapshot": string,
"customer_notes": string,
"customer_phone_snapshot": string,
"ends_at": string,
"final_total": number | null,
"id": string,
"internal_notes": string,
"payment_method": Database["public"]['Enums']["booking_payment_method"],
"payment_status": Database["public"]['Enums']["payment_status"],
"public_code": string,
"reference_total": number | null,
"source": Database["public"]['Enums']["appointment_source"],
"starts_at": string,
"status": Database["public"]['Enums']["appointment_status"],
"status_changed_at": string,
"updated_at": string,
"vehicle_id": string,
"vehicle_snapshot": string
            }
                          SetofOptions: {
        from: "*"
        to: "appointments"
        isOneToOne: true
        isSetofReturn: false
      } },
"quote_services":
{ Args: { "p_service_ids": (string)[],"p_vehicle_category_id": string }; Returns: Json
                           }
          }
          Enums: {
            "app_role": "owner","appointment_source": "site"|"admin","appointment_status": "pending"|"confirmed"|"in_progress"|"completed"|"rejected"|"cancelled","booking_mode": "online"|"whatsapp","booking_payment_method": "pix"|"cash","history_kind": "created"|"status"|"reschedule"|"price"|"payment"|"note","money_method": "pix"|"cash"|"card"|"other","payment_status": "unpaid"|"partially_paid"|"paid"|"refunded","pix_key_type": "cpf"|"cnpj"|"email"|"phone"|"random","pricing_mode": "fixed"|"vehicle_category"|"quote"|"mixed","transaction_status": "pending"|"paid"|"cancelled","transaction_type": "income"|"expense"|"refund"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["owner"],"appointment_source": ["site", "admin"],"appointment_status": ["pending", "confirmed", "in_progress", "completed", "rejected", "cancelled"],"booking_mode": ["online", "whatsapp"],"booking_payment_method": ["pix", "cash"],"history_kind": ["created", "status", "reschedule", "price", "payment", "note"],"money_method": ["pix", "cash", "card", "other"],"payment_status": ["unpaid", "partially_paid", "paid", "refunded"],"pix_key_type": ["cpf", "cnpj", "email", "phone", "random"],"pricing_mode": ["fixed", "vehicle_category", "quote", "mixed"],"transaction_status": ["pending", "paid", "cancelled"],"transaction_type": ["income", "expense", "refund"]
          }
        }
} as const
