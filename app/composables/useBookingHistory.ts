import type { Booking } from '~/types'

export interface BookingFilters {
  status?: string[]
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}

export function useBookingHistory(bookings: Ref<Booking[]>) {
  const filters = ref<BookingFilters>({})
  const page = ref(1)
  const pageSize = ref(20)
  const sortBy = ref<'date' | 'createdAt'>('date')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  /**
   * Filter bookings based on current filters
   */
  const filteredBookings = computed(() => {
    let results = [...bookings.value]

    // Filter by status
    if (filters.value.status && filters.value.status.length > 0) {
      results = results.filter(booking =>
        filters.value.status!.includes(booking.status)
      )
    }

    // Filter by date range
    if (filters.value.dateFrom) {
      results = results.filter(booking => booking.date >= filters.value.dateFrom!)
    }
    if (filters.value.dateTo) {
      results = results.filter(booking => booking.date <= filters.value.dateTo!)
    }

    // Filter by search query (activity or location)
    if (filters.value.searchQuery) {
      const query = filters.value.searchQuery.toLowerCase()
      results = results.filter(booking =>
        booking.activity.toLowerCase().includes(query) ||
        booking.location.toLowerCase().includes(query)
      )
    }

    // Sort
    results.sort((a, b) => {
      const field = sortBy.value
      const aVal = a[field]
      const bVal = b[field]

      if (sortOrder.value === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return results
  })

  /**
   * Paginated bookings
   */
  const paginatedBookings = computed(() => {
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredBookings.value.slice(start, end)
  })

  /**
   * Total pages
   */
  const totalPages = computed(() => {
    return Math.ceil(filteredBookings.value.length / pageSize.value)
  })

  /**
   * Has previous page
   */
  const hasPrevPage = computed(() => page.value > 1)

  /**
   * Has next page
   */
  const hasNextPage = computed(() => page.value < totalPages.value)

  /**
   * Set filters
   */
  function setFilters(newFilters: BookingFilters) {
    filters.value = { ...newFilters }
    page.value = 1 // Reset to first page
  }

  /**
   * Clear all filters
   */
  function clearFilters() {
    filters.value = {}
    page.value = 1
  }

  /**
   * Go to next page
   */
  function nextPage() {
    if (hasNextPage.value) {
      page.value++
    }
  }

  /**
   * Go to previous page
   */
  function prevPage() {
    if (hasPrevPage.value) {
      page.value--
    }
  }

  /**
   * Go to specific page
   */
  function goToPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= totalPages.value) {
      page.value = pageNumber
    }
  }

  /**
   * Set sort
   */
  function setSort(field: 'date' | 'createdAt', order: 'asc' | 'desc') {
    sortBy.value = field
    sortOrder.value = order
  }

  /**
   * Toggle sort order
   */
  function toggleSortOrder() {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  }

  return {
    filters,
    page,
    pageSize,
    sortBy,
    sortOrder,
    filteredBookings,
    paginatedBookings,
    totalPages,
    hasPrevPage,
    hasNextPage,
    setFilters,
    clearFilters,
    nextPage,
    prevPage,
    goToPage,
    setSort,
    toggleSortOrder
  }
}
