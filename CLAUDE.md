# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LUNG (ใครสักคนไปด้วย)** is a marketplace platform that connects people who want to spend time together. Users can find "Lung" (companions) for activities like eating, visiting cafes, traveling, or conversation. Built with Nuxt 4, Vue 3, TypeScript, Tailwind CSS v4, Pinia, and Firebase.

**Firebase Project**: cogent-density-409510

## Development Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)

# Production
pnpm build            # Build for production
pnpm preview          # Preview production build

# Testing
pnpm test             # Run tests with Vitest
pnpm test:watch       # Run tests in watch mode
```

## Architecture Overview

### Financial System (Satang-based)

All monetary values use **Satang** (1/100th of a Baht) for precision. This prevents floating-point errors in financial calculations.

- **Type**: `Satang` (always an integer in `app/types/money.ts`)
- **Utilities**: `app/utils/money.ts` - conversion and formatting functions
- **Pattern**: All amounts in stores and types use `*Satang` suffix (e.g., `totalAmountSatang`, `partnerEarningSatang`)

```typescript
// Convert between Baht and Satang
bahtToSatang(100)      // => 10000 satang
satangToBaht(10000)    // => 100 baht
formatBaht(10000)      // => "฿100.00"
```

### Commission System

Commission rates are **immutable snapshots** stored per booking to preserve historical rates.

- **Types**: `app/types/commission.ts` - `CommissionSnapshot`, `CommissionRate`
- **Store**: `app/stores/commission.ts` - manages global and partner-specific rates
- **Booking**: Each booking stores `commissionSnapshot` to lock in the rate at booking time
- **Range**: 10-25% with default at 15%

### Ledger System

All financial events create ledger entries for audit trails and balance calculations.

- **Types**: `app/types/ledger.ts`
- **Store**: `app/stores/ledger.ts`
- **Entry Types**:
  - `booking_payment` - Customer pays for booking (credits partner balance)
  - `commission` - Platform commission deducted (debits partner balance)
  - `payout` - Money transferred to partner bank (debits partner balance)
  - `refund` - Money returned to customer (debits partner balance)

### Review System

Two-way review system where both users and lungs can review each other after completed bookings.

- **Types**: `app/types/review.ts` - `Review`, `CreateReviewInput`, `ReviewStats`
- **Store**: `app/stores/review.ts`
- **Components**:
  - `ReviewForm` - Star rating and comment input
  - `ReviewCard` - Display individual reviews
  - `ReviewList` - List with sorting (newest, oldest, highest, lowest)
  - `ReviewStats` - Average rating and distribution bars
- **Pages**:
  - `/account/review-booking?bookingId=xxx` - Submit review for completed booking
  - `/partner/reviews` - View all reviews received by lung
  - `/account/reviews` - View all reviews written by user

**Review Rules**:
- Only completed bookings can be reviewed
- Each user can only review a booking once
- Reviews are two-way: user reviews lung, lung reviews user
- Average ratings automatically update when new reviews are submitted
- Notification sent to reviewee when review is received

### Notification System

In-app notification system with real-time updates and toast notifications.

- **Types**: `app/types/notification.ts` - `Notification`, `NotificationType`, `ToastNotification`
- **Stores**:
  - `notification.ts` - Persistent notifications with real-time subscription
  - `useNotificationToast` composable - Ephemeral toast messages
- **Components**:
  - `NotificationBell` - Bell icon with unread badge and dropdown (in Navbar)
  - `NotificationItem` - Individual notification with read/unread state
  - `NotificationToast` - Auto-dismissing toast message (5s default)
  - `NotificationToastContainer` - Fixed container for toast stack
- **Pages**:
  - `/notifications` - View all notifications with filters

**Notification Types**:
- `booking_confirmed` - Booking confirmed by admin/lung
- `booking_request` - New booking request
- `booking_completed` - Booking marked as completed
- `message_received` - New message in chat
- `review_received` - New review from user/lung
- `payout_approved` - Payout request approved
- `payout_rejected` - Payout request rejected
- `application_approved` - Partner application approved
- `application_rejected` - Partner application rejected

**Toast Usage**:
```typescript
const { showSuccess, showError, showInfo, showWarning } = useNotificationToast()
showSuccess('สำเร็จ', 'บันทึกข้อมูลเรียบร้อย')
showError('ข้อผิดพลาด', 'กรุณาลองใหม่อีกครั้ง')
```

### Referral Program

User referral system with rewards for both referrer and referee.

- **Types**: `app/types/referral.ts` - `Referral`, `ReferralSettings`, `ReferralStats`
- **Store**: `app/stores/referral.ts`
- **Utils**: `app/utils/referral.ts` - Code generation and link formatting
- **Components**:
  - `ReferralCard` - Display referral code with copy functionality
  - `ReferralShareButtons` - Social sharing (LINE, Facebook, Email, Web Share API)
  - `ReferralStats` - Dashboard showing total referrals and rewards
- **Pages**:
  - `/account/referral` - Referral dashboard with code, sharing, stats, and FAQ
  - `/register?ref=CODE` - Auto-fills referral code for new users

**Referral Flow**:
1. User gets unique referral code (auto-generated from name + random suffix)
2. Share link: `https://lung.app/register?ref=CODE`
3. New user registers with referral code
4. Referral marked as "pending" until referee makes first booking
5. When referee completes first booking:
   - Referral marked as "completed"
   - Referrer receives ฿100 reward
   - Referee receives ฿100 reward
   - Both receive notifications
