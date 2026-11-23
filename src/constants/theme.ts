// Doğru Disiplin marka teması: Gece + Volt. Uygulama yalnız koyu temayla çalışır.
// Yazı dili: başlıklar Inter kalın (sade), Anton yalnız büyük sayılarda (gün sayacı, 01–08, geri sayım) ve açılış sözünde.
export const Renk = {
  gece: '#14181F',
  gece2: '#1B2028', // kart
  gece3: '#262C36', // boş kare, iz
  cizgi: '#2B323D', // ince kenar
  kemik: '#F2F2EE',
  soluk: '#8B929D',
  pasif: '#3A424E',
  volt: '#C8F031',
  voltSoluk: 'rgba(200,240,49,0.14)',
  kirmizi: '#FF5A5A',
  murekkep: '#0A0C10',
} as const;

export const Yazi = {
  baslik: 'Anton_400Regular', // yalnız sayılar ve açılış sözü
  normal: 'Inter_400Regular',
  orta: 'Inter_600SemiBold',
  kalin: 'Inter_700Bold',
} as const;

export const Bosluk = { s: 6, m: 12, l: 20, xl: 28 } as const;
export const Kose = { s: 10, m: 18, l: 26 } as const;
