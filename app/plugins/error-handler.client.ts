export default defineNuxtPlugin((nuxtApp) => {
  // Suppress cross-origin errors from Google OAuth popup
  // These are expected and don't affect functionality
  if (process.client) {
    // Suppress window errors
    const originalErrorHandler = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      const msg = typeof message === 'string' ? message : String(message)
      if (
        msg.includes('cross-origin') ||
        msg.includes('__v_isRef') ||
        msg.includes('__v_skip') ||
        msg.includes('Blocked a frame')
      ) {
        return true // Prevent error from being logged
      }
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error)
      }
      return false
    }

    // Suppress unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || String(event.reason)
      if (
        message.includes('cross-origin') ||
        message.includes('__v_isRef') ||
        message.includes('__v_skip') ||
        message.includes('Blocked a frame')
      ) {
        event.preventDefault()
        return
      }
    })

    // Suppress Vue warnings related to cross-origin
    const originalConsoleWarn = console.warn
    console.warn = (...args: any[]) => {
      const message = args.join(' ')
      if (
        message.includes('Unhandled error during execution of scheduler flush') ||
        message.includes('cross-origin') ||
        message.includes('__v_isRef') ||
        message.includes('__v_skip')
      ) {
        return // Suppress the warning
      }
      originalConsoleWarn.apply(console, args)
    }

    // Suppress console errors related to cross-origin
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args.join(' ')
      if (
        message.includes('cross-origin') ||
        message.includes('__v_isRef') ||
        message.includes('__v_skip') ||
        message.includes('Blocked a frame')
      ) {
        return // Suppress the error
      }
      originalConsoleError.apply(console, args)
    }

    // Suppress Nuxt error handler for cross-origin errors
    nuxtApp.hook('vue:error', (error: any) => {
      const message = error?.message || String(error)
      if (
        message.includes('cross-origin') ||
        message.includes('__v_isRef') ||
        message.includes('__v_skip') ||
        message.includes('Blocked a frame')
      ) {
        return // Suppress the error
      }
    })
  }
})