6. Rewards expire after 90 days if unused

**Reward Settings** (configurable):
- Referrer reward: ฿100 (10,000 satang)
- Referee reward: ฿100 (10,000 satang)
- Minimum booking amount: ฿200 (20,000 satang)
- Reward expiry: 90 days

### Achievement System

Gamification with points, badges, and tier progression.

- **Types**: `app/types/achievement.ts` - `Achievement`, `UserAchievement`, `UserPoints`
- **Store**: `app/stores/achievement.ts`
- **Components**:
  - `AchievementBadge` - Display individual achievement with lock/unlock states
  - `AchievementList` - Grid view grouped by category with filter support
  - `AchievementProgress` - Tier progress card with stats and benefits
- **Pages**:
  - `/account/achievements` - Achievements page with progress tracking

**Achievement Categories**:
- 🎯 **Milestone** - First booking, profile completion
- 📅 **Booking** - Booking count milestones (5, 10, 50 bookings)
- 👥 **Social** - Referrals, social sharing
- ✍️ **Review** - Writing reviews
- ⭐ **Special** - Rare achievements

**Tier System**:
- **Bronze** - 0-499 points (100% point multiplier)
- **Silver** - 500-1,999 points (120% point multiplier)
- **Gold** - 2,000-4,999 points (150% point multiplier + Priority Support)
- **Platinum** - 5,000+ points (200% point multiplier + Priority Support + Early Access)

**Achievement Examples**:
- 🎉 **ผู้บุกเบิก** (First Timer) - First booking completed → 50 points
- 🌟 **นักท่องเที่ยว** (Traveler) - 5 bookings completed → 100 points
- 💎 **ลูกค้าประจำ** (Regular) - 10 bookings completed → 200 points
- ❤️ **ผู้แนะนำ** (Referrer) - Refer 1 friend → 150 points
- ✍️ **นักเขียนรีวิว** (Reviewer) - Write 5 reviews → 100 points

**Auto-check Logic**:
- Achievements checked after booking completion
- Toast notification shown for newly unlocked achievements
- Progress tracked in real-time
- Points awarded immediately on unlock

### Instant Book

Quick booking feature that skips partner confirmation step.

- **Type Field**: `Lung.instantBook: boolean`
- **Badge**: Green "⚡ จองได้ทันที" badge on LungCard
- **Search Filter**: Checkbox filter on `/search` page
- **Booking Flow**: When `instantBook: true`, booking is auto-confirmed (no pending state)

**Benefits**:
- Faster booking for users (no waiting for confirmation)
- Increased bookings for lungs (reduced friction)
- Higher visibility in search results (filter option)

**Display**:
- Green badge with lightning emoji on lung cards
- Filter checkbox in search filters panel
- Badge counter includes instant book filter

### Group Booking

Multi-person bookings with split payment functionality.

