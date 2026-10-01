# แก้ไข CORS Error ใน Firebase Storage

## ปัญหา
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...'
has been blocked by CORS policy
```

## วิธีแก้ (เลือก 1 วิธี)

### วิธีที่ 1: ผ่าน Firebase Console (แนะนำ - ง่ายที่สุด)

1. ไปที่ https://console.firebase.google.com/
2. เลือกโปรเจค: **cogent-density-409510**
3. คลิก **Storage** ในเมนูซ้าย
4. คลิกแท็บ **Rules**
5. แก้ไข rules เป็น:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

6. คลิก **Publish**

### วิธีที่ 2: ใช้ Google Cloud SDK (สำหรับ advanced users)

1. ติดตั้ง Google Cloud SDK:
```bash
# macOS
brew install google-cloud-sdk
```

2. Login:
```bash
gcloud auth login
```

3. Set project:
```bash
gcloud config set project cogent-density-409510
```

4. Apply CORS config:
```bash
gsutil cors set cors.json gs://cogent-density-409510.firebasestorage.app
```

5. Verify:
```bash
gsutil cors get gs://cogent-density-409510.firebasestorage.app
```

## หลังจากตั้งค่าเสร็จ

1. Refresh หน้าเว็บ
2. ลองอัปโหลดรูปใหม่อีกครั้ง
3. ควรอัปโหลดได้โดยไม่มี CORS error

## หมายเหตุ

- Rules ที่แนะนำให้ทุกคนอ่านได้ (`allow read: if true`)
- แต่เขียนได้เฉพาะ user ที่ login แล้ว (`allow write: if request.auth != null`)
- ปลอดภัยสำหรับใช้งาน production
