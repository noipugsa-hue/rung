import type { ToastNotification, ToastType } from '~/types/notification'
import { generateId } from '~/utils/id-generator'

// Global state for toasts (shared across all components)
const toasts = ref<ToastNotification[]>([])

export function useNotificationToast() {
  /**
   * Show a toast notification
   */
  function showToast(toast: Omit<ToastNotification, 'id'>): void {
    const id = generateId('TOAST')
    const duration = toast.duration ?? 5000

    const newToast: ToastNotification = {
      id,
      type: toast.type,
      title: toast.title,
      message: toast.message,
      actionUrl: toast.actionUrl,
      actionLabel: toast.actionLabel,
      duration
    }

    toasts.value.push(newToast)

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }
  }

  /**
   * Dismiss a specific toast
   */
  function dismissToast(id: string): void {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Show success toast
   */
  function showSuccess(title: string, message: string, duration?: number): void {
    showToast({
      type: 'success',
      title,
      message,
      duration
    })
  }

  /**
   * Show error toast
   */
  function showError(title: string, message: string, duration?: number): void {
    showToast({
      type: 'error',
      title,
      message,
      duration
    })
  }

  /**
   * Show info toast
   */
  function showInfo(title: string, message: string, duration?: number): void {
    showToast({
      type: 'info',
      title,
      message,
      duration
    })
  }

  /**
   * Show warning toast
   */
  function showWarning(title: string, message: string, duration?: number): void {
    showToast({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  /**
   * Clear all toasts
   */
  function clearAll(): void {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    showToast,
    dismissToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    clearAll
  }
}
