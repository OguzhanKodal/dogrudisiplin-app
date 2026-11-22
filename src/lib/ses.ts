// Sesli anons. Şimdilik telefonun Türkçe sesi okur (expo-speech).
// Oğuz'un ElevenLabs kayıtları gelince cümle başına MP3 çalınacak (expo-audio); arayüz aynı kalır.
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { useVeri } from '@/store';

export function konus(metin: string) {
  if (!useVeri.getState().sesAcik) return;
  Speech.stop();
  Speech.speak(metin, { language: 'tr-TR', rate: 1.0 });
}

export function sus() {
  Speech.stop();
}

/** Son 3 saniye: titreşim. */
export function tik(guclu = false) {
  Haptics.impactAsync(guclu ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function basari() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
