import { defineStore } from 'pinia'
import { collection, doc, setDoc, updateDoc, getDocs, getDoc, query, orderBy } from 'firebase/firestore'
import type { Lung } from '~/types'
import type { PartnerApplication } from '~/types/application'
import { generateId } from '~/utils/id-generator'
import { initializeTrial } from '~/utils/trial'

export const useLungStore = defineStore('lung', () => {
  const lungs = ref<Lung[]>([])
  const currentLung = ref<Lung | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Fetch all lungs from Firestore
  const fetchLungs = async () => {
    if (!process.client) return

    loading.value = true
    error.value = null
    try {
      const db = getFirestore()
      const lungsRef = collection(db, 'lungs')
      const q = query(lungsRef, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)

      lungs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Lung))
    } catch (e: any) {
      error.value = 'Failed to fetch lungs'
      console.error('Fetch lungs error:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch lung by ID from Firestore
  const fetchLungById = async (id: string) => {
    if (!process.client) return

    loading.value = true
    error.value = null
    try {
      const db = getFirestore()
      const lungRef = doc(db, 'lungs', id)
      const lungSnap = await getDoc(lungRef)

      if (lungSnap.exists()) {
        currentLung.value = {
          id: lungSnap.id,
          ...lungSnap.data()
        } as Lung
      } else {
        error.value = 'Lung not found'
        currentLung.value = null
      }
    } catch (e: any) {
      error.value = 'Failed to fetch lung'
      console.error('Fetch lung by ID error:', e)
    } finally {
      loading.value = false
    }
  }

  // Search lungs from loaded data
  const searchLungs = (query: {
    categories?: string[]
    location?: string
    minPrice?: number
    maxPrice?: number
    available?: boolean
  }) => {
    let filtered = lungs.value

    if (query.categories && query.categories.length > 0) {
      filtered = filtered.filter(lung =>
        query.categories!.some(cat => lung.categories.includes(cat))
      )
    }

    if (query.location) {
      filtered = filtered.filter(lung =>
        lung.location.toLowerCase().includes(query.location!.toLowerCase())
      )
    }

    if (query.minPrice !== undefined) {
      filtered = filtered.filter(lung => lung.price >= query.minPrice!)
    }

    if (query.maxPrice !== undefined) {
      filtered = filtered.filter(lung => lung.price <= query.maxPrice!)
    }

    if (query.available) {
      filtered = filtered.filter(lung => lung.available)
    }

    return filtered
  }

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  /**
   * Create a Lung profile from an approved PartnerApplication
   * This function is called when admin approves an application
   */
  async function createLungFromApplication(application: PartnerApplication): Promise<Lung> {
    if (!process.client) {
      throw new Error('Firestore operations must run on client side')
    }

    console.log('🔍 lung.ts: Received application data:', {
      hasPersonalInfo: !!application.personalInfo,
      hasProfessionalInfo: !!application.professionalInfo,
      hasProfileImages: !!application.profileImages,
      applicationKeys: Object.keys(application),
      personalInfoKeys: application.personalInfo ? Object.keys(application.personalInfo) : [],
      professionalInfoKeys: application.professionalInfo ? Object.keys(application.professionalInfo) : []
    })

    if (!application.personalInfo || !application.professionalInfo) {
      console.error('❌ Validation failed in lung.ts:', {
        personalInfo: application.personalInfo,
        professionalInfo: application.professionalInfo
      })
      throw new Error('Application is missing required information')
    }

    try {
      loading.value = true
      const db = getFirestore()

      // 1. Find primary image
      const primaryImage = application.profileImages?.find(img => img.isPrimary)

      // 2. Sort gallery (primary first, then by order)
      const gallery = application.profileImages
        ?.sort((a, b) => {
          if (a.isPrimary) return -1
          if (b.isPrimary) return 1
          return a.order - b.order
        })
        .map(img => img.url) || []

      // 3. Create Lung profile with 7-day trial (0% commission)
      const lungId = generateId('LUNG')
      const now = new Date().toISOString()
      const lungProfile: Lung = {
        id: lungId,
        userId: application.userId, // Link to user profile
        name: `${application.personalInfo.firstName} ${application.personalInfo.lastName}`,
        age: calculateAge(application.personalInfo.dateOfBirth),
        avatar: primaryImage?.url || gallery[0] || '',
        location: `${application.personalInfo.district}, ${application.personalInfo.province}`,
        bio: application.professionalInfo.experience,
        rating: 5.0,
        reviewCount: 0,
        price: 0, // Lung will set their own price later
        categories: application.professionalInfo.preferredActivities,
        languages: application.professionalInfo.languages,
        experience: application.professionalInfo.experience,
        verified: true,
        available: true,
        instantBook: false,
        reviews: [],
        availability: [],
        gallery: gallery,
        galleryMetadata: {
          primaryIndex: 0,
          lastUpdated: now
        },
        trialStartedAt: initializeTrial(), // Start 7-day trial with 0% commission
        createdAt: now,
        updatedAt: now
      }

      // 4. Save to Firestore
      const lungRef = doc(db, 'lungs', lungProfile.id)
      await setDoc(lungRef, lungProfile)

      // 5. Update user role
      const userRef = doc(db, 'users', application.userId)
      await updateDoc(userRef, {
        role: 'lung',
        lungId: lungProfile.id
      })

      // Add to local state
      lungs.value.push(lungProfile)

      return lungProfile
    } catch (err: any) {
      console.error('Create lung from application error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update lung profile
   */
  async function updateLung(lungId: string, updates: Partial<Lung>): Promise<void> {
    if (!process.client) {
      throw new Error('Firestore operations must run on client side')
    }

    try {
      loading.value = true
      const db = getFirestore()

      // Update in Firestore
      const lungRef = doc(db, 'lungs', lungId)
      await updateDoc(lungRef, updates)

      // Update local state
      const index = lungs.value.findIndex(l => l.id === lungId)
      if (index !== -1) {
        lungs.value[index] = { ...lungs.value[index], ...updates }
      }

      if (currentLung.value && currentLung.value.id === lungId) {
        currentLung.value = { ...currentLung.value, ...updates }
      }
    } catch (err: any) {
      console.error('Update lung error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update lung images (avatar, gallery, metadata)
   */
  async function updateLungImages(
    lungId: string,
    images: {
      avatar: string
      gallery: string[]
      galleryMetadata?: { primaryIndex: number; lastUpdated: string }
    }
  ): Promise<void> {
    if (!process.client) {
      throw new Error('Firestore operations must run on client side')
    }

    try {
      loading.value = true
      const db = getFirestore()

      const updates = {
        avatar: images.avatar,
        gallery: images.gallery,
        galleryMetadata: images.galleryMetadata || {
          primaryIndex: 0,
          lastUpdated: new Date().toISOString()
        }
      }

      const lungRef = doc(db, 'lungs', lungId)
      await updateDoc(lungRef, updates)

      // Update local state
      const index = lungs.value.findIndex(l => l.id === lungId)
      if (index !== -1) {
        lungs.value[index] = { ...lungs.value[index], ...updates }
      }

      if (currentLung.value?.id === lungId) {
        currentLung.value = { ...currentLung.value, ...updates }
      }
    } catch (err: any) {
      console.error('Update lung images error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    lungs,
    currentLung,
    loading,
    error,
    fetchLungs,
    fetchLungById,
    searchLungs,
    createLungFromApplication,
    updateLung,
    updateLungImages,
  }
})
