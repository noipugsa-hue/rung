export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'revision_required'

export type DocumentType =
  | 'id_card'
  | 'selfie'
  | 'police_check'
  | 'medical_certificate'
  | 'reference_letter'

export interface DocumentUpload {
  type: DocumentType
  url: string
  filename: string
  uploadedAt: string
  verified?: boolean
}

export interface ProfileImage {
  url: string              // Firebase Storage URL
  isPrimary: boolean       // only one image should be true
  order: number            // display order in gallery

  // Optional metadata - only store if needed
  filename?: string
  storagePath?: string     // path in Storage for deletion
  uploadedAt?: string
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  phoneNumber: string
  email: string
  lineId?: string
  address: string
  district: string
  province: string
  postalCode: string
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
  }
}

export interface ProfessionalInfo {
  occupation: string
  education: string
  languages: string[]
  specialSkills: string[]
  experience: string
  availability: {
    weekdays: boolean
    weekends: boolean
    evenings: boolean
  }
  preferredActivities: string[]
  willingToTravel: boolean
  hasVehicle: boolean
  vehicleType?: string
}

export interface FinancialInfo {
  bankName: string
  accountNumber: string
  accountName: string
  taxId?: string
  preferredPayoutFrequency: 'weekly' | 'biweekly' | 'monthly'
}

export interface BackgroundCheck {
  hasConvictions: boolean
  convictionDetails?: string
  hasMedicalConditions: boolean
  medicalConditionDetails?: string
  references: Array<{
    name: string
    relationship: string
    phoneNumber: string
    email?: string
  }>
  agreedToBackgroundCheck: boolean
  agreedToTerms: boolean
}

export interface PartnerApplication {
  id: string
  userId: string
  status: ApplicationStatus
  currentStep: number
  completedSteps: number[]

  personalInfo?: PersonalInfo
  professionalInfo?: ProfessionalInfo
  financialInfo?: FinancialInfo
  backgroundCheck?: BackgroundCheck
  documents: DocumentUpload[]
  profileImages?: ProfileImage[]

  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
  rejectionReason?: string

  createdAt: string
  updatedAt: string
}

export interface ApplicationReview {
  applicationId: string
  reviewerId: string
  reviewerName: string
  status: 'approved' | 'rejected' | 'revision_required'
  notes: string
  checklist: {
    personalInfoVerified: boolean
    documentsVerified: boolean
    backgroundCheckPassed: boolean
    referencesContacted: boolean
  }
  reviewedAt: string
}