- **Types**: `app/types/group-booking.ts` - `GroupBooking`, `GroupParticipant`, `CreateGroupBookingInput`
- **Store**: `app/stores/group-booking.ts`
- **Components**:
  - `GroupBookingCard` - Display group booking with progress and actions
  - `GroupParticipants` - List participants with payment status
  - `InviteParticipants` - Share invite code and link via LINE/Email/Web Share
- **Pages**:
  - `/account/group-bookings` - User's group bookings list
  - `/group-booking/join` - Browse and join public group bookings
  - `/group-booking/[code]` - Join via invite code

**Group Booking Flow**:
1. Organizer creates group booking (sets max participants)
2. Generates unique 8-character invite code
3. Organizer shares invite code or link with friends
4. Participants join using code or link
5. Total cost split equally among participants
6. Each participant pays their share independently
7. When group is confirmed, actual booking is created
8. All participants receive confirmation notifications

**Features**:
- **Split Payment**: Cost divided equally by participant count
- **Invite System**: Unique codes + shareable links
- **Public/Private**: Optional public listing for discovery
- **Progress Tracking**: Visual progress bar showing spots filled
- **Payment Tracking**: Individual payment status per participant
- **Organizer Controls**: Confirm, cancel, or manage group

**Split Types** (future expansion):
- `equal` - Split cost equally (current implementation)
- `custom` - Custom amounts per participant
- `organizer_pays` - Organizer covers all costs

### Featured Activities

Promotional system for highlighting lungs, activities, and campaigns.

- **Types**: `app/types/featured.ts` - `FeaturedItem`, `CreateFeaturedInput`
- **Store**: `app/stores/featured.ts`
- **Components**:
  - `FeaturedSection` - Homepage carousel/grid of featured items
  - `FeaturedBadge` - Star badge for featured lung cards
- **Pages**:
  - `/admin/featured` - Admin management of featured items
  - Homepage - Featured section between categories and available lungs

**Featured Item Types**:
- `lung` - Feature specific lung profiles
- `activity` - Promote specific categories
- `campaign` - Custom promotional campaigns

**Features**:
- **Time-based**: Start/end dates for campaigns
- **Priority Sorting**: Higher priority items shown first
- **Analytics Tracking**: Impressions (views) and click counts
- **Active Toggle**: Enable/disable without deleting
- **Multiple Images**: Custom imagery for campaigns
- **Auto-display**: Featured lungs show badge automatically

**Admin Capabilities**:
- Create featured items with custom titles, descriptions, images
- Set date ranges for campaigns
- Track performance (views, clicks, CTR)
- Toggle active/inactive status
- Priority ordering
- Delete featured items

**Display Rules**:
- Only active items shown publicly
- Must be within start/end date range
- Sorted by priority (descending) then date
- Featured badge appears on LungCard if lung is featured
- Homepage section shows top 6 featured items

### Authentication & User Roles

Firebase Authentication with Firestore user profiles.

- **Plugin**: `app/plugins/firebase.client.ts` - initializes Firebase services
- **Store**: `app/stores/auth.ts`
- **Middleware**: `app/middleware/auth.ts` - protects routes
- **Roles**: `'user' | 'lung' | 'admin'` stored in Firestore `users` collection

**Auth Flow**:
1. User logs in via Firebase (email/password or Google)
2. `syncUserProfile()` creates/updates Firestore user document
3. User role determines accessible features
4. Protected routes check `auth.ts` middleware

### State Management (Pinia Stores)

- `auth.ts` - Authentication and user session
- `lung.ts` - Lung profiles (companions), includes `createLungFromApplication()` for approved partners
- `booking.ts` - Booking management with financial calculations
- `favorites.ts` - User favorites
- `partnerApplication.ts` - Partner onboarding flow
- `commission.ts` - Commission rate management
- `ledger.ts` - Financial transaction ledger
- `payout.ts` - Partner payout requests (min: ฿500)
- `message.ts` - Chat/messaging system
- `review.ts` - Two-way review system (user ↔ lung)
- `notification.ts` - In-app notifications with real-time subscription
- `referral.ts` - Referral program with rewards tracking
- `achievement.ts` - Achievement system with points and tier progression
- `group-booking.ts` - Group bookings with split payment
- `featured.ts` - Featured items management and analytics

