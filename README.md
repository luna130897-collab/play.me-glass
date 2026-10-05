# 🎵 Play.me - Y2K Glass Music Player (Android APK)

Aplikasi pemutar musik offline Android bernuansa **Y2K Glassmorphism** yang dilengkapi dengan pemutar file lokal, visualizer animasi GIF/video dinamis, equalizer 5-band, pembuat playlist, lirik sinkron, serta 8 tema warna estetik (*Warm Pastel Yellow*, *Onyx Pitch Black*, *Deep Navy Blue*, *Soft Pink*, *Cyber Magenta*, *Midnight Amethyst*, *Emerald Mint*, dan *Ice Cyan*).

---

## 🚀 Cara Otomatis Compile APK di GitHub (Tanpa Android Studio)

Repository ini telah dikonfigurasi dengan **GitHub Actions** (`.github/workflows/build-apk.yml`). Setiap kali kode di-push ke GitHub, sistem GitHub akan langsung mengompilasi aplikasi menjadi file installer Android APK secara gratis di cloud.

### Langkah-langkah Download APK dari GitHub:

1. **Push Proyek ke Repository GitHub Anda:**
   ```bash
   git add .
   git commit -m "Siap compile APK Android"
   git push origin main
   ```

2. **Jalankan / Cek Build di GitHub:**
   - Buka halaman repository Anda di GitHub melalui browser.
   - Klik tab **Actions** di bagian atas menu repository.
   - Anda akan melihat workflow bernama **"Build Android APK"** sedang berjalan secara otomatis (ikon lingkaran oranye berputar).
   - *Catatan:* Anda juga bisa memicu build kapan saja secara manual: klik **"Build Android APK"** di sebelah kiri -> klik tombol **"Run workflow"** -> pilih branch `main` -> klik tombol hijau **"Run workflow"**.

3. **Unduh File APK:**
   - Tunggu sekitar 2 - 4 menit hingga proses build selesai bertanda centang hijau (✅).
   - Klik nama proses build tersebut (misal: *"Compile Android APK"*).
   - Gulir ke bagian paling bawah pada menu **Artifacts**.
   - Klik dan unduh file bernama **`Musik-Cantik-Y2K-Debug-APK`**.
   - Ekstrak file zip yang diunduh untuk mendapatkan file `app-debug.apk`.

4. **Pasang di HP Android:**
   - Kirim file `app-debug.apk` ke HP Android Anda (melalui WhatsApp, Telegram, Google Drive, atau kabel USB).
   - Buka file APK di HP dan pilih **Install** (jika diminta, aktifkan izin *"Install unknown apps"* pada browser/file manager Anda).
   - Aplikasi siap digunakan dengan performa native di Android!

---

## 💻 Cara Compile APK Manual di Komputer Sendiri (Opsional)

Jika Anda ingin mengompilasi APK langsung di komputer lokal menggunakan terminal atau Android Studio:

### Prasyarat:
- Node.js (v18 atau lebih baru)
- Java JDK 17
- Android SDK / Android Studio

### Perintah Build:
```bash
# 1. Install dependensi
npm install

# 2. Build web asset dan sinkronisasi ke project Android
npm run cap:build

# 3. Compile file APK langsung via terminal:
cd android
./gradlew assembleDebug

# File APK hasil build akan berada di:
# android/app/build/outputs/apk/debug/app-debug.apk
```

Atau buka folder `android/` langsung menggunakan **Android Studio** untuk menjalankan di emulator atau mengekspor APK bertanda tangan (*Signed Release APK*).

---

## 📦 Struktur Konfigurasi Android:
- **`capacitor.config.json`**: Pengaturan nama aplikasi (*Play.me*), ID paket (`com.musikcantik.player`), dan direktori web.
- **`android/`**: Proyek asli Android Gradle yang siap dikompilasi.
- **`android/app/src/main/AndroidManifest.xml`**: Izin akses file audio HP, pemutaran latar belakang (*foreground service media playback*), dan optimasi layar penuh.
- **`.github/workflows/build-apk.yml`**: Skrip otomatisasi GitHub Actions cloud build APK.
