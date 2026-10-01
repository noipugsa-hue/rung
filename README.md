# LUNG - ใครสักคนไปด้วย

**"บางวัน…เราแค่ต้องการใครสักคนไปด้วย"**

A modern marketplace platform connecting people who want to spend time together - whether it's grabbing food, visiting cafes, traveling, or just having a conversation.

## 🚀 Tech Stack

- **Nuxt 4** - Vue 3 framework with SSR
- **Vue 3** - Composition API
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first CSS
- **Pinia** - State management
- **VueUse** - Vue Composition Utilities
- **Lucide Icons** - Beautiful icons
- **Firebase** - Authentication & Backend

## 🎨 Design System

### Colors
- Primary: `#FFC83D` (Yellow)
- Dark: `#29231F`
- Cream: `#FFF9F1`
- Soft Green: `#DDEFE5`
- Orange: `#FF8A4C`

### Typography
- Font: Noto Sans Thai
- Japanese minimalism + Modern marketplace + Thai warmth

## 📦 Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🔥 Firebase Setup

The app uses Firebase for authentication. Configuration is in:
- `app/plugins/firebase.client.ts` - Firebase initialization
- `app/stores/auth.ts` - Authentication store with Firebase integration

### Firebase Services Used:
- Authentication (Email/Password)
- Analytics

### First Time Setup:
1. Enable Email/Password authentication in Firebase Console
2. Create a test user or register through the app
3. Login with your credentials

## 📱 Features

### Authentication
- ✅ Email/Password login with Firebase
- ✅ User registration
- ✅ Auto-persist auth state
- ✅ Protected routes with middleware
- ✅ User profile management

### User Features
- 🔍 Search & filter lungs by category, price, location
- ❤️ Favorite system
- 💬 Mock messaging interface
- 📅 Booking system with date/time selection
- 💳 Mock payment flow
- ⭐ Reviews & ratings

### Lung Partner Features
- 📊 Partner dashboard
- 📅 Availability management
- 💰 Earnings tracking
- 📈 Analytics

### Admin Features
- 👥 User management
- ✅ Verification system
- 📊 Dashboard with stats
- 📈 Reports

## 📄 Pages

### Public
- `/` - Home (Hero, Categories, Available Lungs)
- `/search` - Search & Filter
- `/lung/[id]` - Lung Profile
- `/become-lung` - Partner Landing Page
- `/login` - Login
- `/register` - Register

### Protected (Require Login)
- `/favorites` - Favorites List
- `/messages` - Chat
- `/account` - User Account
- `/booking/[id]` - Booking Page
- `/checkout` - Checkout
- `/booking/success` - Success Page
- `/partner/dashboard` - Partner Dashboard
- `/admin` - Admin Dashboard

## 🗂 Project Structure

```
app/
├── assets/css/          # Global styles
├── components/
│   ├── common/         # Reusable components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components
│   └── lung/           # Lung-related components
├── data/               # Mock data
│   ├── categories.ts   # Activity categories
│   └── lungs.ts        # 12 lung profiles
├── middleware/         # Route middleware
│   └── auth.ts         # Authentication guard
├── pages/              # App pages
├── plugins/            # Nuxt plugins
│   └── firebase.client.ts
├── stores/             # Pinia stores
│   ├── auth.ts         # Authentication
│   ├── favorites.ts    # Favorites
│   └── lung.ts         # Lungs data
└── types/              # TypeScript types
```

## 🎯 Key Components

### Common Components
- `VerifiedBadge` - Verified badge
- `RatingStars` - Star rating display
- `AvailabilityBadge` - Availability indicator
- `PriceDisplay` - Price formatter

### Lung Components
- `LungCard` - Profile card with favorite
- `LungGrid` - Responsive grid layout
- `CategoryCard` - Activity category card

### Layout Components
- `Navbar` - Responsive navigation with auth
- `Footer` - Site footer
- `BottomNavigation` - Mobile bottom nav

## 🔐 Authentication Flow

1. User visits protected route
2. Middleware checks authentication
3. Redirect to `/login` if not authenticated
4. Firebase Authentication handles login/register
5. User state synced with Pinia store
6. Redirect back to intended page

## 🎨 Design Principles

- Mobile-first responsive design
- Large beautiful photography
- Rounded cards (18px-28px radius)
- Generous whitespace
- Clear CTA buttons
- Human-centered design
- Fast scanning layout

## 📝 Development Guidelines

- TypeScript strict mode enabled
- No `any` types
- No `@ts-ignore`
- Component-based architecture
- Composables for business logic
- Mock data for development
- SSR-ready architecture

## 🚧 Future Features

- [ ] Real-time chat with Firebase
- [ ] Firestore integration for data
- [ ] Image upload to Firebase Storage
- [ ] Push notifications
- [ ] Payment integration
- [ ] Review system
- [ ] Advanced search filters
- [ ] Google Maps integration
- [ ] Social login (Google, Facebook)

## 📖 License

Private project

---

Built with ❤️ using Nuxt 4 + Firebase
