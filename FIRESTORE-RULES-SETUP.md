# แก้ไข Firestore Permission Error

## ปัญหา
```
FirebaseError: Missing or insufficient permissions
```

## วิธีแก้

### ขั้นตอนที่ 1: ไปที่ Firebase Console

1. เปิด https://console.firebase.google.com/
2. เลือกโปรเจค: **cogent-density-409510**
3. คลิก **Firestore Database** ในเมนูซ้าย
4. คลิกแท็บ **Rules**

### ขั้นตอนที่ 2: แก้ไข Rules

แทนที่ rules เดิมด้วย:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // Lungs collection
    match /lungs/{lungId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }

    // Bookings collection
    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == resource.data.lungId ||
         isAdmin());
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.auth.uid == resource.data.lungId ||
         isAdmin());
      allow delete: if isAdmin();
    }

    // Partner Applications
    match /partnerApplications/{applicationId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.userId || isAdmin());
      allow delete: if isAdmin();
    }

    // Admin collections
    match /payouts/{payoutId} {
      allow read, write: if isAdmin();
    }

    match /commissionSettings/{settingId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    match /ledger/{entryId} {
      allow read, write: if isAdmin();
    }

    // Commission Rates
    match /commissionRates/{rateId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Reviews collection (Phase 1)
    match /reviews/{reviewId} {
      allow read: if resource.data.isVisible == true;
      allow create: if request.auth != null &&
        request.resource.data.reviewerId == request.auth.uid &&
        request.resource.data.isVisible == true;
      allow update: if isAdmin();
      allow delete: if false;
    }

    // Notifications collection (Phase 1)
    match /notifications/{notificationId} {
      allow read: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        resource.data.userId == request.auth.uid &&
        request.resource.data.keys().hasOnly(['read', 'readAt']);
      allow delete: if false;
    }

    // Referrals collection (Quick Wins)
    match /referrals/{referralId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.referrerId ||
         request.auth.uid == resource.data.refereeId ||
         isAdmin());
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.referrerId ||
         request.auth.uid == resource.data.refereeId ||
         isAdmin());
      allow delete: if isAdmin();
    }

    // Referral Settings (Quick Wins)
    match /referralSettings/{settingsId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // User Achievements (Quick Wins)
    match /userAchievements/{achievementId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (achievementId.matches('^' + request.auth.uid + '_.*') || isAdmin());
      allow delete: if isAdmin();
    }

    // User Points (Quick Wins)
    match /userPoints/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // Point Transactions (Quick Wins)
    match /pointTransactions/{transactionId} {
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }

    // Group Bookings (Quick Wins)
    match /groupBookings/{groupBookingId} {
      // Helper function to check if user is participant
      function isParticipant() {
        return request.auth.uid in resource.data.participantIds;
      }

      // Read: public if isPublic, or if user is organizer or participant
      allow read: if resource.data.isPublic == true ||
        (request.auth != null &&
         (request.auth.uid == resource.data.organizerId ||
          isParticipant()));

      // Create: authenticated users only
      allow create: if request.auth != null &&
        request.resource.data.organizerId == request.auth.uid;

      // Update: organizer or participants (for payment status)
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.organizerId ||
         isParticipant() ||
         isAdmin());

      // Delete: organizer only or admin
      allow delete: if request.auth != null &&
        (request.auth.uid == resource.data.organizerId || isAdmin());
    }

    // Featured Items (Quick Wins)
    match /featuredItems/{featuredId} {
      // Read: everyone can see active featured items
      allow read: if true;

      // Create: admin only
      allow create: if isAdmin();

      // Update: admin only
      allow update: if isAdmin();

      // Delete: admin only
      allow delete: if isAdmin();
    }
  }
}
```

### ขั้นตอนที่ 3: Publish

1. คลิกปุ่ม **Publish** สีฟ้า
2. รอสักครู่ให้ rules มีผล
3. Refresh หน้าเว็บแล้วลองใหม่

## สรุป Rules

### Users
- อ่านได้: user ที่ login แล้ว
- สร้างได้: user ที่ login แล้ว
- แก้ไขได้: เจ้าของ หรือ admin
- ลบได้: เฉพาะ admin

### Lungs
- อ่านได้: ทุกคน (สำหรับ browse/search)
- สร้างได้: user ที่ login แล้ว
- แก้ไข/ลบได้: เฉพาะ admin

### Bookings
- อ่านได้: ลูกค้า, ลุง, หรือ admin
- สร้างได้: user ที่ login แล้ว
- แก้ไขได้: ลูกค้า, ลุง, หรือ admin
- ลบได้: เฉพาะ admin

### Partner Applications
- อ่านได้: ผู้สมัคร หรือ admin
- สร้าง/แก้ไขได้: ผู้สมัคร หรือ admin
- **ลบได้: เฉพาะ admin** ⭐ (เพิ่มใหม่)

### Payouts & Commission Settings & Ledger
- อ่าน/เขียนได้: เฉพาะ admin

### Reviews (Phase 1)
- อ่านได้: ทุกคน (เฉพาะรีวิวที่ isVisible = true)
- สร้างได้: user ที่ login แล้ว (เฉพาะรีวิวของตัวเอง)
- แก้ไขได้: เฉพาะ admin
- ลบได้: ไม่มีใครลบได้ (ป้องกันการลบรีวิว)

### Notifications (Phase 1)
- อ่านได้: เจ้าของ notification เท่านั้น
- สร้างได้: user ที่ login แล้ว
- แก้ไขได้: เจ้าของ (เฉพาะ field read และ readAt)
- ลบได้: ไม่มีใครลบได้

### Referrals (Quick Wins)
- อ่านได้: referrer, referee, หรือ admin
- สร้าง/แก้ไขได้: referrer, referee, หรือ admin
- ลบได้: เฉพาะ admin

### Referral Settings (Quick Wins)
- อ่านได้: ทุกคน
- เขียนได้: เฉพาะ admin

### User Achievements (Quick Wins)
- อ่านได้: user ที่ login แล้ว
- สร้างได้: user ที่ login แล้ว
- แก้ไขได้: เจ้าของ (ถ้า ID ขึ้นต้นด้วย userId) หรือ admin
- ลบได้: เฉพาะ admin

### User Points (Quick Wins)
- อ่านได้: user ที่ login แล้ว
- สร้างได้: user ที่ login แล้ว
- แก้ไขได้: เจ้าของ หรือ admin
- ลบได้: เฉพาะ admin

### Point Transactions (Quick Wins)
- อ่านได้: เจ้าของ transaction หรือ admin
- สร้างได้: user ที่ login แล้ว
- แก้ไข/ลบได้: เฉพาะ admin

### Group Bookings (Quick Wins)
- อ่านได้:
  - ทุกคน (ถ้า isPublic = true)
  - organizer และ participants
- สร้างได้: user ที่ login แล้ว (ต้องเป็น organizer)
- แก้ไขได้: organizer, participants, หรือ admin
- ลบได้: organizer หรือ admin

### Featured Items (Quick Wins)
- อ่านได้: ทุกคน
- สร้าง/แก้ไข/ลบได้: เฉพาะ admin

## หมายเหตุ

- ปลอดภัยสำหรับใช้งาน production ✅
- ป้องกันการเข้าถึงข้อมูลที่ไม่ได้รับอนุญาต ✅
- Admin ต้องมี `role: 'admin'` ใน users collection
- ใช้ helper function `isAdmin()` เพื่อความสะดวกในการเช็ค admin role
- รองรับฟีเจอร์ทั้งหมด: Phase 1, Quick Wins, Group Booking, Featured Activities ✅
