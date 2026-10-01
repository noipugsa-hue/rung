import { defineStore } from 'pinia'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import type { Conversation, Message } from '~/types/message'
import { generateId } from '~/utils/id-generator'

export const useMessageStore = defineStore('message', () => {
  const conversations = ref<Conversation[]>([])
  const currentConversation = ref<Conversation | null>(null)
  const currentMessages = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Get Firestore instance
  const getFirestore = () => {
    const { $firebase } = useNuxtApp()
    return $firebase.db
  }

  // Get or create conversation between two users
  async function getOrCreateConversation(
    userId1: string,
    userId2: string,
    user1Details: { name: string; avatar?: string; role?: 'user' | 'lung' | 'admin' },
    user2Details: { name: string; avatar?: string; role?: 'user' | 'lung' | 'admin' }
  ): Promise<Conversation | null> {
    if (!process.client) return null

    try {
      loading.value = true
      const db = getFirestore()
      const conversationsRef = collection(db, 'conversations')

      // Check if conversation already exists
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId1)
      )

      const querySnapshot = await getDocs(q)
      let existingConversation: Conversation | null = null

      querySnapshot.forEach((doc) => {
        const conv = { id: doc.id, ...doc.data() } as Conversation
        if (conv.participants.includes(userId2)) {
          existingConversation = conv
        }
      })

      if (existingConversation) {
        return existingConversation
      }

      // Create new conversation
      const conversationId = generateId('CONV')
      const newConversation: Conversation = {
        id: conversationId,
        participants: [userId1, userId2],
        participantDetails: {
          [userId1]: user1Details,
          [userId2]: user2Details
        },
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const convRef = doc(db, 'conversations', conversationId)
      await setDoc(convRef, newConversation)

      return newConversation
    } catch (err: any) {
      console.error('Get or create conversation error:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Get user's conversations
  async function getUserConversations(userId: string): Promise<Conversation[]> {
    if (!process.client) return []

    try {
      loading.value = true
      const db = getFirestore()
      const conversationsRef = collection(db, 'conversations')

      // Simple query without orderBy to avoid composite index requirement
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
      )

      const querySnapshot = await getDocs(q)
      const results: Conversation[] = []

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as Conversation)
      })

      // Sort by updatedAt in descending order (client-side)
      results.sort((a, b) => {
        const dateA = a.updatedAt || ''
        const dateB = b.updatedAt || ''
        return dateB.localeCompare(dateA)
      })

      conversations.value = results
      return results
    } catch (err: any) {
      console.error('Get user conversations error:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Get messages in a conversation
  async function getConversationMessages(conversationId: string): Promise<Message[]> {
    if (!process.client) return []

    try {
      const db = getFirestore()
      const messagesRef = collection(db, 'conversations', conversationId, 'messages')

      const q = query(
        messagesRef,
        orderBy('createdAt', 'asc')
      )

      const querySnapshot = await getDocs(q)
      const results: Message[] = []

      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data()
        } as Message)
      })

      currentMessages.value = results
      return results
    } catch (err: any) {
      console.error('Get conversation messages error:', err)
      error.value = err.message
      return []
    }
  }

  // Send a message
  async function sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string,
    senderAvatar?: string
  ): Promise<Message | null> {
    if (!process.client) return null

    try {
      const db = getFirestore()
      const messagesRef = collection(db, 'conversations', conversationId, 'messages')

      const newMessage: Omit<Message, 'id'> = {
        conversationId,
        senderId,
        senderName,
        senderAvatar,
        content,
        createdAt: new Date().toISOString(),
        read: false
      }

      const messageDoc = await addDoc(messagesRef, newMessage)

      // Update conversation with last message
      const conversationRef = doc(db, 'conversations', conversationId)
      const conversationSnap = await getDoc(conversationRef)

      if (conversationSnap.exists()) {
        const conversation = conversationSnap.data() as Conversation
        const otherUserId = conversation.participants.find(id => id !== senderId)

        await updateDoc(conversationRef, {
          lastMessage: {
            content,
            senderId,
            timestamp: new Date().toISOString()
          },
          updatedAt: new Date().toISOString(),
          [`unreadCount.${otherUserId}`]: increment(1)
        })
      }

      const message: Message = {
        id: messageDoc.id,
        ...newMessage
      }

      currentMessages.value.push(message)
      return message
    } catch (err: any) {
      console.error('Send message error:', err)
      error.value = err.message
      return null
    }
  }

  // Mark conversation as read
  async function markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    if (!process.client) return

    try {
      const db = getFirestore()
      const conversationRef = doc(db, 'conversations', conversationId)

      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      })

      // Update local state
      const conv = conversations.value.find(c => c.id === conversationId)
      if (conv) {
        conv.unreadCount[userId] = 0
      }
    } catch (err: any) {
      console.error('Mark as read error:', err)
    }
  }

  // Subscribe to conversation updates (real-time)
  function subscribeToConversation(conversationId: string, callback: (messages: Message[]) => void) {
    if (!process.client) return () => {}

    const db = getFirestore()
    const messagesRef = collection(db, 'conversations', conversationId, 'messages')
    const q = query(messagesRef, orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = []
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data()
        } as Message)
      })
      currentMessages.value = messages
      callback(messages)
    })

    return unsubscribe
  }

  // Subscribe to user conversations (real-time)
  function subscribeToUserConversations(userId: string, callback: (conversations: Conversation[]) => void) {
    if (!process.client) return () => {}

    const db = getFirestore()
    const conversationsRef = collection(db, 'conversations')

    // Simple query without orderBy to avoid composite index requirement
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = []
      snapshot.forEach((doc) => {
        convs.push({
          id: doc.id,
          ...doc.data()
        } as Conversation)
      })

      // Sort by updatedAt in descending order (client-side)
      convs.sort((a, b) => {
        const dateA = a.updatedAt || ''
        const dateB = b.updatedAt || ''
        return dateB.localeCompare(dateA)
      })

      conversations.value = convs
      callback(convs)
    })

    return unsubscribe
  }

  return {
    conversations,
    currentConversation,
    currentMessages,
    loading,
    error,
    getOrCreateConversation,
    getUserConversations,
    getConversationMessages,
    sendMessage,
    markConversationAsRead,
    subscribeToConversation,
    subscribeToUserConversations
  }
})
