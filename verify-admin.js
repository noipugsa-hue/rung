// Quick verification script to check if you're an admin
// This will tell us why you're getting permission errors

import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
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

console.log('🔍 Checking your current login status in the browser...\n')
console.log('This script will check:')
console.log('1. Are you currently logged in?')
console.log('2. What is your user ID?')
console.log('3. Do you have admin role in Firestore?\n')
console.log('Please wait...\n')

// Check current auth state (from browser session)
setTimeout(() => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      console.log('❌ You are NOT logged in!')
      console.log('Please log in to the website first, then run this script again.')
      process.exit(1)
    }

    console.log('✅ You are logged in!')
    console.log('📧 Email:', user.email)
    console.log('🆔 User ID:', user.uid)
    console.log()

    // Check role in Firestore
    try {
      const userRef = doc(db, 'users', user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        console.log('❌ User document does NOT exist in Firestore!')
        console.log('This might be why you\'re getting permission errors.')
        process.exit(1)
      }

      const userData = userSnap.data()
      console.log('👤 Your current role:', userData.role)
      console.log()

      if (userData.role === 'admin') {
        console.log('✅ You HAVE admin role!')
        console.log()
        console.log('If you\'re still getting permission errors, it means:')
        console.log('The Firestore Security Rules have NOT been updated yet.')
        console.log()
        console.log('📋 NEXT STEPS:')
        console.log('1. Go to: https://console.firebase.google.com/project/cogent-density-409510/firestore/rules')
        console.log('2. Replace ALL the rules with the content from FIRESTORE-RULES-SETUP.md')
        console.log('3. Click "Publish"')
        console.log('4. Wait 30 seconds, then refresh your website')
      } else {
        console.log('❌ You DO NOT have admin role!')
        console.log('Current role:', userData.role)
        console.log()
        console.log('📋 NEXT STEPS:')
        console.log('Run this command to make yourself an admin:')
        console.log()
        console.log(`node make-admin.js ${user.uid}`)
        console.log()
      }

      process.exit(0)
    } catch (error) {
      console.error('❌ Error reading from Firestore:', error.message)
      console.log()
      console.log('This error suggests the Firestore rules might not be set up.')
      console.log('Please follow FIRESTORE-RULES-SETUP.md to configure the rules.')
      process.exit(1)
    }
  })
}, 1000)
