/**
 * Utility to fix oversized partner application documents
 * Run this in browser console to optimize an existing application
 */

import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore'
import type { PartnerApplication } from '~/types/application'
import { optimizeProfileImages, estimateDocumentSize, formatBytes } from './document-size'

/**
 * Fix an oversized partner application by optimizing profile images
 */
export async function fixOversizedApplication(applicationId: string): Promise<void> {
  if (!process.client) {
    throw new Error('This function must run on client side')
  }

  try {
    console.log('🔧 Fixing oversized application:', applicationId)

    const { $firebase } = useNuxtApp()
    const db = $firebase.db

    // Get current document
    const appRef = doc(db, 'partnerApplications', applicationId)
    const appSnap = await getDoc(appRef)

    if (!appSnap.exists()) {
      throw new Error('Application not found')
    }

    const currentData = appSnap.data() as PartnerApplication

    // Log current size
    const currentSize = estimateDocumentSize(currentData)
    console.log('📊 Current size:', formatBytes(currentSize))

    // Optimize profile images
    if (currentData.profileImages && currentData.profileImages.length > 0) {
      console.log('🖼️  Optimizing', currentData.profileImages.length, 'profile images...')

      const optimizedImages = optimizeProfileImages(currentData.profileImages)

      // Limit to max 8 images if needed
      const limitedImages = optimizedImages.slice(0, 8)

      if (limitedImages.length < currentData.profileImages.length) {
        console.warn(
          `⚠️  Reduced image count from ${currentData.profileImages.length} to ${limitedImages.length}`
        )
      }

      // Update document with optimized data
      await updateDoc(appRef, {
        profileImages: limitedImages,
        updatedAt: new Date().toISOString()
      })

      // Verify new size
      const newData = { ...currentData, profileImages: limitedImages }
      const newSize = estimateDocumentSize(newData)

      console.log('✅ Fixed! New size:', formatBytes(newSize))
      console.log('📉 Reduced by:', formatBytes(currentSize - newSize))

      if (newSize >= 1048576) {
        console.error(
          '❌ Document is still too large! You may need to reduce the number of images further.'
        )
      }
    } else {
      console.log('ℹ️  No profile images to optimize')
    }
  } catch (error: any) {
    console.error('❌ Error fixing application:', error.message)
    throw error
  }
}

/**
 * Analyze application size breakdown
 */
export function analyzeApplicationSize(application: PartnerApplication): void {
  console.log('📊 Application Size Analysis:')
  console.log('═'.repeat(50))

  const totalSize = estimateDocumentSize(application)
  console.log('Total Size:', formatBytes(totalSize))
  console.log('')

  // Analyze each section
  const sections = [
    { name: 'Personal Info', data: application.personalInfo },
    { name: 'Professional Info', data: application.professionalInfo },
    { name: 'Financial Info', data: application.financialInfo },
    { name: 'Background Check', data: application.backgroundCheck },
    { name: 'Documents', data: application.documents },
    { name: 'Profile Images', data: application.profileImages }
  ]

  sections.forEach(section => {
    if (section.data) {
      const size = estimateDocumentSize(section.data)
      const percentage = ((size / totalSize) * 100).toFixed(1)
      console.log(`${section.name}:`.padEnd(20), formatBytes(size).padStart(12), `(${percentage}%)`)
    }
  })

  console.log('═'.repeat(50))

  if (application.profileImages) {
    console.log(`\nProfile Images: ${application.profileImages.length} images`)
    console.log('Recommendation: Keep images under 8 for best performance')
  }
}
