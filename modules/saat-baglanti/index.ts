// Telefon ↔ saat köprüsü. Saat uygulaması yoksa (Expo Go, web, eşleşmiş saat yok) sessizce hiçbir şey yapmaz.
import { requireOptionalNativeModule, type EventSubscription } from 'expo-modules-core';

type Yerel = {
  /** Saate gösterilecek son durumu gönderir (JSON). iOS: applicationContext, Android: DataClient "/durum". */
  durumGonder(json: string): void;
  /** Saatten gelip bekleyen olayları alır ve kuyruğu boşaltır (JSON dizisi). */
  bekleyenleriAl(): string[];
  addListener(ad: 'olay', dinleyici: () => void): EventSubscription;
};

const yerel = requireOptionalNativeModule<Yerel>('SaatBaglanti');

export const saatVar = !!yerel;

export function durumGonder(json: string) {
  try {
    yerel?.durumGonder(json);
  } catch {
    // Saat eşleşmemiş ya da uygulama kurulu değil: telefon tarafı etkilenmez.
  }
}

export function bekleyenleriAl(): string[] {
  try {
    return yerel?.bekleyenleriAl() ?? [];
  } catch {
    return [];
  }
}

/** Saatten yeni olay gelince çağrılır (olayları `bekleyenleriAl` ile oku). */
export function olayDinle(dinleyici: () => void): { remove(): void } {
  return yerel ? yerel.addListener('olay', dinleyici) : { remove() {} };
}
