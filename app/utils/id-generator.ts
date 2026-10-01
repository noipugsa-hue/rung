export function generateId(prefix: string = ''): string {
  const timestamp = Date.now()
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  const suffix = `rung${randomNum}`
  return prefix ? `${prefix}-${timestamp}-${suffix}` : `${timestamp}-${suffix}`
}
