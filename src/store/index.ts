// Tüm kullanıcı verisi cihazda tutulur (hesap yok, internet gerekmez).
import Storage from 'expo-sqlite/kv-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { gunAnahtari, gunFarki } from '@/lib/tarih';

export type Aliskanlik = {
  id: string;
  ad: string;
  kucuk: string; // zor gün hâli: bunu yapan da sayılır
  simge: string;
  haftalikHedef: number; // haftada kaç gün
  program?: string; // bu program bitince kendiliğinden işaretlenir
  olusturma: string;
};

export type Isaret = 'tam' | 'kucuk';
export type TemaTercihi = 'sistem' | 'acik' | 'koyu';

export type Antrenman = { id: string; programId: string; tarih: string; sureSn: number; sinav: number };

export type UzunIlerleme = { baslangic: string; tamam: Record<number, number> }; // gün -> yapılan tekrar

export type KiloKaydi = { tarih: string; kg: number };

type Durum = {
  aliskanliklar: Aliskanlik[];
  isaretler: Record<string, Record<string, Isaret>>; // gün -> alışkanlık id -> işaret
  antrenmanlar: Antrenman[];
  uzun: Record<string, UzunIlerleme>;
  kilolar: KiloKaydi[];
  hedefKg?: number;
  sesAcik: boolean;
  tema: TemaTercihi;

  aliskanlikEkle: (a: Omit<Aliskanlik, 'id' | 'olusturma'>) => void;
  aliskanlikSil: (id: string) => void;
  isaretle: (id: string, isaret: Isaret | null, gun?: string) => void;
  antrenmanBitir: (a: Omit<Antrenman, 'id' | 'tarih'>) => void;
  uzunBasla: (programId: string) => void;
  uzunGunKaydet: (programId: string, gun: number, tekrar: number) => void;
  uzunSifirla: (programId: string) => void;
  kiloEkle: (kg: number) => void;
  hedefKgAyarla: (kg?: number) => void;
  sesAyarla: (acik: boolean) => void;
  temaAyarla: (t: TemaTercihi) => void;
};

const yeniId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const useVeri = create<Durum>()(
  persist(
    (set, get) => ({
      aliskanliklar: [],
      isaretler: {},
      antrenmanlar: [],
      uzun: {},
      kilolar: [],
      hedefKg: undefined,
      sesAcik: true,
      tema: 'sistem',

      aliskanlikEkle: (a) =>
        set((s) => ({
          aliskanliklar: [...s.aliskanliklar, { ...a, id: yeniId(), olusturma: gunAnahtari() }],
        })),

      aliskanlikSil: (id) =>
        set((s) => ({ aliskanliklar: s.aliskanliklar.filter((a) => a.id !== id) })),

      isaretle: (id, isaret, gun = gunAnahtari()) =>
        set((s) => {
          const o = { ...(s.isaretler[gun] ?? {}) };
          if (isaret) o[id] = isaret;
          else delete o[id];
          return { isaretler: { ...s.isaretler, [gun]: o } };
        }),

      antrenmanBitir: (a) => {
        const gun = gunAnahtari();
        set((s) => ({ antrenmanlar: [...s.antrenmanlar, { ...a, id: yeniId(), tarih: gun }] }));
        // Bu programa bağlı alışkanlıklar kendiliğinden "yapıldı" olur.
        for (const al of get().aliskanliklar) {
          if (al.program === a.programId) get().isaretle(al.id, 'tam', gun);
        }
      },

      uzunBasla: (programId) =>
        set((s) => ({ uzun: { ...s.uzun, [programId]: { baslangic: gunAnahtari(), tamam: {} } } })),

      uzunGunKaydet: (programId, gun, tekrar) => {
        const il = get().uzun[programId];
        if (!il) return;
        set((s) => ({
          uzun: { ...s.uzun, [programId]: { ...il, tamam: { ...il.tamam, [gun]: tekrar } } },
        }));
        // Dinlenme günü (0 tekrar) antrenman sayılmaz.
        if (tekrar > 0) get().antrenmanBitir({ programId, sureSn: 0, sinav: programId.startsWith('sinav') ? tekrar : 0 });
      },

      uzunSifirla: (programId) =>
        set((s) => {
          const u = { ...s.uzun };
          delete u[programId];
          return { uzun: u };
        }),

      kiloEkle: (kg) =>
        set((s) => {
          const gun = gunAnahtari();
          const digerleri = s.kilolar.filter((k) => k.tarih !== gun);
          return { kilolar: [...digerleri, { tarih: gun, kg }].sort((a, b) => a.tarih.localeCompare(b.tarih)) };
        }),

      hedefKgAyarla: (kg) => set({ hedefKg: kg }),
      sesAyarla: (acik) => set({ sesAcik: acik }),
      temaAyarla: (t) => set({ tema: t }),
    }),
    {
      name: 'dogrudisiplin-veri',
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (k) => Storage.getItemAsync(k),
        setItem: (k, v) => Storage.setItemAsync(k, v),
        removeItem: async (k) => {
          await Storage.removeItemAsync(k);
        },
      })),
      partialize: (s) => ({
        aliskanliklar: s.aliskanliklar,
        isaretler: s.isaretler,
        antrenmanlar: s.antrenmanlar,
        uzun: s.uzun,
        kilolar: s.kilolar,
        hedefKg: s.hedefKg,
        sesAcik: s.sesAcik,
        tema: s.tema,
      }),
    },
  ),
);

/** Uzun programda bugün kaçıncı gün (1'den başlar). Kaçırılan gün programı bozmaz: sıradaki yapılmamış gün gösterilir. */
export function uzunBugun(il: UzunIlerleme | undefined, toplamGun: number) {
  if (!il) return 0;
  const takvim = gunFarki(il.baslangic) + 1;
  const yapilan = Object.keys(il.tamam).length;
  return Math.min(toplamGun, Math.max(1, Math.min(takvim, yapilan + 1)));
}

/** Alışkanlığın toplam yapıldığı gün sayısı. Seri sıfırlanmaz; toplam gün sayılır. */
export function toplamGun(isaretler: Durum['isaretler'], id: string) {
  return Object.values(isaretler).filter((g) => g[id]).length;
}

/**
 * Bir günün disiplin durumu: antrenman ya da en az bir tam işaret → 'tam'; yalnız küçük hâller → 'kucuk'.
 * "Disiplin günü" sayısı bunlardan biri olan günlerin toplamıdır; hiç sıfırlanmaz.
 */
export function gunDurumu(gun: string, isaretler: Durum['isaretler'], antrenmanGunleri: Set<string>): Isaret | null {
  if (antrenmanGunleri.has(gun)) return 'tam';
  const g = isaretler[gun];
  if (!g) return null;
  const degerler = Object.values(g);
  if (degerler.includes('tam')) return 'tam';
  return degerler.length ? 'kucuk' : null;
}

export function disiplinGunu(isaretler: Durum['isaretler'], antrenmanGunleri: Set<string>) {
  const gunler = new Set(antrenmanGunleri);
  for (const [g, d] of Object.entries(isaretler)) if (Object.keys(d).length) gunler.add(g);
  return gunler.size;
}
