# راهنمای نصب و راه‌اندازی

## پیش‌نیازها

- Android Studio (برای ساخت اپ)
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (اختیاری)

---

## ۱. راه‌اندازی بکند

```bash
cd backend
cp .env.example .env
# ویرایش .env و وارد کردن مشخصات دیتابیس
npm install
npm run start:dev
```

## ۲. راه‌اندازی پنل ادمین

```bash
cd admin
npm install
npm run dev
```

## ۳. ساخت اپ اندروید

```bash
cd android
./gradlew assembleDebug
# APK در: app/build/outputs/apk/debug/
```

## ۴. Docker (همه سرویس‌ها با هم)

```bash
docker-compose up -d
```

---

## GitHub Actions — ساخت خودکار APK

هر بار که کد به شاخه `main` push شود:
1. APK debug ساخته می‌شود
2. APK و AAB release ساخته می‌شود (نیاز به keystore)
3. یک Release در GitHub ایجاد می‌شود با لینک دانلود

### تنظیم Keystore برای Release

1. در GitHub Repository → Settings → Secrets بروید
2. این Secret‌ها را اضافه کنید:
   - `KEYSTORE_BASE64`: محتوای keystore به صورت base64
   - `KEYSTORE_PASSWORD`: رمز keystore
   - `KEY_ALIAS`: نام alias
   - `KEY_PASSWORD`: رمز key

برای ساخت keystore اول، Workflow `generate-keystore.yml` را اجرا کنید.

---

## مالکیت

**برند:** سالن زیبایی پروانه اکبرپور  
**توسعه‌دهنده فنی:** علی بهمنی
