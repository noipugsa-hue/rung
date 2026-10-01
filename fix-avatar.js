// Run this in browser console to force sync avatar from Google
const authStore = useAuthStore()
if (authStore.firebaseUser?.photoURL) {
  console.log('Syncing avatar from Google:', authStore.firebaseUser.photoURL)
  // This will be synced on next login
}
