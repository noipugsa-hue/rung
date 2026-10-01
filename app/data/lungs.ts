import type { Lung } from '~/types'

// DEMO DATA - This is mock data for development purposes
export const lungs: Lung[] = [
  {
    id: '1',
    name: 'ลุงเอก',
    age: 52,
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'ผมชอบฟังเรื่องราวของคนอื่น ชอบกาแฟ และรู้จักร้านอาหารอร่อย ๆ ในกรุงเทพ เคยทำงานด้านการตลาดมา 25 ปี ตอนนี้เกษียณแล้วแต่ยังอยากใช้เวลาให้เป็นประโยชน์',
    rating: 4.9,
    reviewCount: 128,
    price: 299,
    categories: ['กินข้าว', 'คาเฟ่', 'คุยกัน', 'ปรึกษางาน'],
    languages: ['ไทย', 'อังกฤษ'],
    experience: 'ผู้บริหารด้านการตลาดมา 25 ปี, ที่ปรึกษาธุรกิจ',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'คุณเอ',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        rating: 5,
        comment: 'ตอนแรกคิดว่าแปลกดี แต่พอลองแล้วรู้สึกเหมือนมีพี่ชายเพิ่มมาอีกคน',
        date: '2026-09-15',
        activity: 'กินข้าว'
      },
      {
        id: 'r2',
        userId: 'u2',
        userName: 'คุณบี',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        rating: 5,
        comment: 'วันนั้นไม่มีใครว่าง เลยลองจองลุงไปกินข้าวด้วยกัน สนุกกว่าที่คิด',
        date: '2026-09-10',
        activity: 'กินข้าว'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['10:00', '14:00', '16:00'] },
      { date: '2026-09-29', times: ['09:00', '11:00', '15:00'] },
      { date: '2026-09-30', times: ['10:00', '13:00'] },
    ]
  },
  {
    id: '2',
    name: 'ลุงบี',
    age: 58,
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'ชอบเดินเที่ยว ถ่ายรูป และค้นหาร้านกาแฟดี ๆ เคยเป็นช่างภาพมืออาชีพมา 30 ปี',
    rating: 4.8,
    reviewCount: 95,
    price: 349,
    categories: ['ถ่ายรูป', 'คาเฟ่', 'เที่ยว', 'เดินเล่น'],
    languages: ['ไทย'],
    experience: 'ช่างภาพมืออาชีพ 30 ปี, มัคคุเทศก์',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542596594-649edbc13630?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r3',
        userId: 'u3',
        userName: 'คุณซี',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        rating: 5,
        comment: 'ได้ความรู้เรื่องการถ่ายรูปเยอะมาก ได้รูปสวย ๆ เต็มเมมอีก',
        date: '2026-09-12',
        activity: 'ถ่ายรูป'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['11:00', '15:00'] },
      { date: '2026-09-29', times: ['10:00', '14:00', '16:00'] },
    ]
  },
  {
    id: '3',
    name: 'ลุงดี',
    age: 45,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'นักวิ่งมาราธอน ชอบออกกำลังกาย เดินเล่นในสวนสาธารณะ และให้คำปรึกษาเรื่องสุขภาพ',
    rating: 4.9,
    reviewCount: 112,
    price: 279,
    categories: ['เดินเล่น', 'คุยกัน', 'กินข้าว'],
    languages: ['ไทย', 'อังกฤษ'],
    experience: 'โค้ชสุขภาพ, นักวิ่งมาราธอน',
    verified: true,
    available: false,
    gallery: [
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=800&h=600&fit=crop',
    ],
    reviews: [],
    availability: []
  },
  {
    id: '4',
    name: 'ลุงอี',
    age: 60,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'เกษียณอาจารย์มหาวิทยาลัย ชอบอ่านหนังสือ คุยเรื่องประวัติศาสตร์ และไปพิพิธภัณฑ์',
    rating: 5.0,
    reviewCount: 87,
    price: 399,
    categories: ['คุยกัน', 'เที่ยว', 'คาเฟ่', 'ปรึกษางาน'],
    languages: ['ไทย', 'อังกฤษ', 'ฝรั่งเศส'],
    experience: 'อาจารย์มหาวิทยาลัย 35 ปี, นักเขียน',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r4',
        userId: 'u4',
        userName: 'คุณดี',
        userAvatar: 'https://i.pravatar.cc/150?img=4',
        rating: 5,
        comment: 'คุยสนุกมาก ได้ความรู้เยอะ ครั้งหน้าอยากไปพิพิธภัณฑ์ด้วยกันอีก',
        date: '2026-09-08',
        activity: 'คุยกัน'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['09:00', '13:00'] },
      { date: '2026-09-30', times: ['10:00', '14:00'] },
    ]
  },
  {
    id: '5',
    name: 'ลุงเอฟ',
    age: 55,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'เชฟเกษียณ รู้จักร้านอาหารดี ๆ ทั่วกรุงเทพ ชอบแนะนำเมนูอร่อย ๆ',
    rating: 4.7,
    reviewCount: 143,
    price: 329,
    categories: ['กินข้าว', 'คาเฟ่', 'คุยกัน'],
    languages: ['ไทย'],
    experience: 'เชฟมา 30 ปี, Food Critic',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r5',
        userId: 'u5',
        userName: 'คุณอี',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        rating: 5,
        comment: 'พาไปกินร้านเด็ด ๆ ที่ไม่เคยรู้จักมาก่อน อร่อยมาก!',
        date: '2026-09-20',
        activity: 'กินข้าว'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['12:00', '18:00'] },
      { date: '2026-09-29', times: ['12:00', '17:00'] },
    ]
  },
  {
    id: '6',
    name: 'ลุงจี',
    age: 48,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'เทคโนโลยีและการเขียนโปรแกรม ชอบคุยเรื่อง AI, Startup และเทคโนโลยี',
    rating: 4.8,
    reviewCount: 76,
    price: 449,
    categories: ['ปรึกษางาน', 'คุยกัน', 'คาเฟ่'],
    languages: ['ไทย', 'อังกฤษ'],
    experience: 'Software Engineer 25 ปี, Tech Consultant',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=600&fit=crop',
    ],
    reviews: [],
    availability: [
      { date: '2026-09-28', times: ['14:00', '16:00'] },
      { date: '2026-09-29', times: ['15:00', '17:00'] },
    ]
  },
  {
    id: '7',
    name: 'ลุงเอช',
    age: 62,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'ชอบเล่นเกม Board Game และ Video Game ชวนเล่นเกมกันได้',
    rating: 4.6,
    reviewCount: 54,
    price: 249,
    categories: ['เล่นเกม', 'คุยกัน', 'คาเฟ่'],
    languages: ['ไทย'],
    experience: 'Game Designer, Board Game Cafe Owner',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r6',
        userId: 'u6',
        userName: 'คุณเอฟ',
        userAvatar: 'https://i.pravatar.cc/150?img=6',
        rating: 5,
        comment: 'เล่นเกมสนุกมาก ได้รู้จัก Board Game ใหม่ ๆ เยอะเลย',
        date: '2026-09-18',
        activity: 'เล่นเกม'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['13:00', '19:00'] },
      { date: '2026-09-30', times: ['14:00', '18:00'] },
    ]
  },
  {
    id: '8',
    name: 'ลุงไอ',
    age: 50,
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'มัคคุเทศก์ท้องถิ่น รู้จักสถานที่ท่องเที่ยวซ่อนเร้นในกรุงเทพและปริมณฑล',
    rating: 4.9,
    reviewCount: 167,
    price: 379,
    categories: ['เที่ยว', 'เดินเล่น', 'ถ่ายรูป', 'กินข้าว'],
    languages: ['ไทย', 'อังกฤษ', 'จีน'],
    experience: 'มัคคุเทศก์ 20 ปี',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r7',
        userId: 'u7',
        userName: 'คุณจี',
        userAvatar: 'https://i.pravatar.cc/150?img=7',
        rating: 5,
        comment: 'พาไปเที่ยวที่ซ่อนเร้นที่ไม่เคยรู้จัก สวยมาก ถ่ายรูปสวยด้วย',
        date: '2026-09-22',
        activity: 'เที่ยว'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['08:00', '13:00'] },
      { date: '2026-09-29', times: ['09:00', '14:00'] },
    ]
  },
  {
    id: '9',
    name: 'ลุงเจ',
    age: 54,
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'นักจิตวิทยา ให้คำปรึกษาด้านจิตใจและการใช้ชีวิต เป็นกันเองและฟังดี',
    rating: 5.0,
    reviewCount: 201,
    price: 499,
    categories: ['คุยกัน', 'ปรึกษางาน', 'คาเฟ่'],
    languages: ['ไทย', 'อังกฤษ'],
    experience: 'นักจิตวิทยาคลินิก 28 ปี, Life Coach',
    verified: true,
    available: false,
    gallery: [
      'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r8',
        userId: 'u8',
        userName: 'คุณเอช',
        userAvatar: 'https://i.pravatar.cc/150?img=8',
        rating: 5,
        comment: 'ฟังดีมาก ให้คำแนะนำที่ช่วยได้จริง รู้สึกดีขึ้นเยอะ',
        date: '2026-09-25',
        activity: 'คุยกัน'
      }
    ],
    availability: []
  },
  {
    id: '10',
    name: 'ลุงเค',
    age: 47,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'Barista มืออาชีพ รู้จักคาเฟ่ดี ๆ ทั่วกรุงเทพ ชอบคุยเรื่องกาแฟ',
    rating: 4.8,
    reviewCount: 91,
    price: 299,
    categories: ['คาเฟ่', 'คุยกัน', 'เดินเล่น'],
    languages: ['ไทย', 'อังกฤษ'],
    experience: 'Barista 15 ปี, Coffee Roaster',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r9',
        userId: 'u9',
        userName: 'คุณไอ',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        rating: 5,
        comment: 'ได้รู้จักคาเฟ่ดี ๆ เยอะมาก ได้ความรู้เรื่องกาแฟด้วย',
        date: '2026-09-19',
        activity: 'คาเฟ่'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['10:00', '15:00', '17:00'] },
      { date: '2026-09-29', times: ['11:00', '16:00'] },
    ]
  },
  {
    id: '11',
    name: 'ลุงแอล',
    age: 56,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'นักดนตรี เล่นกีตาร์ ชอบไปดูดนตรีสด และคุยเรื่องเพลง',
    rating: 4.7,
    reviewCount: 68,
    price: 349,
    categories: ['คุยกัน', 'คาเฟ่', 'เดินเล่น'],
    languages: ['ไทย'],
    experience: 'นักดนตรีมืออาชีพ 30 ปี',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=600&fit=crop',
    ],
    reviews: [],
    availability: [
      { date: '2026-09-29', times: ['14:00', '18:00'] },
      { date: '2026-09-30', times: ['15:00', '19:00'] },
    ]
  },
  {
    id: '12',
    name: 'ลุงเอ็ม',
    age: 59,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    location: 'กรุงเทพฯ',
    bio: 'นักเขียน นักอ่าน ชอบไปร้านหนังสือและห้องสมุด คุยเรื่องวรรณกรรม',
    rating: 4.9,
    reviewCount: 103,
    price: 379,
    categories: ['คุยกัน', 'คาเฟ่', 'เดินเล่น'],
    languages: ['ไทย', 'อังกฤษ', 'ญี่ปุ่น'],
    experience: 'นักเขียน 25 ปี, บรรณาธิการ',
    verified: true,
    available: true,
    gallery: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=600&fit=crop',
    ],
    reviews: [
      {
        id: 'r10',
        userId: 'u10',
        userName: 'คุณเจ',
        userAvatar: 'https://i.pravatar.cc/150?img=10',
        rating: 5,
        comment: 'คุยสนุกมาก ได้แนะนำหนังสือดี ๆ เยอะเลย',
        date: '2026-09-17',
        activity: 'คุยกัน'
      }
    ],
    availability: [
      { date: '2026-09-28', times: ['10:00', '14:00'] },
      { date: '2026-09-30', times: ['11:00', '15:00'] },
    ]
  }
]
