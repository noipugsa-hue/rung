/**
 * Script to set admin role for a user
 * Usage: node scripts/set-admin.js <email>
 * Example: node scripts/set-admin.js noipugsa@gmail.com
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'

// Firebase config (same as in app/plugins/firebase.client.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBRqaFyVqY1LE7Qjlp-3WVHglxKXFJH0V4",
  authDomain: "cogent-density-409510.firebaseapp.com",
  projectId: "cogent-density-409510",
  storageBucket: "cogent-density-409510.firebasestorage.app",
  messagingSenderId: "837858586615",
  appId: "1:837858586615:web:0c1c4ad5f0b7c3f4949ae2",
  measurementId: "G-HVLMF8TMWP"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function setAdminRole(email) {
  try {
    console.log(`🔍 Searching for user: ${email}`)

    // Query users by email
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      console.log('❌ User not found!')
      console.log('📝 Please make sure:')
      console.log('   1. The email is correct')
      console.log('   2. The user has logged in at least once')
      process.exit(1)
    }

    // Update the first matching user
    const userDoc = querySnapshot.docs[0]
    const userId = userDoc.id
    const userData = userDoc.data()

    console.log(`\n✅ Found user:`)
    console.log(`   ID: ${userId}`)
    console.log(`   Name: ${userData.name}`)
    console.log(`   Email: ${userData.email}`)
    console.log(`   Current Role: ${userData.role || 'user'}`)

    if (userData.role === 'admin') {
      console.log('\n⚠️  User is already an admin!')
      process.exit(0)
    }

    // Update role to admin
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date().toISOString()
    })

    console.log('\n🎉 Success! User role updated to admin')
    console.log('\n⚠️  Important: User must logout and login again to see admin pages')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Get email from command line argument
const email = process.argv[2]

if (!email) {
  console.log('❌ Please provide an email address')
  console.log('Usage: node scripts/set-admin.js <email>')
  console.log('Example: node scripts/set-admin.js noipugsa@gmail.com')
  process.exit(1)
}

// Run the script
setAdminRole(email)
