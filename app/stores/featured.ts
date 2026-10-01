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
  limit
} from 'firebase/firestore'
import type { FeaturedItem, CreateFeaturedInput } from '~/types/featured'
import { generateId } from '~/utils/id-generator'

export const useFeaturedStore = defineStore('featured', () => {
  const featuredItems = ref<FeaturedItem[]>([])
  const activeFeaturedItems = ref<FeaturedItem[]>([])
  const loading = ref(false)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  /**
   * Create a featured item
   */
  async function createFeaturedItem(input: CreateFeaturedInput): Promise<FeaturedItem | null> {
    if (!process.client) return null

    try {
      loading.value = true
      const db = getFirestore()

      const featuredId = generateId('FEATURED')
      const now = new Date().toISOString()

      const featuredItem: FeaturedItem = {
        id: featuredId,
        type: input.type,
        itemId: input.itemId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        startDate: input.startDate,
        endDate: input.endDate,
        priority: input.priority || 0,
        isActive: true,
        clickCount: 0,
        impressionCount: 0,
        createdAt: now,
        updatedAt: now,
        createdBy: input.createdBy
      }

      await setDoc(doc(db, 'featuredItems', featuredId), featuredItem)

      featuredItems.value.push(featuredItem)
      return featuredItem
    } catch (err: any) {
      console.error('Create featured item error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a featured item
   */
  async function updateFeaturedItem(
    featuredId: string,
    updates: Partial<FeaturedItem>
  ): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const featuredRef = doc(db, 'featuredItems', featuredId)

      await updateDoc(featuredRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      const index = featuredItems.value.findIndex(item => item.id === featuredId)
      if (index !== -1) {
        featuredItems.value[index] = {
          ...featuredItems.value[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }

      return true
    } catch (err: any) {
      console.error('Update featured item error:', err)
      return false
    }
  }

  /**
   * Delete a featured item
   */
  async function deleteFeaturedItem(featuredId: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      await deleteDoc(doc(db, 'featuredItems', featuredId))

      // Update local state
      featuredItems.value = featuredItems.value.filter(item => item.id !== featuredId)
      activeFeaturedItems.value = activeFeaturedItems.value.filter(item => item.id !== featuredId)

      return true
    } catch (err: any) {
      console.error('Delete featured item error:', err)
      return false
    }
  }

  /**
   * Get all featured items (admin)
   */
  async function getAllFeaturedItems(): Promise<FeaturedItem[]> {
    if (!process.client) return []

    try {
      loading.value = true
      const db = getFirestore()
      const featuredRef = collection(db, 'featuredItems')

      const q = query(featuredRef, orderBy('priority', 'desc'), orderBy('createdAt', 'desc'))

      const querySnapshot = await getDocs(q)
      const results: FeaturedItem[] = []

      querySnapshot.forEach((doc) => {
        results.push(doc.data() as FeaturedItem)
      })

      featuredItems.value = results
      return results
    } catch (err: any) {
      console.error('Get all featured items error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get active featured items (public)
   */
  async function getActiveFeaturedItems(itemLimit: number = 10): Promise<FeaturedItem[]> {
    if (!process.client) return []

    try {
      loading.value = true
      const db = getFirestore()
      const featuredRef = collection(db, 'featuredItems')

      const now = new Date().toISOString()

      const q = query(
        featuredRef,
        where('isActive', '==', true),
        where('startDate', '<=', now),
        where('endDate', '>=', now),
        orderBy('startDate'),
        orderBy('priority', 'desc'),
        limit(itemLimit)
      )

      const querySnapshot = await getDocs(q)
      const results: FeaturedItem[] = []

      querySnapshot.forEach((doc) => {
        results.push(doc.data() as FeaturedItem)
      })

      activeFeaturedItems.value = results
      return results
    } catch (err: any) {
      console.error('Get active featured items error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Track impression (view)
   */
  async function trackImpression(featuredId: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const featuredRef = doc(db, 'featuredItems', featuredId)
      const featuredSnap = await getDoc(featuredRef)

      if (!featuredSnap.exists()) return

      const featuredItem = featuredSnap.data() as FeaturedItem

      await updateDoc(featuredRef, {
        impressionCount: featuredItem.impressionCount + 1
      })
    } catch (err: any) {
      console.error('Track impression error:', err)
    }
  }

  /**
   * Track click
   */
  async function trackClick(featuredId: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const featuredRef = doc(db, 'featuredItems', featuredId)
      const featuredSnap = await getDoc(featuredRef)

      if (!featuredSnap.exists()) return

      const featuredItem = featuredSnap.data() as FeaturedItem

      await updateDoc(featuredRef, {
        clickCount: featuredItem.clickCount + 1
      })
    } catch (err: any) {
      console.error('Track click error:', err)
    }
  }

  /**
   * Toggle active status
   */
  async function toggleActive(featuredId: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = getFirestore()
      const featuredRef = doc(db, 'featuredItems', featuredId)
      const featuredSnap = await getDoc(featuredRef)

      if (!featuredSnap.exists()) return false

      const featuredItem = featuredSnap.data() as FeaturedItem

      await updateDoc(featuredRef, {
        isActive: !featuredItem.isActive,
        updatedAt: new Date().toISOString()
      })

      // Update local state
      const index = featuredItems.value.findIndex(item => item.id === featuredId)
      if (index !== -1) {
        featuredItems.value[index].isActive = !featuredItem.isActive
      }

      return true
    } catch (err: any) {
      console.error('Toggle active error:', err)
      return false
    }
  }

  /**
   * Check if item is featured
   */
  function isItemFeatured(itemId: string): boolean {
    return activeFeaturedItems.value.some(item => item.itemId === itemId)
  }

  return {
    featuredItems,
    activeFeaturedItems,
    loading,
    createFeaturedItem,
    updateFeaturedItem,
    deleteFeaturedItem,
    getAllFeaturedItems,
    getActiveFeaturedItems,
    trackImpression,
    trackClick,
    toggleActive,
    isItemFeatured
  }
})