**Important**: All Firestore operations must check `if (!process.client)` since Firebase only runs client-side in this app.

### Pages Structure

#### Public Routes
- `/` - Homepage with hero, categories, featured section, available lungs
- `/search` - Search and filter lungs (includes instant book filter)
- `/lung/[id]` - Lung profile detail page
- `/login`, `/register` - Authentication
- `/group-booking/join` - Browse and join public group bookings

#### Protected Routes (require login)
- `/favorites` - User's favorited lungs
- `/messages` - Chat interface
- `/account` - User account settings
- `/account/reviews` - User's written reviews
- `/account/review-booking?bookingId=xxx` - Write review for completed booking
- `/account/bookings` - Booking history with filters and search
- `/account/referral` - Referral dashboard with code, sharing, and rewards
- `/account/achievements` - Achievement progress and unlocked badges
- `/account/group-bookings` - User's group bookings (organized + joined)
- `/notifications` - View all notifications
- `/booking/[id]`, `/checkout`, `/booking/success` - Booking flow

#### Partner Routes (require `role='lung'`)
- `/partner/dashboard` - Partner overview
- `/partner/earnings` - Earnings and balance
- `/partner/payouts` - Request payouts, view history
- `/partner/reviews` - View reviews from customers with stats
- `/partner/bookings` - Partner bookings with filters

#### Admin Routes (require `role='admin'`)
- `/admin/dashboard` - Platform overview with metrics
- `/admin/applications` - Review partner applications
- `/admin/bookings` - Manage all bookings
- `/admin/payouts` - Approve/reject payout requests
- `/admin/ledger` - View all financial transactions (with CSV export)
- `/admin/commission` - Configure commission rates
- `/admin/featured` - Manage featured items with analytics

**Layout**: Admin pages use `layout: 'admin'` (sidebar navigation at `app/layouts/admin.vue`)

### Partner Application Flow

Multi-step wizard at `/apply/[step]` creates applications stored in Firestore.

**Steps**: personal-info → professional-info → photos → availability → legal → review

**Types**: `app/types/application.ts` - includes bank account info, profile images, availability

**Admin Approval**: When approved, `createLungFromApplication()` in `lung.ts` store:
1. Generates new Lung profile from application data
2. Saves to Firestore `lungs` collection
3. Updates user role to `'lung'`
4. Links user to their Lung profile via `lungId`

### Component Organization

Components use path-based imports (no prefix required):

```
app/components/
├── common/          # Reusable UI (VerifiedBadge, RatingStars, PriceDisplay, FeaturedBadge)
├── lung/            # Lung-specific (LungCard, LungGrid, CategoryCard)
├── layout/          # Navigation (Navbar, Footer, BottomNavigation)
├── home/            # Homepage sections (FeaturedSection, HeroSection, etc.)
├── booking/         # Booking flow (BookingHistoryTable, BookingFilters)
├── review/          # Review system (ReviewForm, ReviewCard, ReviewList, ReviewStats)
├── notification/    # Notifications (NotificationBell, NotificationToast, NotificationItem)
├── referral/        # Referral program (ReferralCard, ReferralShareButtons, ReferralStats)
├── achievement/     # Achievement system (AchievementBadge, AchievementList, AchievementProgress)
├── group-booking/   # Group bookings (GroupBookingCard, GroupParticipants, InviteParticipants)
├── admin/           # Admin-specific components
├── search/          # Search/filter components
└── chat/            # Messaging components
```

### Firebase Collections

Current Firestore schema (see FIRESTORE-RULES-SETUP.md for security rules):

- `users/{userId}` - User profiles with role, includes `rating` and `reviewCount` fields
- `lungs/{lungId}` - Lung profiles (public read), includes `rating`, `reviewCount`, and `instantBook` fields
- `bookings/{bookingId}` - Bookings with financial data, includes `userReviewId` and `lungReviewId` fields
- `reviews/{reviewId}` - Two-way reviews (user ↔ lung) with ratings and comments
- `notifications/{notificationId}` - User notifications with read/unread status
- `referrals/{referralId}` - Referral tracking with status and rewards
- `referralSettings/{settingsId}` - Global referral program configuration
- `userAchievements/{userId_achievementId}` - User achievement progress and unlocks
- `userPoints/{userId}` - User points and tier information
- `pointTransactions/{transactionId}` - Point transaction history
- `groupBookings/{groupBookingId}` - Group bookings with participants and split payment
- `featuredItems/{featuredId}` - Featured lungs, activities, and campaigns with analytics
- `partnerApplications/{applicationId}` - Partner applications
- `payouts/{payoutId}` - Payout requests
- `ledger/{entryId}` - Financial ledger entries
- `commissionRates/{rateId}` - Commission rate history

