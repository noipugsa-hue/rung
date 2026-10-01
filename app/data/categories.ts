import type { Category } from '~/types'

export const categories: Category[] = [
  {
    id: 'food',
    name: 'กินข้าว',
    icon: 'utensils',
    emoji: '🍜'
  },
  {
    id: 'cafe',
    name: 'คาเฟ่',
    icon: 'coffee',
    emoji: '☕'
  },
  {
    id: 'travel',
    name: 'เที่ยว',
    icon: 'luggage',
    emoji: '🧳'
  },
  {
    id: 'talk',
    name: 'คุยกัน',
    icon: 'message-circle',
    emoji: '💬'
  },
  {
    id: 'walk',
    name: 'เดินเล่น',
    icon: 'walking',
    emoji: '🚶'
  },
  {
    id: 'photo',
    name: 'ถ่ายรูป',
    icon: 'camera',
    emoji: '📸'
  },
  {
    id: 'work',
    name: 'ปรึกษางาน',
    icon: 'briefcase',
    emoji: '💼'
  },
  {
    id: 'game',
    name: 'เล่นเกม',
    icon: 'gamepad-2',
    emoji: '🎮'
  }
]
