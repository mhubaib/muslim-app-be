# 📘 Muslim App Backend

Backend API untuk aplikasi Muslim App menggunakan **Express.js**, **Prisma**, **PostgreSQL**, dan **Firebase Cloud Messaging** (FCM).

## ✨ Fitur Utama

- 📖 **Quran API** - Cache semua 114 surah dan ayat
- 🕌 **Jadwal Sholat** - Cache harian dengan koordinat geografis
- 📅 **Kalender Islam** - Event-event penting Islam
- 🔔 **Push Notification** - FCM topic-based untuk Azan, Event, dan Custom
- 🔐 **API Key Authorization** - Proteksi semua endpoint dengan API key

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Firebase project dengan FCM enabled

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## 📁 Project Structure

```
/src
  /config
    database.ts          # Prisma client configuration
    firebase.ts          # Firebase Admin SDK setup
  /modules
    /quran
      quran.controller.ts
      quran.service.ts
    /prayer
      prayer.controller.ts
      prayer.service.ts
    /notification
      notification.controller.ts
      notification.service.ts
    /event
      event.controller.ts
      event.service.ts
  /middlewares
    apiKey.middleware.ts # API key validation
  /utils
    http.ts             # HTTP utility functions
  app.ts                # Express app setup
  server.ts             # Server initialization
  index.ts              # Entry point
```

## 🔐 Authentication

Semua endpoint (kecuali `/` dan `/health`) memerlukan API key di header:

```
x-api-key: YOUR_PUBLIC_API_KEY
```

Tidak ada autentikasi user. API key digunakan untuk validasi bahwa request berasal dari aplikasi resmi.

## 📡 API Endpoints

### Health Check

#### `GET /`

Status API

#### `GET /health`

Health check endpoint

---

### Quran API

#### `GET /quran/surah`

Mengambil semua surah (114 surah)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "سُورَةُ ٱلْفَاتِحَةِ",
      "englishName": "Al-Faatiha",
      "numberOfAyahs": 7,
      "revelationType": "Meccan"
    }
  ]
}
```

#### `GET /quran/surah/:id`

Mengambil surah tertentu dengan semua ayat

**Parameters:**

- `id` (1-114) - Nomor surah

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "سُورَةُ ٱلْفَاتِحَةِ",
    "englishName": "Al-Faatiha",
    "numberOfAyahs": 7,
    "revelationType": "Meccan",
    "ayahs": [
      {
        "id": 1,
        "ayahNumber": 1,
        "surahId": 1,
        "textArabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
        "textLatin": null,
        "textTranslation": null
      }
    ]
  }
}
```

#### `GET /quran/ayah/:surahId/:ayahNumber`

Mengambil ayat tertentu

**Parameters:**

- `surahId` - Nomor surah
- `ayahNumber` - Nomor ayat dalam surah

---

### Prayer Times API

#### `GET /prayer/today?lat=...&lon=...`

Mengambil jadwal sholat hari ini

**Query Parameters:**

- `lat` - Latitude (-90 to 90)
- `lon` - Longitude (-180 to 180)

**Response:**

