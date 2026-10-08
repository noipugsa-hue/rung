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

  // Check if user is admin (either role is 'admin' OR isAdmin flag is true)
  if (authStore.user?.role !== 'admin' && !authStore.user?.isAdmin) {
    // Not an admin, redirect to home page
    return navigateTo('/')
  }
})
