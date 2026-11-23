// Doğru Disiplin marka teması: Gece + Volt (koyu) ve Kemik + Volt (açık).
// Renkler bileşenlerde `useRenk()` ile alınır (src/lib/tema.ts); stiller `stil((Renk) => ({...}))` ile kurulur.
// Yazı dili: başlıklar Inter kalın (sade), Anton yalnız büyük sayılarda (gün sayacı, 01–08, geri sayım) ve açılış sözünde.
//
// Ad anlamları (iki temada aynı görev):
//   gece = zemin, gece2 = kart, gece3 = boş kare / iz, cizgi = ince kenar, pasif = boş kare kenarı
//   kemik = ana yazı, soluk = ikincil yazı
//   volt = volt dolgu (düğme, dolu kare, halka), vurgu = volt anlamlı YAZI rengi, voltUstu = volt dolgunun üstündeki yazı

export const KOYU = {
  gece: '#14181F',
  gece2: '#1B2028',
  gece3: '#262C36',
  cizgi: '#2B323D',
  pasif: '#3A424E',
  kemik: '#F2F2EE',
  soluk: '#8B929D',
  volt: '#C8F031',
  vurgu: '#C8F031',
  voltUstu: '#14181F',
  voltSoluk: 'rgba(200,240,49,0.14)',
  kirmizi: '#FF5A5A',
} as const;

export type Palet = { readonly [K in keyof typeof KOYU]: string };

// Açık tema: marka "kemik" zemini, beyaz kartlar, gece mürekkep. Volt açık zeminde yazı olarak okunmaz:
// yazıda koyu zeytin (vurgu), dolgularda volt + gece yazı.
export const ACIK: Palet = {
  gece: '#F2F2EE',
  gece2: '#FFFFFF',
  gece3: '#E5E6E0',
  cizgi: '#E2E2DB',
  pasif: '#BFC2BA',
  kemik: '#14181F',
  soluk: '#6A707A',
  volt: '#C8F031',
  vurgu: '#4F6B00',
  voltUstu: '#14181F',
  voltSoluk: 'rgba(140,180,0,0.14)',
  kirmizi: '#D93636',
};

export const Yazi = {
  baslik: 'Anton_400Regular', // yalnız sayılar ve açılış sözü
  normal: 'Inter_400Regular',
  orta: 'Inter_600SemiBold',
  kalin: 'Inter_700Bold',
} as const;

export const Bosluk = { s: 6, m: 12, l: 20, xl: 28 } as const;
export const Kose = { s: 10, m: 18, l: 26 } as const;
