/**
 * Handle dev service worker requests to prevent Vue Router warnings
 * This catches requests for /dev-sw.js that may come from browser extensions or dev tools
 */
export default defineEventHandler(() => {
  // Return empty response with 404 status
  return new Response('', {
    status: 404,
    headers: {
      'Content-Type': 'application/javascript',
    },
  })
})
