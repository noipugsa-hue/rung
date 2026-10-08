import { ref } from 'vue'
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import type { ProfileImage } from '~/types/application'

export interface ImageUploadResult {
  success: boolean
  error?: string
  image?: ProfileImage
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_WIDTH = 800
const MIN_HEIGHT = 800
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function useImageUpload() {
  const uploadProgress = ref<number>(0)
  const isUploading = ref<boolean>(false)

  /**
   * Validate file type
   */
  function validateFileType(file: File): ValidationResult {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'ประเภทไฟล์ไม่ถูกต้อง กรุณาอัปโหลดไฟล์ JPG, PNG หรือ WebP เท่านั้น'
      }
    }
    return { valid: true }
  }

  /**
   * Validate file size
   */
  function validateFileSize(file: File): ValidationResult {
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2)
      return {
        valid: false,
        error: `ไฟล์มีขนาดใหญ่เกินไป (${sizeMB} MB) กรุณาอัปโหลดไฟล์ขนาดไม่เกิน 10 MB`
      }
    }
    return { valid: true }
  }

  /**
   * Validate image dimensions
   */
  function validateImageDimensions(file: File): Promise<ValidationResult> {
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)

        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          resolve({
            valid: false,
            error: `ความละเอียดของรูปต่ำเกินไป (${img.width}x${img.height}px) กรุณาอัปโหลดรูปขนาดอย่างน้อย 800x800 พิกเซล`
          })
        } else {
          resolve({ valid: true })
        }
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({
          valid: false,
          error: 'ไม่สามารถอ่านไฟล์รูปภาพได้ กรุณาลองใหม่อีกครั้ง'
        })
      }

      img.src = objectUrl
    })
  }

  /**
   * Get image dimensions
   */
  function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        resolve({ width: img.width, height: img.height })
      }

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('ไม่สามารถอ่านขนาดรูปภาพได้'))
      }

      img.src = objectUrl
    })
  }

  /**
   * Validate all image requirements
   */
  async function validateImage(file: File): Promise<ValidationResult> {
    // Check file type
    const typeValidation = validateFileType(file)
    if (!typeValidation.valid) {
      return typeValidation
    }

    // Check file size
    const sizeValidation = validateFileSize(file)
    if (!sizeValidation.valid) {
      return sizeValidation
    }

    // Check dimensions
    const dimensionsValidation = await validateImageDimensions(file)
    if (!dimensionsValidation.valid) {
      return dimensionsValidation
    }

    return { valid: true }
  }

  /**
   * Upload image to Firebase Storage
   */
  async function uploadToFirebase(
    file: File,
    applicationId: string,
    order: number = 0,
    isPrimary: boolean = false
  ): Promise<ImageUploadResult> {
    try {
      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type)

      // Validate image first
      const validation = await validateImage(file)
      if (!validation.valid) {
        console.error('Validation failed:', validation.error)
        return {
          success: false,
          error: validation.error
        }
      }

      console.log('Validation passed, uploading to Firebase Storage...')

      isUploading.value = true
      uploadProgress.value = 0

      // Get dimensions
      const dimensions = await getImageDimensions(file)

      // Generate unique filename
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 9)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}_${randomStr}.${extension}`

      // Storage path
      const storagePath = `partner-applications/${applicationId}/profile-images/${filename}`

      // Upload to Firebase
      const storage = getStorage()
      const fileRef = storageRef(storage, storagePath)
      const uploadTask = uploadBytesResumable(fileRef, file)

      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Update progress
            uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          },
          (error) => {
            // Handle error
            console.error('Firebase Storage upload error:', error)
            console.error('Error code:', error.code)
            console.error('Error message:', error.message)

            isUploading.value = false
            uploadProgress.value = 0

            let errorMessage = 'เกิดข้อผิดพลาดในการอัปโหลด กรุณาลองใหม่อีกครั้ง'
            if (error.code === 'storage/unauthorized') {
              errorMessage = 'คุณไม่มีสิทธิ์อัปโหลดไฟล์ กรุณาเข้าสู่ระบบใหม่'
            } else if (error.code === 'storage/canceled') {
              errorMessage = 'การอัปโหลดถูกยกเลิก'
            } else if (error.code === 'storage/unknown') {
              errorMessage = `เกิดข้อผิดพลาด: ${error.message}`
            }

            resolve({
              success: false,
              error: errorMessage
            })
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

              const profileImage: ProfileImage = {
                url: downloadURL,
                isPrimary: isPrimary,
                order: order,
                // Optional metadata
                filename: file.name,
                storagePath: storagePath,
                uploadedAt: new Date().toISOString()
              }

              isUploading.value = false
              uploadProgress.value = 0

              resolve({
                success: true,
                image: profileImage
              })
            } catch (error) {
              isUploading.value = false
              uploadProgress.value = 0

              resolve({
                success: false,
                error: 'ไม่สามารถรับ URL ของรูปภาพได้ กรุณาลองใหม่อีกครั้ง'
              })
            }
          }
        )
      })
    } catch (error) {
      isUploading.value = false
      uploadProgress.value = 0

      return {
        success: false,
        error: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
      }
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  async function deleteFromFirebase(storagePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const storage = getStorage()
      const fileRef = storageRef(storage, storagePath)
      await deleteObject(fileRef)

      return { success: true }
    } catch (error: any) {
      let errorMessage = 'ไม่สามารถลบรูปภาพได้ กรุณาลองใหม่อีกครั้ง'

      if (error.code === 'storage/object-not-found') {
        // File doesn't exist, consider it a success
        return { success: true }
      } else if (error.code === 'storage/unauthorized') {
        errorMessage = 'คุณไม่มีสิทธิ์ลบไฟล์นี้'
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  return {
    uploadProgress,
    isUploading,
    validateFileType,
    validateFileSize,
    validateImageDimensions,
    validateImage,
    getImageDimensions,
    uploadToFirebase,
    deleteFromFirebase
  }
}
