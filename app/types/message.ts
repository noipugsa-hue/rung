export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  createdAt: string
  read: boolean
}

export interface Conversation {
  id: string
  participants: string[] // Array of user IDs
  participantDetails: {
    [userId: string]: {
      name: string
      avatar?: string
      role?: 'user' | 'lung' | 'admin'
    }
  }
  lastMessage?: {
    content: string
    senderId: string
    timestamp: string
  }
  unreadCount: {
    [userId: string]: number
  }
  createdAt: string
  updatedAt: string
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[]
}
