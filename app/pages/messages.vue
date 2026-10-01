<script setup lang="ts">
import { MessageCircle, Send } from 'lucide-vue-next'
import { useMessageStore } from '~/stores/message'
import { useAuthStore } from '~/stores/auth'
import type { Conversation } from '~/types/message'

definePageMeta({
  middleware: 'auth'
})

const messageStore = useMessageStore()
const authStore = useAuthStore()

const conversations = ref<Conversation[]>([])
const selectedConversation = ref<string | null>(null)
const messageInput = ref('')
const loading = ref(true)
const messagesEndRef = ref<HTMLElement | null>(null)

let unsubscribeConversations: (() => void) | null = null
let unsubscribeMessages: (() => void) | null = null

// Get other participant in conversation
const getOtherParticipant = (conversation: Conversation) => {
  if (!authStore.user) return null
  const otherUserId = conversation.participants.find(id => id !== authStore.user?.id)
  return otherUserId ? conversation.participantDetails[otherUserId] : null
}

// Get unread count for current user
const getUnreadCount = (conversation: Conversation) => {
  if (!authStore.user) return 0
  return conversation.unreadCount[authStore.user.id] || 0
}

// Format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 48) {
    return 'เมื่อวาน'
  } else {
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
  }
}

// Format message time
const formatMessageTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
}

// Select conversation
const selectConversation = async (conversationId: string) => {
  selectedConversation.value = conversationId

  // Unsubscribe from previous conversation
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }

  // Mark as read
  if (authStore.user) {
    await messageStore.markConversationAsRead(conversationId, authStore.user.id)
  }

  // Subscribe to messages
  unsubscribeMessages = messageStore.subscribeToConversation(conversationId, () => {
    // Scroll to bottom when new message arrives
    nextTick(() => {
      messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
    })
  })
}

// Send message
const sendMessage = async () => {
  if (!messageInput.value.trim() || !selectedConversation.value || !authStore.user) return

  const content = messageInput.value.trim()
  messageInput.value = ''

  await messageStore.sendMessage(
    selectedConversation.value,
    authStore.user.id,
    authStore.user.name,
    content,
    authStore.user.avatar
  )

  // Scroll to bottom
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

// Get current conversation details
const currentConversationDetails = computed(() => {
  if (!selectedConversation.value) return null
  const conv = conversations.value.find(c => c.id === selectedConversation.value)
  return conv ? getOtherParticipant(conv) : null
})

// Load conversations on mount
onMounted(async () => {
  if (!authStore.user) return

  try {
    loading.value = true

    // Subscribe to conversations for real-time updates
    unsubscribeConversations = messageStore.subscribeToUserConversations(
      authStore.user.id,
      (convs) => {
        conversations.value = convs
      }
    )
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    loading.value = false
  }
})

// Cleanup subscriptions on unmount
onUnmounted(() => {
  if (unsubscribeConversations) {
    unsubscribeConversations()
  }
  if (unsubscribeMessages) {
    unsubscribeMessages()
  }
})
</script>

<template>
  <div class="py-8">
    <div class="container-lung">
      <h1 class="text-3xl md:text-4xl font-bold text-dark mb-8">
        ข้อความ
      </h1>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">กำลังโหลดข้อความ...</p>
      </div>

      <div v-else-if="conversations.length === 0" class="card p-12 text-center">
        <MessageCircle :size="64" class="text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-dark mb-2">ยังไม่มีการสนทนา</h3>
        <p class="text-gray-600">เมื่อคุณจองหรือรับการจอง การสนทนาจะปรากฏที่นี่</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Conversations list -->
        <div class="md:col-span-1">
          <div class="card divide-y divide-gray-100">
            <button
              v-for="conv in conversations"
              :key="conv.id"
              @click="selectConversation(conv.id)"
              class="w-full p-4 hover:bg-cream transition-colors text-left"
              :class="{ 'bg-cream': selectedConversation === conv.id }"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="getOtherParticipant(conv)?.avatar || 'https://i.pravatar.cc/150?img=20'"
                  :alt="getOtherParticipant(conv)?.name"
                  class="w-12 h-12 rounded-full object-cover"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-semibold text-dark">{{ getOtherParticipant(conv)?.name }}</span>
                    <span v-if="conv.lastMessage" class="text-xs text-gray-500">
                      {{ formatTimestamp(conv.lastMessage.timestamp) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 truncate">
                    {{ conv.lastMessage?.content || 'ยังไม่มีข้อความ' }}
                  </p>
                </div>
                <div
                  v-if="getUnreadCount(conv) > 0"
                  class="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-dark"
                >
                  {{ getUnreadCount(conv) }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Chat area -->
        <div class="md:col-span-2">
          <div v-if="selectedConversation" class="card h-[600px] flex flex-col">
            <!-- Chat header -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center gap-3">
                <img
                  :src="currentConversationDetails?.avatar || 'https://i.pravatar.cc/150?img=20'"
                  :alt="currentConversationDetails?.name"
                  class="w-10 h-10 rounded-full object-cover"
                />
                <span class="font-semibold text-dark">
                  {{ currentConversationDetails?.name }}
                </span>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 p-4 overflow-y-auto">
              <div v-if="messageStore.currentMessages.length === 0" class="text-center py-8">
                <p class="text-gray-500">ยังไม่มีข้อความในการสนทนานี้</p>
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="message in messageStore.currentMessages"
                  :key="message.id"
                  :class="message.senderId === authStore.user?.id ? 'flex justify-end' : 'flex justify-start'"
                >
                  <div
                    :class="message.senderId === authStore.user?.id ? 'bg-primary' : 'bg-gray-100'"
                    class="rounded-lung px-4 py-2 max-w-[70%]"
                  >
                    <p :class="message.senderId === authStore.user?.id ? 'text-dark' : 'text-gray-800'">
                      {{ message.content }}
                    </p>
                    <span :class="message.senderId === authStore.user?.id ? 'text-xs text-gray-700' : 'text-xs text-gray-500'">
                      {{ formatMessageTime(message.createdAt) }}
                    </span>
                  </div>
                </div>
                <div ref="messagesEndRef"></div>
              </div>
            </div>

            <!-- Input -->
            <div class="p-4 border-t border-gray-100">
              <form @submit.prevent="sendMessage" class="flex gap-2">
                <input
                  v-model="messageInput"
                  type="text"
                  placeholder="พิมพ์ข้อความ..."
                  class="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  class="btn-primary px-6 flex items-center gap-2"
                >
                  <Send :size="18" />
                </button>
              </form>
            </div>
          </div>

          <div v-else class="card h-[600px] flex items-center justify-center">
            <div class="text-center">
              <MessageCircle :size="64" class="text-gray-300 mx-auto mb-4" />
              <p class="text-gray-600">เลือกการสนทนาเพื่อเริ่มแชท</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
