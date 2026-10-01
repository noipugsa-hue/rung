/**
 * SSR-safe store initialization helper
 * Use this to avoid "getActivePinia()" errors during SSR
 */
export function useClientStore<T>(storeFactory: () => T): Ref<T | null> {
  const store = ref<T | null>(null)

  onMounted(() => {
    store.value = storeFactory()
  })

  return store as Ref<T | null>
}
