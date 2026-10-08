/**
 * Composable for fixing oversized partner applications
 * Use this to automatically fix documents before saving
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore'
import type { PartnerApplication } from '~/types/application'
import { estimateDocumentSize, formatBytes, optimizeProfileImages } from '~/utils/document-size'

export function useApplicationFixer() {
  const { $firebase } = useNuxtApp()

  /**
   * Fix a single application by ID
   */
  async function fixApplication(applicationId: string): Promise<{
    success: boolean
    beforeSize: number
    afterSize: number
    message: string
  }> {
    if (!process.client) {
      throw new Error('Must run on client side')
    }

    try {
      console.log('🔧 Fixing application:', applicationId)

      const db = $firebase.db
      const appRef = doc(db, 'partnerApplications', applicationId)
      const appSnap = await getDoc(appRef)

      if (!appSnap.exists()) {
        throw new Error('Application not found')
      }

      const currentData = appSnap.data() as PartnerApplication
      const beforeSize = estimateDocumentSize(currentData)

      console.log('📊 Current size:', formatBytes(beforeSize))

      // Optimize profile images
      let optimizedImages = []
      if (currentData.profileImages && currentData.profileImages.length > 0) {
        console.log('🖼️  Original images:', currentData.profileImages.length)

        // Optimize each image (remove metadata)
        optimizedImages = optimizeProfileImages(currentData.profileImages)

        // Limit to 8 images max
        if (optimizedImages.length > 8) {
          console.warn('⚠️  Limiting to 8 images')
          optimizedImages = optimizedImages.slice(0, 8)
        }

        console.log('✅ Optimized images:', optimizedImages.length)
      }

      // Update document
      await updateDoc(appRef, {
        profileImages: optimizedImages,
        updatedAt: new Date().toISOString()
      })

      // Calculate new size
      const newData = { ...currentData, profileImages: optimizedImages }
      const afterSize = estimateDocumentSize(newData)

      const savedBytes = beforeSize - afterSize
      const savedPercent = ((savedBytes / beforeSize) * 100).toFixed(1)

      console.log('✅ Fixed successfully!')
      console.log('📊 New size:', formatBytes(afterSize))
      console.log('💾 Saved:', formatBytes(savedBytes), `(${savedPercent}%)`)

      return {
        success: true,
        beforeSize,
        afterSize,
        message: `ลดขนาดจาก ${formatBytes(beforeSize)} เป็น ${formatBytes(afterSize)} (ประหยัด ${savedPercent}%)`
      }
    } catch (error: any) {
      console.error('❌ Fix failed:', error)
      return {
        success: false,
        beforeSize: 0,
        afterSize: 0,
        message: `เกิดข้อผิดพลาด: ${error.message}`
      }
    }
  }

  /**
   * Check if application needs fixing
   */
  async function needsFix(applicationId: string): Promise<boolean> {
    if (!process.client) return false

    try {
      const db = $firebase.db
      const appRef = doc(db, 'partnerApplications', applicationId)
      const appSnap = await getDoc(appRef)

      if (!appSnap.exists()) return false

      const currentData = appSnap.data() as PartnerApplication
      const size = estimateDocumentSize(currentData)

      // Needs fix if over 900KB
      return size > 900000
    } catch (error) {
      console.error('Error checking if needs fix:', error)
      return false
    }
  }

  return {
    fixApplication,
    needsFix
  }
}
