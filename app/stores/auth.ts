import { defineStore } from 'pinia'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  type User as FirebaseUser
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'
import { getTrialStatus, initializeTrial } from '~/utils/trial'
import type { TrialStatus } from '~/types/trial'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'user' | 'lung' | 'admin'
  trialStartedAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const firebaseUser = shallowRef<FirebaseUser | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  const loading = ref(false)
  const initialized = ref(false)

  // Trial status for current user (50% discount for 7 days)
  const userTrialStatus = computed<TrialStatus | null>(() => {
    if (!user.value) return null
    return getTrialStatus(user.value.trialStartedAt)
  })

  // Get Firebase instances
  const getFirebaseAuth = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.auth
  }

  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  // Create or update user profile in Firestore
  const syncUserProfile = async (fbUser: FirebaseUser, role: 'user' | 'lung' | 'admin' = 'user') => {
    try {
      const db = getFirestore()
      const userRef = doc(db, 'users', fbUser.uid)
      const userSnap = await getDoc(userRef)

      if (userSnap.exists()) {
        // User exists, load their data
        const userData = userSnap.data()
        // Priority: Google photoURL > stored avatar > default
        const avatar = fbUser.photoURL || userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || fbUser.displayName || 'User')}&background=FFDBB5&color=FF6B35&size=150`

        return {
          id: fbUser.uid,
          name: userData.name || fbUser.displayName || 'ผู้ใช้',
          email: userData.email || fbUser.email || '',
          avatar,
          role: userData.role || 'user',
          trialStartedAt: userData.trialStartedAt
        } as User
      } else {
        // Create new user document with 7-day trial
        const userName = fbUser.displayName || 'ผู้ใช้'
        const defaultAvatar = fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FFDBB5&color=FF6B35&size=150`

        const newUser = {
          id: fbUser.uid,
          name: userName,
          email: fbUser.email || '',
          avatar: defaultAvatar,
          role,
          trialStartedAt: initializeTrial(), // Start 7-day trial
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        await setDoc(userRef, newUser)
        return newUser as User
      }
    } catch (error) {
      console.error('Sync user profile error:', error)
      // Fallback to Firebase user data
      const userName = fbUser.displayName || 'ผู้ใช้'
      return {
        id: fbUser.uid,
        name: userName,
        email: fbUser.email || '',
        avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=FFDBB5&color=FF6B35&size=150`,
        role
      } as User
    }
  }

  // Initialize auth listener
  const initAuth = () => {
    if (initialized.value || !process.client) return

    const auth = getFirebaseAuth()

    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Use markRaw to prevent Vue from making Firebase user reactive
        firebaseUser.value = markRaw(fbUser) as any
        // Load user profile from Firestore
        user.value = await syncUserProfile(fbUser)
      } else {
        firebaseUser.value = null
        user.value = null
      }
    })

    initialized.value = true
  }

  // Login with Firebase
  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const auth = getFirebaseAuth()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      firebaseUser.value = markRaw(userCredential.user) as any
      user.value = await syncUserProfile(userCredential.user)

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'เข้าสู่ระบบไม่สำเร็จ'

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'ไม่พบผู้ใช้งานนี้'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'รหัสผ่านไม่ถูกต้อง'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'ลองใหม่อีกครั้งในภายหลัง'
      }

      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Register with Firebase
  const register = async (name: string, email: string, password: string) => {
    loading.value = true
    try {
      const auth = getFirebaseAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FFDBB5&color=FF6B35&size=150`

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: name,
        photoURL: defaultAvatar
      })

      firebaseUser.value = markRaw(userCredential.user) as any
      // Create user profile in Firestore
      user.value = await syncUserProfile(userCredential.user, 'user')

      return { success: true }
    } catch (error: any) {
      console.error('Register error:', error)
      let errorMessage = 'สมัครสมาชิกไม่สำเร็จ'

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'อีเมลนี้ถูกใช้งานแล้ว'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'รหัสผ่านควรมีอย่างน้อย 6 ตัวอักษร'
      }

      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Sign in with Google
  const signInWithGoogle = async (useRedirect = false) => {
    loading.value = true
    try {
      const auth = getFirebaseAuth()
      const provider = new GoogleAuthProvider()

      // Add custom parameters to get profile info
      provider.addScope('profile')
      provider.addScope('email')

      if (useRedirect) {
        // Use redirect method (fallback for popup-blocked scenarios)
        await signInWithRedirect(auth, provider)
        return { success: true, redirect: true }
      } else {
        // Use popup method (preferred)
        const result = await signInWithPopup(auth, provider)

        firebaseUser.value = markRaw(result.user) as any
        user.value = await syncUserProfile(result.user)

        return { success: true }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      let errorMessage = 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ'

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'ปิดหน้าต่างเข้าสู่ระบบ'
      } else if (error.code === 'auth/popup-blocked') {
        // Try redirect method if popup is blocked
        return await signInWithGoogle(true)
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'ยกเลิกการเข้าสู่ระบบ'
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'โดเมนนี้ไม่ได้รับอนุญาต กรุณาตรวจสอบการตั้งค่า Firebase'
      }

      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Handle redirect result (called on page load)
  const handleRedirectResult = async () => {
    if (!process.client) return

    try {
      const auth = getFirebaseAuth()
      const result = await getRedirectResult(auth)

      if (result && result.user) {
        firebaseUser.value = markRaw(result.user) as any
        user.value = await syncUserProfile(result.user)
      }
    } catch (error) {
      console.error('Redirect result error:', error)
    }
  }

  // Logout
  const logout = async () => {
    try {
      const auth = getFirebaseAuth()
      await signOut(auth)
      user.value = null
      firebaseUser.value = null
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    firebaseUser,
    isAuthenticated,
    loading,
    userTrialStatus,
    initAuth,
    login,
    register,
    signInWithGoogle,
    handleRedirectResult,
    logout,
  }
})
