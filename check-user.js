// Quick script to check your current user ID and role
// Run this with: node check-user.js

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBnH5Pxu6ZG7pW0z5KF1z8VsJy8HQhVZqs",
  authDomain: "cogent-density-409510.firebaseapp.com",
  projectId: "cogent-density-409510",
  storageBucket: "cogent-density-409510.firebasestorage.app",
  messagingSenderId: "1057836913434",
  appId: "1:1057836913434:web:7c8e9d0a1b2c3d4e5f6g7h"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// ⚠️ Enter your email and password here
const EMAIL = 'your-email@example.com'  // <-- Change this
const PASSWORD = 'your-password'         // <-- Change this

async function checkUser() {
  try {
    console.log('🔐 Signing in...')
    const userCredential = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD)
    const user = userCredential.user

    console.log('\n✅ Signed in successfully!')
    console.log('📧 Email:', user.email)
    console.log('🆔 User ID:', user.uid)
    console.log('\n' + '='.repeat(50))
    console.log('Copy this User ID for make-admin.js:')
    console.log(user.uid)
    console.log('='.repeat(50) + '\n')

    // Check current role in Firestore
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      const userData = userSnap.data()
      console.log('👤 Current role:', userData.role)

      if (userData.role === 'admin') {
        console.log('✅ You are already an admin!')
      } else {
        console.log('⚠️  You are NOT an admin. Run make-admin.js to fix this.')
      }
    } else {
      console.log('⚠️  User document not found in Firestore')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkUser()
