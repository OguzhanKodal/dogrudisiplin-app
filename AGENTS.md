# Doğru Disiplin uygulaması

- Kullanıcı Türkçe konuşur; arayüz metinleri Türkçe, kod adları Türkçe (mevcut stile uy).
- Marka: Gece + Volt (#14181F / #F2F2EE / #C8F031). Koyu ve açık tema (Oğuz, 2026-11-23); varsayılan telefona uyar, Ayarlar'dan seçilir. Renkler yalnız `useRenk()` / `stil((Renk) => ...)` ile (src/lib/tema.ts); sabit renk yazma. Volt açık zeminde yazı olarak okunmaz: yazıda `Renk.vurgu`, volt dolgu üstünde `Renk.voltUstu`. Hareket çizimleri iki temada da koyu karo.
- Tasarım dili (2026-11-23): rakiplerden (Bend vb.) yalnız sadelik alınır, görünüm kopyalanmaz (açık zemin + pastel daire = rakip). Başlıklar Inter kalın, cümle düzeni (`Baslik`); Anton yalnız büyük sayılarda (`Sayi`: disiplin günü, 01–08, geri sayım) ve açılış sözünde. İmza işaret: kare (`IsaretKare`: boş / tam / çapraz yarım = küçük hâli). Kartlar ince kenarlı, köşe 26; ana düğme volt hap.
- Karakter çizgi adam DEĞİL: Reels'teki marka karakteri (dağınık koyu kahve saç, yüzsüz, çıplak gövde, gri şort + siyah tayt, beyaz ayakkabı, volt bileklik). Bütün görseller GPT (gpt-image-2) ile bu karakterden çizilir; referans `assets/images/karakter-sayfa.png`, tarifler repo dışında (`dogrudisiplin-gorseller/uygulama/yeni-stil/`).
- Seri sıfırlanmaz: toplam gün + haftalık hedef; her alışkanlığın "küçük hâli" de sayılır.
- Sesli anons şimdilik expo-speech (tr-TR); Oğuz'un ElevenLabs kayıtları gelince cümle başına MP3 (expo-audio), `src/lib/ses.ts` arayüzü aynı kalır.
- Oğuz geri bildirimi (2026-11-22): Anton'da Türkçe işaretler/rakam üstleri kesilmesin → satır yüksekliği ≥1.25×; büyük harf için her zaman `trBuyuk` (textTransform/toUpperCase "DAKIKA" yazar). Geri sayım halkası Reanimated ile UI thread'de akar; saniyede bir JS güncellemesiyle çizme.
- GPT hareket çizimi (yeni stil): her hareket tek 1024×1024 resimde 2×2 koyu karo (sol üst 1. poz, sağ üst 2. poz, sol alt kas kartı); referans karakter sayfası + stil örneği. Karolar sınır tespitiyle kesilir (macOS `sips` kırpma ofsetini yok sayıyor). Çizimin kendi yuvarlak köşesi var: gösterirken köşe = kenar × `KOSE_ORANI` (0.13). Bacak değişen hareketlerde 3/4 önden çizdir; yandan iki bacak ayırt edilmez. 2. kareyi 1. kareyi referans vererek üretmek aynı resmi verir. Kesilen karo 486×486'ya küçültülür ve WebP'ye çevrilir (`cwebp -q 84 -m 6`, karo başına ~6 KB; PNG ~210 KB); `POZLAR` haritasına eklenir. Dağcı gibi iki pozu ayırt edilmeyen hareket tek poz + kas kartı olarak bağlanır.
- Saatler (2026-11-28): Apple Watch `targets/saat*` (SwiftUI), Wear OS `wear/` (Compose), köprü `modules/saat-baglanti` + `src/lib/saat.ts`. Saate giden durum sözleşmesi `SaatDurumu` (v: 1): alan eklenirse üç tarafta (TS, Swift `Depo.swift`, Kotlin `Durum.kt`) birlikte güncellenir. Wear derlemesi JDK 17 ister (`/opt/homebrew/opt/openjdk@17`); Xcode komutları için `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` (xcode-select CLT'yi gösteriyor).
- Ekran düzeni `useDuzen()` (src/lib/duzen.ts): sabit genişlik/`Dimensions.get` kullanma; katlanabilir açılıp kapanınca boyut değişir.
- Yazı tipleri alt yoldan içe aktarılır (`@expo-google-fonts/inter/700Bold`); paketin ana girişi bütün kalınlıkları (~6 MB) pakete katar.
- Hakkında/Ayarlar ekranında "Powered by Nüve Dijital" (nuvedigital.com) kalır.

This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
