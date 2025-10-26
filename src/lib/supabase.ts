import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface ChecklistItem {
  id: string
  norm: string
  description: string
  area_type: 'subestacoes' | 'paineis'
  default_image?: string
  default_recommendations?: string[]
  created_at?: string
}

export interface Inspection {
  id: string
  title: string
  client_name: string
  engineer_name: string
  client_responsible?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface InspectionArea {
  id: string
  inspection_id: string
  name: string
  checklist_type: 'subestacoes' | 'paineis'
  created_at: string
}

export interface InspectionResult {
  id: string
  inspection_area_id: string
  checklist_item_id: string
  condition: 'C' | 'NC' | 'NA'
  po_value?: number
  fe_value?: number
  gsd_value?: number
  nper_value?: number
  hrn_value?: number
  hrn_classification?: string
  custom_recommendations?: string
  photos?: string[]
  audio_files?: string[]
  video_files?: string[]
  created_at: string
  updated_at: string
}