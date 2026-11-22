# Doğru Disiplin uygulaması

- Kullanıcı Türkçe konuşur; arayüz metinleri Türkçe, kod adları Türkçe (mevcut stile uy).
- Marka: Gece + Volt (#14181F / #F2F2EE / #C8F031), Anton + Inter. Sadece koyu tema.
- Karakter çizgi adam DEĞİL: Reels'teki marka karakteri (dağınık koyu kahve saç, yüzsüz, çıplak gövde, gri şort + siyah tayt, beyaz ayakkabı, volt bileklik). Bütün görseller GPT (gpt-image-2) ile bu karakterden çizilir; referans `assets/images/karakter-sayfa.png`, tarifler `~/Desktop/dogrudisiplin-gorseller/uygulama/ham/`.
- Seri sıfırlanmaz: toplam gün + haftalık hedef; her alışkanlığın "küçük hâli" de sayılır.
- Sesli anons şimdilik expo-speech (tr-TR); Oğuz'un ElevenLabs kayıtları gelince cümle başına MP3 (expo-audio), `src/lib/ses.ts` arayüzü aynı kalır.
- Oğuz geri bildirimi (2026-11-22): Anton başlıklarda Türkçe işaretler kesilmesin → `Baslik` satır yüksekliği ≥1.3×; büyük harf için her zaman `trBuyuk` (textTransform/toUpperCase "DAKIKA" yazar). Geri sayım halkası Reanimated ile UI thread'de akar; saniyede bir JS güncellemesiyle çizme.
- GPT hareket çizimi: 2. kare için 1. kareyi referans vermek çoğu zaman aynı resmi üretir (özellikle yandan bacak değişimi). Çözüm: iki pozu tek 1536×768 resimde yan yana çizdir (`<id>-cift.txt`), `sips -c 768 768 --cropOffset 0 0|768` ile böl. Yandan iki bacak ayırt edilemez; zıt faz yerine "diz yukarı ↔ iki ayak yerde" gibi net fark seç.
- Hakkında/Ayarlar ekranında "Powered by Nüve Dijital" (nuvedigital.com) kalır.
- Ürün notları ve kararlar: nüve kasası `knowledge/concepts/dogrudisiplin-uygulama-rakip-analizi.md`.

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
