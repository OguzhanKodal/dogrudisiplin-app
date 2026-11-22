// Açılış ekranında her gün değişen disiplin sözü.
export const SOZLER: { metin: string; kim?: string }[] = [
  { metin: 'Motivasyon geçer, disiplin kalır.', kim: 'Doğru Disiplin' },
  { metin: 'Canın istemediği gün yaptığın antrenman, en çok sayılanıdır.' },
  { metin: 'Bugün küçük yap ama bugün yap.' },
  { metin: 'Bir gün kaçırmak seni bitirmez. İki gün kaçırmak alışkanlık başlatır.' },
  { metin: 'Disiplin, istediğin şeyle şu an istediğin şey arasında seçim yapmaktır.' },
  { metin: 'Yavaş ilerlemek, hiç ilerlememekten iyidir.' },
  { metin: 'Kendine verdiğin sözü tut. Kimse görmese bile.' },
  { metin: 'Zor kısım başlamak. Gerisi sadece devam etmek.' },
  { metin: 'Bugünkü sen, yarınki senin temelini atıyor.' },
  { metin: 'Bahane de sonuç da senin. Hangisini seçeceğine sen karar verirsin.' },
];

export function gununSozu(tarih = new Date()) {
  const gun = Math.floor(tarih.getTime() / 86_400_000);
  return SOZLER[gun % SOZLER.length];
}