````json
{
  "success": true,
  "data": {
    "date": "2025-12-02",
    "fajr": "04:32",
    "dhuhr": "11:52",
    "asr": "15:15",

#### `GET /events/upcoming`
Mengambil event yang akan datang

#### `GET /events/:id`
Mengambil event tertentu

#### `POST /events`
Membuat event baru

**Request Body:**
```json
{
  "name": "Isra Mi'raj",
  "description": "Peringatan Isra Mi'raj Nabi Muhammad SAW",
  "dateHijri": "27 Rajab 1446",
  "estimatedGregorian": "2025-01-27"
}
````

#### `PUT /events/:id`

Update event

#### `DELETE /events/:id`

Hapus event

---

### Push Notification API

#### `POST /notification/send`

Kirim notifikasi langsung ke topic

**Request Body:**

```json
{
  "type": "AZAN",
  "title": "Waktu Adzan Subuh",
  "body": "Sudah masuk waktu Subuh",
  "meta": {
    "prayerName": "Fajr"
  }
}
```

**Notification Types:**

- `AZAN` - Notifikasi adzan
- `EVENT_ISLAMIC` - Notifikasi event Islam
- `CUSTOM` - Notifikasi custom

#### `POST /notification/schedule`

Jadwalkan notifikasi untuk waktu tertentu

**Request Body:**

```json
{
  "type": "AZAN",
  "title": "Waktu Adzan Subuh",
  "body": "Sudah masuk waktu Subuh",
  "scheduleAt": "2025-12-03T04:32:00Z",
  "meta": {}
}
```

#### `GET /notification/scheduled`

Lihat semua notifikasi yang dijadwalkan

#### `DELETE /notification/scheduled/:id`

Hapus notifikasi terjadwal

---

## 🔥 Firebase Cloud Messaging (FCM)

### Client Setup

Aplikasi mobile harus subscribe ke topic yang diinginkan:

```javascript
import messaging from '@react-native-firebase/messaging';

// Subscribe to topics
await messaging().subscribeToTopic('AZAN');
await messaging().subscribeToTopic('EVENT_ISLAMIC');
await messaging().subscribeToTopic('CUSTOM');
```

### Server Sending

Server mengirim notifikasi ke topic menggunakan Firebase Admin SDK:

```typescript
admin.messaging().send({
  notification: { title, body },
  data: meta,
  topic: type,
});
```

---

## 🧠 Caching Strategy

### Quran Caching

1. Saat server pertama kali dijalankan, cek jumlah surah di database
2. Jika belum ada 114 surah → fetch dari API eksternal (alquran.cloud)
3. Simpan semua surah dan ayat ke database
4. Request selanjutnya hanya baca dari database (sangat cepat)

### Prayer Times Caching

1. Cache per hari (1 row = 1 hari)
2. Saat request masuk:
   - Cek apakah ada cache untuk hari ini
   - Jika ada → return dari database
   - Jika tidak → fetch dari API (aladhan.com) → simpan → return
3. Cleanup otomatis setiap tengah malam (hapus cache hari sebelumnya)

---

## ⏰ Scheduled Jobs (Cron)

### Daily Cache Cleanup

**Schedule:** Setiap hari jam 00:00  
**Function:** Hapus cache jadwal sholat yang sudah lewat

### Notification Processing

**Schedule:** Setiap menit  
**Function:** Proses dan kirim notifikasi yang sudah waktunya

---

## 🌍 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/muslimapp"

# API Security
PUBLIC_API_KEY="your_public_api_key_here"

# Firebase Cloud Messaging
FCM_PROJECT_ID="your-firebase-project-id"
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FCM_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"

# Server
PORT=3000
NODE_ENV=development
```

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Run production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)

# Code Quality
npm run lint             # Check code with ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

---

## 🗄️ Database Schema

### PrayerCache

Cache jadwal sholat harian

- `id`, `date`, `fajr`, `dhuhr`, `asr`, `maghrib`, `isha`

### NotificationSchedule

Notifikasi yang dijadwalkan

- `id`, `type`, `title`, `body`, `scheduleAt`, `meta`

### IslamicEvent

Event-event Islam

- `id`, `name`, `description`, `dateHijri`, `estimatedGregorian`

### Surah

Surah Al-Quran

- `id`, `name`, `englishName`, `numberOfAyahs`, `revelationType`

### Ayah

Ayat Al-Quran

- `id`, `ayahNumber`, `surahId`, `textArabic`, `textLatin`, `textTranslation`

---

## 🧭 Arah Kiblat

Tidak menggunakan backend. Perhitungan dilakukan di client menggunakan formula:

```javascript
const bearing = Math.atan2(
  Math.sin(deltaLongitude),
  Math.cos(userLat) * Math.tan(kaabaLat) - Math.sin(userLat) * Math.cos(deltaLongitude)
);
```

Koordinat Ka'bah: `21.4225° N, 39.8262° E`

---

## 🚨 Error Handling

Semua endpoint mengembalikan response dalam format:

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

**HTTP Status Codes:**

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Version History

### v1.0.0 (Current)

- ✅ Quran caching system
- ✅ Prayer times caching
- ✅ Islamic events CRUD
- ✅ FCM push notifications (topic-based)
- ✅ API key authorization
- ✅ Scheduled notification processing
- ✅ Automatic cache cleanup

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Credits

- **Quran API:** [alquran.cloud](https://alquran.cloud)
- **Prayer Times API:** [aladhan.com](https://aladhan.com)
- **Firebase:** Cloud Messaging for push notifications
- **Prisma:** Modern database toolkit
- **Express.js:** Web framework

---

**Made with ❤️ for the Muslim community**
