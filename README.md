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
- `assets/images/hareket/`: GPT (gpt-image-2) çizimleri. Karakterle aynı tarzda, hareket başına 2 poz + çalışan kaslar kartı

## Saatler ve katlanabilir telefonlar
Saat uygulamaları yerel koddur; Expo Go'da çalışmaz, geliştirme derlemesi gerekir.

- **Apple Watch** (`targets/saat`, `targets/saat-komplikasyon`, SwiftUI, `@bacons/apple-targets`): Bugün (disiplin günü + alışkanlık işaretleme, basılı tut = küçük hâli), bilekte antrenman (HealthKit oturumu: nabız, Etkinlik halkaları, titreşimli geçişler), kadran komplikasyonu. `npx expo prebuild -p ios` sonra Xcode'da `DogruDisiplin` şeması (saat uygulaması içine gömülü gelir). `ios.appleTeamId` app.json'a eklenmeli; App Group `group.com.kodal.dogrudisiplin` ve HealthKit yetkisi Apple Developer'da açılmalı.
- **Wear OS** (`wear/`, Kotlin + Compose for Wear OS): aynı özellikler + karo (Tile) + komplikasyon. `plugins/wear-os.js` modülü prebuild'de Android projesine ekler. `cd android && ./gradlew :wear:bundleRelease` → aynı Play kaydına "Wear OS" form faktörü olarak yüklenir; telefonla aynı imza anahtarı şart.
- **Köprü** (`modules/saat-baglanti`, `src/lib/saat.ts`): telefon tek doğru kaynak. Durum telefondan saate (iOS `applicationContext`, Android DataClient `/durum`); saatteki işaret ve antrenmanlar olay olarak geri gelir (iOS `transferUserInfo`, Android `/olay/<id>`), uygulama kapalıyken de kuyruğa alınır.
- **Katlanabilir / tablet / yatay**: `src/lib/duzen.ts`. İçerik en fazla 760 genişlikte ortalanır, 600'den geniş ekranda programlar iki sütun, yatay ekranda oynatıcıda çizim solda sayaç sağda. Katlayıp açınca antrenman kaldığı yerden sürer.
- Simülatörde telefonsuz deneme: Apple Watch `-ornek -ekran antrenman|aliskanlik`, Wear OS `am start ... --ez ornek true` (yalnız deneme sürümü).

Powered by [Nüve Dijital](https://nuvedigital.com)
