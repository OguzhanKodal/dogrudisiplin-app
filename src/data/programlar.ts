// Programlar: kısa "birlikte yap" seansları, uzun (30 gün) programlar ve rehberler.
// Sesli anonslar şimdilik telefonun Türkçe sesiyle okunur; Oğuz'un ses kayıtları gelince
// her cümlenin MP3'ü `ses` alanına bağlanacak.

export type Hareket = {
  id: string;
  ad: string;
  sure: number; // çalışma süresi (sn)
  onAnons: string; // dinlenmede okunur: sıradaki hareketi tanıtır
  ortaAnons?: string; // çalışmanın ortasında form ipucu
};

export type Seans = {
  giris: string;
  kapanis: string;
  dinlenme: number;
  hareketler: Hareket[];
};

export type Program = {
  id: string;
  tur: 'kisa' | 'uzun' | 'rehber';
  ad: string;
  altBaslik: string;
  sure: string;
  seviye: 'Başlangıç' | 'Orta' | 'Herkes';
  seans?: Seans; // kısa programlar
  gunler?: UzunGun[]; // uzun programlar
  bolumler?: { baslik: string; metin: string }[]; // rehberler
  yakinda?: boolean;
  kapak?: string; // küçük resim olarak kullanılacak hareket id'si
};

export type UzunGun = { gun: number; hedef: number; birim: 'tekrar' | 'sn'; dinlenme?: boolean };

const sabah5: Seans = {
  dinlenme: 8,
  giris:
    'Her sabah spor yapmak için bir saat ayırmanı beklemiyorum, sadece beş dakika istiyorum. Sekiz hareket yapacağız, her biri yirmi beş saniye. Ben seninle birlikte yapacağım, sen sadece bırakmadan sonuna kadar kal.',
  kapanis: 'Bitti. Beş dakikanı kendine verdin. Yarın aynı saatte yine buradayız.',
  hareketler: [
    {
      id: 'kol-cevirme',
      ad: 'Yerinde yürüyüş + kol çevirme',
      sure: 25,
      onAnons: 'İlk hareketimiz vücudu uyandırmak için, yerinde yürürken kollarımızı büyük daireler çizerek çeviriyoruz.',
      ortaAnons: 'Acele etmiyoruz, omuzların ısındığını hissetmen yeterli.',
    },
    {
      id: 'squat',
      ad: 'Squat',
      sure: 25,
      onAnons: 'Sırada squat var; ayaklar omuz genişliğinde, sandalyeye oturur gibi kalçamızı geriye gönderiyoruz.',
      ortaAnons: 'Dizlerin içeri kaçmasın, ağırlığın topuklarında kalsın, göğsün de dik dursun.',
    },
    {
      id: 'sinav',
      ad: 'Şınav',
      sure: 25,
      onAnons: 'Şimdi şınav; zor geliyorsa dizlerini yere koyabilirsin, bu da tam bir şınav sayılır.',
      ortaAnons: 'Vücudun tek bir tahta gibi dümdüz kalsın, kaç tane yaptığın değil, nasıl yaptığın önemli.',
    },
    {
      id: 'hamle',
      ad: 'Hamle',
      sure: 25,
      onAnons: 'Sıradaki hareket hamle; bir adım öne atıp arkadaki dizimizi yere doğru yavaşça indiriyoruz, sonra bacak değiştiriyoruz.',
      ortaAnons: 'Öndeki dizin ayak parmaklarını geçmesin, dengeni kaybedersen biraz yavaşla, sorun değil.',
    },
    {
      id: 'plank',
      ad: 'Plank',
      sure: 25,
      onAnons: 'Yarıyı geçtik; şimdi plank, dirseklerimizin üstünde duruyoruz ve hiç kıpırdamıyoruz.',
      ortaAnons: 'Kalçan ne yukarı kalksın ne aşağı düşsün, karnını sık ve nefes almayı unutma.',
    },
    {
      id: 'kopru',
      ad: 'Köprü',
      sure: 25,
      onAnons: 'Sırtüstü uzanıyoruz, sırada köprü var; dizler bükük, kalçamızı yukarı kaldırıp bir saniye tutuyoruz.',
      ortaAnons: 'Yukarıdayken kalçanı sık, belinle değil kalçanla kaldırdığını hissetmelisin.',
    },
    {
      id: 'mekik',
      ad: 'Mekik',
      sure: 25,
      onAnons: 'Sondan bir önceki hareket mekik; kollar göğüste, karnımızı sıkarak yavaş yavaş kalkıyoruz.',
      ortaAnons: 'Boynunu çekme, hızlı değil yavaş yap, karnının yandığını hissettiğin an doğru yapıyorsun.',
    },
    {
      id: 'diz-cekme',
      ad: 'Yerinde diz çekme',
      sure: 25,
      onAnons: 'Ve son hareket; yerinde koşar gibi dizlerimizi karnımıza doğru çekiyoruz, kalan ne varsa buraya bırak.',
      ortaAnons: 'Son saniyeler, bu kısım günün geri kalanını değiştiriyor, bırakma.',
    },
  ],
};

