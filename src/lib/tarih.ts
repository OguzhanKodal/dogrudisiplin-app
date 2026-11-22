// Yerel saate göre gün anahtarı (YYYY-AA-GG). UTC kullanılmaz: gece yarısı Türkiye saatiyle döner.
export function gunAnahtari(t: Date = new Date()) {
  const a = String(t.getMonth() + 1).padStart(2, '0');
  const g = String(t.getDate()).padStart(2, '0');
  return `${t.getFullYear()}-${a}-${g}`;
}

export function gunEkle(t: Date, n: number) {
  const y = new Date(t);
  y.setDate(y.getDate() + n);
  return y;
}

/** Bugün dahil son n günün anahtarları, eskiden yeniye. */
export function sonGunler(n: number, bugun = new Date()) {
  return Array.from({ length: n }, (_, i) => gunAnahtari(gunEkle(bugun, i - (n - 1))));
}

/** Pazartesiden başlayan bu haftanın anahtarları. */
export function buHafta(bugun = new Date()) {
  const fark = (bugun.getDay() + 6) % 7; // pazartesi = 0
  return Array.from({ length: 7 }, (_, i) => gunAnahtari(gunEkle(bugun, i - fark)));
}

export function gunFarki(baslangic: string, bugun = new Date()) {
  const [y, a, g] = baslangic.split('-').map(Number);
  const b = new Date(y, a - 1, g);
  const s = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate());
  return Math.round((s.getTime() - b.getTime()) / 86_400_000);
}

const GUNLER = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

export function uzunTarih(t: Date = new Date()) {
  return `${t.getDate()} ${AYLAR[t.getMonth()]}, ${GUNLER[t.getDay()]}`;
}

export function kisaTarih(anahtar: string) {
  const [, a, g] = anahtar.split('-').map(Number);
  return `${g} ${AYLAR[a - 1].slice(0, 3)}`;
}

export const KISA_GUNLER = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];
