# Debug Avatar Issues

กรุณาตรวจสอบดังนี้:

## 1. เช็ค Console (F12)
- มี error รูปโหลดไม่ได้หรือไม่?
- URL รูปเป็นอะไร?

## 2. เช็ค Network Tab
- มีการโหลดรูปหรือไม่?
- Status code เป็น 200 หรือ 404?

## 3. ทดลอง Logout/Login ใหม่
- Logout ออกจากระบบ
- Login ด้วย Google อีกครั้ง
- ดูว่ารูปกลับมาหรือไม่

## 4. เช็ค authStore.user.avatar
ใน Console พิมพ์:
```javascript
useAuthStore().user
```
ดู avatar URL เป็นอะไร