// 30 gün şınav: her 3 günde hedef artar, her 4. gün dinlenme. Başlangıç seviyesi kullanıcıya göre ölçeklenir.
function sinav30(): UzunGun[] {
  const gunler: UzunGun[] = [];
  let hedef = 10;
  for (let g = 1; g <= 30; g++) {
    if (g % 4 === 0) {
      gunler.push({ gun: g, hedef: 0, birim: 'tekrar', dinlenme: true });
      continue;
    }
    gunler.push({ gun: g, hedef, birim: 'tekrar' });
    hedef += 2; // 10 → 52; gün içinde setlere bölünebilir
  }
  return gunler;
}

export const PROGRAMLAR: Program[] = [
  {
    id: 'sabah-5',
    tur: 'kisa',
    ad: 'Sabah 5 dakika',
    altBaslik: 'Ekipmansız, birlikte yap',
    sure: '5 dk',
    seviye: 'Başlangıç',
    seans: sabah5,
    kapak: 'squat',
  },
  {
    id: 'sinav-30',
    tur: 'uzun',
    ad: '30 gün şınav',
    altBaslik: 'Her gün biraz daha fazla',
    sure: '30 gün',
    seviye: 'Herkes',
    gunler: sinav30(),
    kapak: 'sinav',
  },
  {
    id: 'kalisteniks-baslangic',
    tur: 'uzun',
    ad: 'Kalisteniks başlangıç',
    altBaslik: 'Şınav, barfiks, squat temelleri',
    sure: '4 hafta',
    seviye: 'Başlangıç',
    yakinda: true,
    kapak: 'plank',
  },
  {
    id: 'yuzme-taktikleri',
    tur: 'rehber',
    ad: 'Yüzme taktikleri',
    altBaslik: 'Havuza girmeden önce oku',
    sure: '6 bölüm',
    seviye: 'Herkes',
    bolumler: [
      { baslik: 'Suda durmak', metin: 'Panik yapma, kollarını yanlara aç ve ayaklarını yavaşça çevir. Nefesini tutma; yavaş ver.' },
      { baslik: 'Nefes', metin: 'Yüzün sudayken burnundan sürekli ver, başını yana çevirdiğinde ağzından al.' },
      { baslik: 'Vücut çizgisi', metin: 'Başını aşağıda tut; baş kalkarsa kalça batar. Göğsünü suya bastır.' },
      { baslik: 'Ayak vuruşu', metin: 'Dizden değil kalçadan vur. Ayak bilekleri gevşek, vuruş küçük ve hızlı.' },
      { baslik: 'Kol çekişi', metin: 'Eli suya ince gir, dirseği yüksek tutup suyu arkana it.' },
      { baslik: 'İlk antrenman', metin: '25 metre yüz, 30 saniye dinlen, 6 kez tekrar et. Süreyi değil düzgünlüğü takip et.' },
    ],
  },
];

export const programBul = (id: string) => PROGRAMLAR.find((p) => p.id === id);
