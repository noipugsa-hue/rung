import { defineStore } from 'pinia'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import type {
  PartnerApplication,
  PersonalInfo,
  ProfessionalInfo,
  FinancialInfo,
  BackgroundCheck,
  DocumentUpload,
  ApplicationReview,
  ApplicationStatus,
  ProfileImage
} from '~/types/application'
import { generateId } from '~/utils/id-generator'
import {
  estimateDocumentSize,
  isDocumentSizeSafe,
  formatBytes,
  validateProfileImagesCount,
  optimizeProfileImages
} from '~/utils/document-size'

export const usePartnerApplicationStore = defineStore('partnerApplication', () => {
  const applications = ref<PartnerApplication[]>([])
  const currentApplication = ref<PartnerApplication | null>(null)
  const reviews = ref<ApplicationReview[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  // Initialize or get current application for user
  async function initializeApplication(userId: string): Promise<PartnerApplication> {
    if (!process.client) {
      throw new Error('Firestore operations must run on client side')
    }

    try {
      loading.value = true
      const db = getFirestore()

      // Check if user already has a draft application in Firestore
      const applicationsRef = collection(db, 'partnerApplications')
      const q = query(
        applicationsRef,
        where('userId', '==', userId),
        where('status', '==', 'draft')
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const existingDraft = {
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        } as PartnerApplication
        currentApplication.value = existingDraft
        return existingDraft
      }

      // Create new draft application
      const appId = generateId('APP')
      const newApplication: PartnerApplication = {
        id: appId,
        userId,
        status: 'draft',
        currentStep: 1,
        completedSteps: [],
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Save to Firestore
      const appRef = doc(db, 'partnerApplications', appId)
      await setDoc(appRef, newApplication)

      currentApplication.value = newApplication
      return newApplication
    } catch (err: any) {
      console.error('Initialize application error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Save personal information (Step 1)
  async function savePersonalInfo(
    applicationId: string,
    personalInfo: PersonalInfo
  ): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)

      // Get current application
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) throw new Error('Application not found')

      const currentData = appSnap.data() as PartnerApplication
      const completedSteps = currentData.completedSteps.includes(1)
        ? currentData.completedSteps
        : [...currentData.completedSteps, 1]

      // Update Firestore
      await updateDoc(appRef, {
        personalInfo,
        currentStep: Math.max(currentData.currentStep, 2),
        completedSteps,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      if (currentApplication.value && currentApplication.value.id === applicationId) {
        currentApplication.value = {
          ...currentApplication.value,
          personalInfo,
          currentStep: Math.max(currentData.currentStep, 2),
          completedSteps,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Save personal info error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Save professional information (Step 2)
  async function saveProfessionalInfo(
    applicationId: string,
    professionalInfo: ProfessionalInfo,
    profileImages?: ProfileImage[]
  ): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)

      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) throw new Error('Application not found')

      const currentData = appSnap.data() as PartnerApplication
      const completedSteps = currentData.completedSteps.includes(2)
        ? currentData.completedSteps
        : [...currentData.completedSteps, 2]

      const updateData: any = {
        professionalInfo,
        currentStep: Math.max(currentData.currentStep, 3),
        completedSteps,
        updatedAt: new Date().toISOString()
      }

      if (profileImages) {
        // Validate image count
        const validation = validateProfileImagesCount(profileImages)
        if (!validation.valid) {
          throw new Error(validation.message)
        }

        // Optimize images to reduce document size
        updateData.profileImages = optimizeProfileImages(profileImages)
      }

      // Check document size before saving
      const proposedData = { ...currentData, ...updateData }
      const sizeCheck = isDocumentSizeSafe(proposedData)

      if (!sizeCheck.safe) {
        console.error('❌ Document size exceeds safe limit:', {
          currentSize: formatBytes(sizeCheck.size),
          maxSize: formatBytes(sizeCheck.maxSize),
          profileImagesCount: profileImages?.length || 0
        })
        throw new Error(
          `ขนาดเอกสารเกินกำหนด (${formatBytes(sizeCheck.size)}). กรุณาลดจำนวนรูปภาพหรือลบรูปที่ไม่จำเป็น`
        )
      }

      console.log('✅ Document size check passed:', {
        size: formatBytes(sizeCheck.size),
        imagesCount: profileImages?.length || 0
      })

      await updateDoc(appRef, updateData)

      if (currentApplication.value && currentApplication.value.id === applicationId) {
        currentApplication.value = {
          ...currentApplication.value,
          professionalInfo,
          ...(profileImages && { profileImages }),
          currentStep: Math.max(currentData.currentStep, 3),
          completedSteps,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Save professional info error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Upload document (Step 3)
  async function uploadDocument(
    applicationId: string,
    document: DocumentUpload
  ): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)

      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) throw new Error('Application not found')

      const currentData = appSnap.data() as PartnerApplication
      const documents = currentData.documents.filter(doc => doc.type !== document.type)
      documents.push(document)

      await updateDoc(appRef, {
        documents,
        updatedAt: new Date().toISOString()
      })

      if (currentApplication.value && currentApplication.value.id === applicationId) {
        currentApplication.value = {
          ...currentApplication.value,
          documents,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Upload document error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Mark document step as complete
  async function completeDocumentStep(applicationId: string): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)

      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) throw new Error('Application not found')

      const currentData = appSnap.data() as PartnerApplication
      const completedSteps = currentData.completedSteps.includes(3)
        ? currentData.completedSteps
        : [...currentData.completedSteps, 3]

      await updateDoc(appRef, {
        currentStep: Math.max(currentData.currentStep, 4),
        completedSteps,
        updatedAt: new Date().toISOString()
      })

      if (currentApplication.value && currentApplication.value.id === applicationId) {
        currentApplication.value = {
          ...currentApplication.value,
          currentStep: Math.max(currentData.currentStep, 4),
          completedSteps,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Complete document step error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Save financial information (Step 4)
  async function saveFinancialInfo(
    applicationId: string,
    financialInfo: FinancialInfo
  ): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)

      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) throw new Error('Application not found')

      const currentData = appSnap.data() as PartnerApplication
      const completedSteps = currentData.completedSteps.includes(4)
        ? currentData.completedSteps
        : [...currentData.completedSteps, 4]

      await updateDoc(appRef, {
        financialInfo,
        currentStep: Math.max(currentData.currentStep, 5),
        completedSteps,
        updatedAt: new Date().toISOString()
      })

      if (currentApplication.value && currentApplication.value.id === applicationId) {
        currentApplication.value = {
          ...currentApplication.value,
          financialInfo,
          currentStep: Math.max(currentData.currentStep, 5),
          completedSteps,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Save financial info error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Save background check (Step 5)
  async function saveBackgroundCheck(
    applicationId: string,
    backgroundCheck: BackgroundCheck
  ): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)

      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) throw new Error('Application not found')

      const currentData = appSnap.data() as PartnerApplication
      const completedSteps = currentData.completedSteps.includes(5)
        ? currentData.completedSteps
        : [...currentData.completedSteps, 5]

      await updateDoc(appRef, {
        backgroundCheck,
        completedSteps,
        updatedAt: new Date().toISOString()
      })

      if (currentApplication.value && currentApplication.value.id === applicationId) {
        currentApplication.value = {
          ...currentApplication.value,
          backgroundCheck,
          completedSteps,
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Save background check error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Submit application for review
  async function submitApplication(applicationId: string): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)

      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) throw new Error('Application not found')

      const currentData = appSnap.data() as PartnerApplication

      // Validate all steps are completed
      if (currentData.completedSteps.length < 5) {
        throw new Error('Please complete all steps before submitting')
      }

      await updateDoc(appRef, {
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      if (currentApplication.value && currentApplication.value.id === applicationId) {
        currentApplication.value = {
          ...currentApplication.value,
          status: 'submitted',
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    } catch (err: any) {
      console.error('Submit application error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Admin: Fetch all applications from Firestore
  async function fetchAllApplications(): Promise<void> {
    if (!process.client) return

    try {
      loading.value = true
      const db = getFirestore()

      // Check current user role before querying
      const { $firebase } = useNuxtApp()
      const currentUser = $firebase.auth.currentUser

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const userData = userSnap.data()
          console.log('🔍 Current user role:', userData.role)
          console.log('🔍 Current user isAdmin:', userData.isAdmin)
          console.log('🔍 Current user email:', userData.email)

          // Check both role and isAdmin flag
          const hasAdminAccess = userData.role === 'admin' || userData.isAdmin === true
          if (!hasAdminAccess) {
            throw new Error(`ไม่มีสิทธิ์เข้าถึง (role: ${userData.role}, isAdmin: ${userData.isAdmin})`)
          }
        }
      }

      const applicationsRef = collection(db, 'partnerApplications')
      const q = query(applicationsRef, orderBy('updatedAt', 'desc'))
      const querySnapshot = await getDocs(q)

      applications.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PartnerApplication))

      console.log(`✅ Fetched ${applications.value.length} applications from Firestore`)
    } catch (err: any) {
      console.error('❌ Fetch all applications error:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Admin: Get all applications
  function getAllApplications(): PartnerApplication[] {
    return applications.value.sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    )
  }

  // Admin: Get applications by status
  function getApplicationsByStatus(status: ApplicationStatus): PartnerApplication[] {
    return applications.value
      .filter(app => app.status === status)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  // Admin: Update application status
  async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<void> {
    const application = applications.value.find(app => app.id === applicationId)
    if (!application) throw new Error('Application not found')

    application.status = status
    if (notes) {
      application.reviewNotes = notes
    }

    if (status === 'approved' || status === 'rejected') {
      application.reviewedAt = new Date().toISOString()
    }

    application.updatedAt = new Date().toISOString()
  }

  // Admin: Review application
  async function reviewApplication(
    applicationId: string,
    review: Omit<ApplicationReview, 'applicationId' | 'reviewedAt'>
  ): Promise<void> {
    const application = applications.value.find(app => app.id === applicationId)
    if (!application) throw new Error('Application not found')

    const fullReview: ApplicationReview = {
      applicationId,
      ...review,
      reviewedAt: new Date().toISOString()
    }

    reviews.value.push(fullReview)

    // Update application status
    application.status = review.status === 'approved' ? 'approved' :
                        review.status === 'rejected' ? 'rejected' :
                        'revision_required'
    application.reviewedAt = fullReview.reviewedAt
    application.reviewedBy = review.reviewerId
    application.reviewNotes = review.notes
    application.updatedAt = new Date().toISOString()
  }

  // Get user's application
  async function getUserApplication(userId: string): Promise<PartnerApplication | undefined> {
    if (!process.client) return undefined

    try {
      const db = getFirestore()
      const applicationsRef = collection(db, 'partnerApplications')
      const q = query(applicationsRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) return undefined

      const application = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      } as PartnerApplication

      return application
    } catch (err: any) {
      console.error('Get user application error:', err)
      return undefined
    }
  }

  // Get application by ID
  async function getApplicationById(applicationId: string): Promise<PartnerApplication | undefined> {
    if (!process.client) return undefined

    try {
      console.log('📄 Getting application:', applicationId)

      // First check if we already have it in the store
      const cachedApp = applications.value.find(app => app.id === applicationId)
      if (cachedApp) {
        console.log('✅ Application found in store cache:', cachedApp.id)
        return cachedApp
      }

      // If not in store, fetch from Firestore
      console.log('📡 Fetching from Firestore:', applicationId)
      const db = getFirestore()
      const appRef = doc(db, 'partnerApplications', applicationId)
      const appSnap = await getDoc(appRef)

      if (!appSnap.exists()) {
        console.warn('⚠️ Application document does not exist in Firestore:', applicationId)
        return undefined
      }

      const application = {
        id: appSnap.id,
        ...appSnap.data()
      } as PartnerApplication

      console.log('✅ Application fetched from Firestore:', application.id)

      // Add to store cache
      applications.value.push(application)

      return application
    } catch (err: any) {
      console.error('❌ Get application by ID error:', err)
      return undefined
    }
  }

  // Calculate completion percentage
  function getCompletionPercentage(application: PartnerApplication): number {
    return Math.round((application.completedSteps.length / 5) * 100)
  }

  // Admin: Delete application (permanently delete from Firestore)
  async function deleteApplication(applicationId: string): Promise<void> {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      const db = getFirestore()

      // Check current user auth and role
      const { $firebase } = useNuxtApp()
      const currentUser = $firebase.auth.currentUser

      console.log('🔍 Delete attempt:', {
        applicationId,
        currentUserId: currentUser?.uid,
        userEmail: currentUser?.email
      })

      // Get user role from Firestore
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const userData = userSnap.data()
          console.log('👤 Current user role:', userData.role)

          if (userData.role !== 'admin') {
            throw new Error('คุณไม่มีสิทธิ์ลบใบสมัคร (ต้องเป็น admin)')
          }
        } else {
          throw new Error('ไม่พบข้อมูลผู้ใช้ในระบบ')
        }
      } else {
        throw new Error('กรุณา login ก่อนลบใบสมัคร')
      }

      const appRef = doc(db, 'partnerApplications', applicationId)

      // Get application to check if it exists
      const appSnap = await getDoc(appRef)
      if (!appSnap.exists()) {
        throw new Error('Application not found')
      }

      const appData = appSnap.data() as PartnerApplication

      console.log('📄 Attempting to delete application:', {
        id: applicationId,
        userId: appData.userId,
        status: appData.status
      })

      // Delete from Firestore (permanently)
      await deleteDoc(appRef)

      // Remove from local state
      applications.value = applications.value.filter(app => app.id !== applicationId)

      console.log('✅ Application permanently deleted from Firestore:', applicationId)
    } catch (err: any) {
      console.error('❌ Delete application error:', err)
      console.error('Error code:', err.code)
      console.error('Error message:', err.message)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    applications,
    currentApplication,
    reviews,
    loading,
    error,
    initializeApplication,
    savePersonalInfo,
    saveProfessionalInfo,
    uploadDocument,
    completeDocumentStep,
    saveFinancialInfo,
    saveBackgroundCheck,
    submitApplication,
    fetchAllApplications,
    getAllApplications,
    getApplicationsByStatus,
    updateApplicationStatus,
    reviewApplication,
    getUserApplication,
    getApplicationById,
    getCompletionPercentage,
    deleteApplication
  }
})
