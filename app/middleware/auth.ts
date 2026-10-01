export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (process.client && !authStore.isAuthenticated) {
    authStore.initAuth()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to login with the intended destination
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
