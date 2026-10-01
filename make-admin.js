// Script to make a user admin
// Run this once with: node make-admin.js

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBnH5Pxu6ZG7pW0z5KF1z8VsJy8HQhVZqs",
  authDomain: "cogent-density-409510.firebaseapp.com",
  projectId: "cogent-density-409510",
  storageBucket: "cogent-density-409510.firebasestorage.app",
  messagingSenderId: "1057836913434",
  appId: "1:1057836913434:web:7c8e9d0a1b2c3d4e5f6g7h"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ⚠️ แก้ไข userId ที่ต้องการให้เป็น admin
const USER_ID_TO_MAKE_ADMIN = 'YOUR_USER_ID_HERE' // <-- ใส่ User ID ของคุณที่นี่

async function makeAdmin() {
  try {
    console.log('🔍 Checking user:', USER_ID_TO_MAKE_ADMIN)

    const userRef = doc(db, 'users', USER_ID_TO_MAKE_ADMIN)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      console.error('❌ User not found:', USER_ID_TO_MAKE_ADMIN)
      return
    }

    const userData = userSnap.data()
    console.log('👤 Current role:', userData.role)

    if (userData.role === 'admin') {
      console.log('✅ User is already admin')
      return
    }

    // Update to admin
    await updateDoc(userRef, {
      role: 'admin'
    })

    console.log('✅ Successfully updated user to admin!')
    console.log('🎉 You can now delete applications')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

makeAdmin()
