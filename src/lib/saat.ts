// Telefon ↔ saat eşitleme (Apple Watch ve Wear OS). Telefon tek doğru kaynaktır:
// bugünün alışkanlıkları, disiplin günü ve kısa programlar saate gönderilir; saatte yapılan
// işaretler ve biten antrenmanlar olay olarak geri gelir ve buraya işlenir.
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { bekleyenleriAl, durumGonder, olayDinle, saatVar } from '../../modules/saat-baglanti';

import { PROGRAMLAR } from '@/data/programlar';
import { gunAnahtari } from '@/lib/tarih';
import { disiplinGunu, gunDurumu, useVeri, type Isaret } from '@/store';

/** Saate giden durum. Sürüm alanı saat uygulamasıyla sözleşmedir: alan eklerken artır, silme. */
export type SaatDurumu = {
  v: 1;
  gun: string;
  disiplinGunu: number;
  bugunSayildi: boolean;
  aliskanliklar: { id: string; ad: string; kucuk: string; simge: string; isaret: Isaret | null }[];
  programlar: { id: string; ad: string; sure: string; dinlenme: number; hareketler: { id: string; ad: string; sure: number }[] }[];
};

export type SaatOlayi =
  | { tur: 'isaret'; gun: string; id: string; isaret: Isaret | null }
  | { tur: 'antrenman'; programId: string; tarih: string; sureSn: number };

// Saatte "birlikte yap" seansları gösterilir (uzun programlar ve rehberler telefonda kalır).
const SAAT_PROGRAMLARI = PROGRAMLAR.filter((p) => p.tur === 'kisa' && p.seans).map((p) => ({
  id: p.id,
  ad: p.ad,
  sure: p.sure,
  dinlenme: p.seans!.dinlenme,
  hareketler: p.seans!.hareketler.map((h) => ({ id: h.id, ad: h.ad, sure: h.sure })),
}));

export function saatDurumu(): SaatDurumu {
  const s = useVeri.getState();
  const gun = gunAnahtari();
  const antrenmanGunleri = new Set(s.antrenmanlar.map((a) => a.tarih));
  return {
    v: 1,
    gun,
    disiplinGunu: disiplinGunu(s.isaretler, antrenmanGunleri),
    bugunSayildi: gunDurumu(gun, s.isaretler, antrenmanGunleri) !== null,
    aliskanliklar: s.aliskanliklar.map((a) => ({ id: a.id, ad: a.ad, kucuk: a.kucuk, simge: a.simge, isaret: s.isaretler[gun]?.[a.id] ?? null })),
    programlar: SAAT_PROGRAMLARI,
  };
}

function olaylariIsle() {
  const v = useVeri.getState();
  for (const ham of bekleyenleriAl()) {
    try {
      const o = JSON.parse(ham) as SaatOlayi;
      if (o.tur === 'isaret' && v.aliskanliklar.some((a) => a.id === o.id)) v.isaretle(o.id, o.isaret, o.gun);
      else if (o.tur === 'antrenman') v.antrenmanBitir({ programId: o.programId, sureSn: o.sureSn, sinav: 0, tarih: o.tarih });
    } catch {
      // Bozuk olay atlanır.
    }
  }
}

/** Kök düzende bir kez çağrılır. Saat modülü yoksa (Expo Go, web) hiçbir şey yapmaz. */
export function useSaatEsitle() {
  useEffect(() => {
    if (!saatVar) return;
    let zamanlayici: ReturnType<typeof setTimeout> | undefined;
    let son = '';
    const gonder = () => {
      clearTimeout(zamanlayici);
      // Art arda işaretlemeler tek gönderimde birleşir.
      zamanlayici = setTimeout(() => {
        const json = JSON.stringify(saatDurumu());
        if (json !== son) durumGonder((son = json));
      }, 400);
    };
    const yenile = () => {
      olaylariIsle();
      gonder();
    };
    yenile();
    const depoBirak = useVeri.subscribe((s, o) => {
      if (s.aliskanliklar !== o.aliskanliklar || s.isaretler !== o.isaretler || s.antrenmanlar !== o.antrenmanlar) gonder();
    });
    const olay = olayDinle(yenile);
    const durum = AppState.addEventListener('change', (d) => d === 'active' && yenile());
    return () => {
      clearTimeout(zamanlayici);
      depoBirak();
      olay.remove();
      durum.remove();
    };
  }, []);
}
