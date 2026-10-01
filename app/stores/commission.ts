import { defineStore } from 'pinia'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore'
import type { CommissionRate } from '~/types/commission'
import { generateId } from '~/utils/id-generator'

export const useCommissionStore = defineStore('commission', () => {
  const rates = ref<CommissionRate[]>([])
  const globalRate = ref<number>(15)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  function initializeDefaultRates() {
    const defaultRate: CommissionRate = {
      id: 'global-default',
      percentage: 15,
      effectiveFrom: '2026-01-01',
      type: 'global',
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    }
    rates.value = [defaultRate]
    globalRate.value = 15
  }

  function getActiveRateForPartner(partnerId: string): number {
    const now = new Date().toISOString()

    // Check partner-specific rate first
    const partnerRate = rates.value
      .filter(r =>
        r.type === 'partner-specific' &&
        r.partnerId === partnerId &&
        r.effectiveFrom <= now &&
        (!r.effectiveTo || r.effectiveTo > now)
      )
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]

    if (partnerRate) return partnerRate.percentage

    // Fall back to global rate
    const activeGlobalRate = rates.value
      .filter(r =>
        r.type === 'global' &&
        r.effectiveFrom <= now &&
        (!r.effectiveTo || r.effectiveTo > now)
      )
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]

    return activeGlobalRate?.percentage || globalRate.value
  }

  // Fetch rates from Firestore
  async function fetchRates(): Promise<void> {
    if (!process.client) return

    try {
      loading.value = true
      error.value = null
      const db = getFirestore()
      const ratesRef = collection(db, 'commissionRates')
      const q = query(ratesRef, orderBy('effectiveFrom', 'desc'))
      const querySnapshot = await getDocs(q)

      rates.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CommissionRate))

      // Update current global rate
      const now = new Date().toISOString()
      const activeGlobalRate = rates.value
        .filter(r =>
          r.type === 'global' &&
          r.effectiveFrom <= now &&
          (!r.effectiveTo || r.effectiveTo > now)
        )
        .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0]

      if (activeGlobalRate) {
        globalRate.value = activeGlobalRate.percentage
      }

      console.log(`✅ Fetched ${rates.value.length} commission rates from Firestore`)
    } catch (err: any) {
      console.error('Fetch commission rates error:', err)
      error.value = err.message
      // Initialize with default if fetch fails
      initializeDefaultRates()
    } finally {
      loading.value = false
    }
  }

  async function updateGlobalRate(percentage: number, effectiveFrom: string) {
    if (!process.client) throw new Error('Firestore operations must run on client side')

    try {
      loading.value = true
      error.value = null
      const db = getFirestore()

      // Close current global rate if exists
      const currentGlobal = rates.value.find(r => r.type === 'global' && !r.effectiveTo)
      if (currentGlobal) {
        currentGlobal.effectiveTo = effectiveFrom
        // Update in Firestore
        const rateRef = doc(db, 'commissionRates', currentGlobal.id)
        await updateDoc(rateRef, {
          effectiveTo: effectiveFrom
        })
      }

      // Create new rate
      const newRate: CommissionRate = {
        id: generateId('RATE'),
        percentage,
        effectiveFrom,
        type: 'global',
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      }

      // Save to Firestore
      const rateRef = doc(db, 'commissionRates', newRate.id)
      await setDoc(rateRef, newRate)

      // Update local state
      rates.value.push(newRate)
      globalRate.value = percentage

      console.log('✅ Commission rate updated successfully:', newRate)
    } catch (err: any) {
      console.error('Update global rate error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    rates,
    globalRate,
    loading,
    error,
    initializeDefaultRates,
    fetchRates,
    getActiveRateForPartner,
    updateGlobalRate
  }
})