**Storage**: Profile images uploaded to Firebase Storage (`gs://cogent-density-409510.firebasestorage.app`). See CORS-SETUP.md if encountering CORS errors.

## TypeScript Guidelines

- **Strict mode enabled** in `nuxt.config.ts` and `tsconfig.json`
- **No `any` types** - use proper type definitions
- **No `@ts-ignore`** - fix the underlying type issue
- All types defined in `app/types/`
- Financial amounts always use `Satang` type

## Common Patterns

### Creating a Booking with Financial Tracking

```typescript
const commissionSnapshot = getCurrentCommissionSnapshot(partnerId)
const totalSatang = bahtToSatang(price)
const partnerEarningSatang = calculatePartnerEarning(totalSatang, commissionSnapshot.percentage)

const booking = {
  totalAmountSatang,
  commissionSnapshot,
  partnerEarningSatang,
  // ... other fields
}

await bookingStore.createBooking(booking)
// Automatically creates ledger entries for payment and commission
```

### Calculating Partner Balance

```typescript
const balance = ledgerStore.getPartnerBalance(partnerId)
// Returns sum of all completed ledger entries for this partner
```

### Using Client-Only Composables

```typescript
const authStore = useClientStore(useAuthStore)
// Safely access stores that depend on Firebase (client-only)
```

## Design System

### Colors
- Primary: `#FFC83D` (Yellow)
- Dark: `#29231F`
- Cream: `#FFF9F1`
- Soft Green: `#DDEFE5`
- Orange: `#FF8A4C`

### Typography
- Font: Noto Sans Thai
- Design: Japanese minimalism + Modern marketplace + Thai warmth

### Principles
- Mobile-first responsive design
- Large photography
- Rounded cards (18px-28px radius)
- Generous whitespace
- Clear CTAs

## Testing

- **Framework**: Vitest with happy-dom environment
- **Test Utils**: `@vue/test-utils` for Vue component testing
- **Config**: `vitest.config.ts`
- Tests located in `tests/` directory

## Important Notes

1. **Firebase operations are client-only**: Always check `if (!process.client)` before Firestore/Storage calls
2. **Use Satang for all money**: Never store decimal Baht values
3. **Commission snapshots are immutable**: Stored per booking, never changed after creation
4. **Ledger is source of truth**: Calculate balances from ledger entries, not bookings directly
5. **Role-based access**: Verify user role before showing admin/partner features
6. **Image uploads**: Use `useImageUpload` composable for Firebase Storage uploads
   - Max file size: 10MB
   - Min dimensions: 800x800px
   - Supported formats: JPG, PNG, WebP
7. **ID generation**: Use `generateId(prefix)` from `app/utils/id-generator.ts` for consistent IDs

## Known Issues & Setup

- **Firestore Permissions**: See FIRESTORE-RULES-SETUP.md if encountering permission errors
- **CORS Errors**: See CORS-SETUP.md for Firebase Storage CORS configuration
- **Phase 3 Features**: All enhanced dashboard features documented in PHASE3-IMPLEMENTATION.md

## File Naming Conventions

- Pages: kebab-case with Vue SFC (e.g., `partner-dashboard.vue`)
- Components: PascalCase (e.g., `LungCard.vue`)
- Stores: kebab-case (e.g., `partner-application.ts`)
- Types: kebab-case (e.g., `partner-application.ts`)
- Utils: kebab-case (e.g., `id-generator.ts`)

## SSR Considerations

- Nuxt 4 with SSR enabled
- Firebase plugins are `.client.ts` (client-only)
- Use `process.client` checks for client-only operations
- Auth state synced via Pinia (persisted client-side)
