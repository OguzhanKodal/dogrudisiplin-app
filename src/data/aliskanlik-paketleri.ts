// Hazır alışkanlık paketleri. Her alışkanlığın bir "küçük hâli" var: zor günde onu yapan da sayılır.
export type HazirAliskanlik = { ad: string; kucuk: string; simge: string; program?: string };

export const PAKETLER: { id: string; ad: string; aciklama: string; aliskanliklar: HazirAliskanlik[] }[] = [
  {
    id: 'sabah',
    ad: 'Sabah rutini',
    aciklama: 'Güne kendin başla, telefon değil.',
    aliskanliklar: [
      { ad: 'İlk 1 saat telefonsuz', kucuk: 'İlk 10 dakika telefonsuz', simge: '📵' },
      { ad: 'Sabah 5 dakika antrenman', kucuk: '10 şınav', simge: '💪', program: 'sabah-5' },
      { ad: '1 bardak su', kucuk: 'Yarım bardak su', simge: '💧' },
    ],
  },
  {
    id: 'zihin',
    ad: 'Zihin',
    aciklama: 'Her gün biraz okumak, biraz susmak.',
    aliskanliklar: [
      { ad: '10 sayfa oku', kucuk: '1 sayfa oku', simge: '📖' },
      { ad: '5 dakika sessiz otur', kucuk: '1 dakika nefes', simge: '🧘' },
      { ad: 'Günün 3 notu', kucuk: '1 cümle yaz', simge: '✍️' },
    ],
  },
  {
    id: 'uyku',
    ad: 'Uyku',
    aciklama: 'Disiplin akşamdan başlar.',
    aliskanliklar: [
      { ad: 'Yatakta ekran yok', kucuk: 'Son 10 dakika ekransız', simge: '🌙' },
      { ad: '23:00 öncesi yat', kucuk: '23:30 öncesi yat', simge: '🛏️' },
    ],
  },
  {
    id: 'dd-30',
    ad: 'Doğru Disiplin 30',
    aciklama: 'Sayfadaki 30 günlük meydan okuma.',
    aliskanliklar: [
      { ad: 'Günlük şınav hedefi', kucuk: '10 şınav', simge: '🔥', program: 'sinav-30' },
      { ad: '8.000 adım', kucuk: '15 dakika yürüyüş', simge: '👟' },
      { ad: 'Şekersiz gün', kucuk: 'Tatlı yok, içecek serbest', simge: '🚫' },
    ],
  },
];
