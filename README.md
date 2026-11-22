# Doğru Disiplin — mobil uygulama

@dogrudisiplin (Instagram/YouTube) için kalisteniks + alışkanlık + kilo takibi uygulaması. Expo SDK 58, Expo Router, Zustand (cihazda SQLite kv-store), hesap yok.

## Çalıştırma
```bash
npm install
npx expo start        # telefonda Expo Go ile QR'ı okut
```

## Yapı
- `src/app/(tabs)`: Bugün · Programlar · Alışkanlık · İstatistik
- `src/app/oynatici/[id].tsx`: sesli "birlikte yap" oynatıcısı (YouTube #01 gibi)
- `src/app/program/[id].tsx`: kısa program, 30 günlük program, rehber
- `src/data/`: programlar, hazır alışkanlık paketleri, açılış sözleri
- `src/store/`: tüm kullanıcı verisi
- `assets/images/hareket/`: GPT (gpt-image-2) çizimleri. Tarifler: `~/Desktop/dogrudisiplin-gorseller/uygulama/ham/` (`./ciz.sh <ad>`)

Powered by [Nüve Dijital](https://nuvedigital.com)
