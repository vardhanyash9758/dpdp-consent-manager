export type VendorCategory = 'analytics' | 'kyc' | 'messaging' | 'infra' | 'payments' | 'other'

export type DPAStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type DataType = 
  | 'name' 
  | 'email' 
  | 'phone' 
  | 'address' 
  | 'aadhaar' 
  | 'pan' 
  | 'device_data'

export type Purpose = 
  | 'user_authentication'
  | 'kyc_verification' 
  | 'fraud_detection'
  | 'analytics'
  | 'communication'
  | 'customer_support'

export interface Vendor {
  vendor_id: string
  vendor_name: string
  category: VendorCategory
  contact_name: string
  contact_email: string
  notes?: string
  
  dpa_status: DPAStatus
  dpa_file_url?: string
  dpa_signed_on?: Date
  dpa_valid_till?: Date
  
  allowed_purposes: Purpose[]
  allowed_data_types: DataType[]
  
  risk_level: RiskLevel
  
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface VendorAccessLog {
  log_id: string
  vendor_id: string
  vendor_name: string
  purpose: Purpose
  data_types_requested: DataType[]
  access_granted: boolean
  reason?: string
  timestamp: Date
}

export interface CreateVendorRequest {
  vendor_name: string
  category: VendorCategory
  contact_name: string
  contact_email: string
  notes?: string
}

export interface UpdateVendorRequest {
  vendor_name?: string
  category?: VendorCategory
  contact_name?: string
  contact_email?: string
  notes?: string
  allowed_purposes?: Purpose[]
  allowed_data_types?: DataType[]
}

export interface VendorStats {
  total_vendors: number
  approved_vendors: number
  pending_dpa: number
  high_risk_vendors: number
}