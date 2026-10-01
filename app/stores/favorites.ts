import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref<string[]>([])

  const toggleFavorite = (lungId: string) => {
    const index = favoriteIds.value.indexOf(lungId)
    if (index > -1) {
      favoriteIds.value.splice(index, 1)
    } else {
      favoriteIds.value.push(lungId)
    }
  }

  const isFavorite = (lungId: string) => {
    return favoriteIds.value.includes(lungId)
  }

  const clearFavorites = () => {
    favoriteIds.value = []
  }

  return {
    favoriteIds,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  }
})
