import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyAM_4uwOz7QWt3pKk7RufjjCt6qKuT7kRY",
    authDomain: "cogent-density-409510.firebaseapp.com",
    projectId: "cogent-density-409510",
    storageBucket: "cogent-density-409510.firebasestorage.app",
    messagingSenderId: "588967771320",
    appId: "1:588967771320:web:abb6b6227990d6c06c084d",
    measurementId: "G-MGQS3FQWHY"
  }

  // Initialize Firebase
  const app = initializeApp(firebaseConfig)

  // Initialize Firebase services
  const auth = getAuth(app)
  const analytics = getAnalytics(app)
  const db = getFirestore(app)
  const storage = getStorage(app)

  return {
    provide: {
      firebase: {
        app,
        auth,
        analytics,
        db,
        storage
      }
    }
  }
})
