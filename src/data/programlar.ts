// Programlar: kısa "birlikte yap" seansları, uzun (30 gün) programlar ve rehberler.
// Sesli anonslar şimdilik telefonun Türkçe sesiyle okunur; Oğuz'un ses kayıtları gelince
// her cümlenin MP3'ü `ses` alanına bağlanacak.
import { aksamEsneme, hiit7, kalisteniksTemel, kolGogus, sirtDurus, tamVucut10 } from './seanslar';

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
  hareket?: { id: string; ad: string }; // uzun programın tek hareketi (sayaç ve görseller için)
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

// 30 günlük program: her gün hedef `artis` kadar artar, her 4. gün dinlenme.
function artanGunler(baslangic: number, artis: number, birim: UzunGun['birim']): UzunGun[] {
  const gunler: UzunGun[] = [];
  let hedef = baslangic;
  for (let g = 1; g <= 30; g++) {
    if (g % 4 === 0) {
      gunler.push({ gun: g, hedef: 0, birim, dinlenme: true });
      continue;
    }
    gunler.push({ gun: g, hedef, birim });
    hedef += artis; // gün içinde setlere bölünebilir
  }
  return gunler;
}

const karin4: Seans = {
  dinlenme: 10,
  giris:
    'Dört dakika boyunca sadece karnına odaklanıyoruz. Altı hareket, her biri otuz saniye. Hız değil kontrol istiyorum; yavaş yap, nefesini tutma.',
  kapanis: 'Bitti. Karnın yanıyorsa doğru yaptın. Yarın tekrar.',
  hareketler: [
    {
      id: 'plank',
      ad: 'Plank',
      sure: 30,
      onAnons: 'İlk hareket plank; dirseklerin omuzlarının altında, vücudun baştan topuğa düz bir çizgi.',
      ortaAnons: 'Karnını göbeğini omurgana çeker gibi sık, kalçan düşmesin.',
    },
    {
      id: 'mekik',
      ad: 'Mekik',
      sure: 30,
      onAnons: 'Sırtüstü uzan, sırada mekik; kollar göğüste, omuzlarını yerden yavaşça kaldırıyoruz.',
      ortaAnons: 'Çeneni göğsüne gömme, boynun rahat, işi karnın yapsın.',
    },
    {
      id: 'kopru',
      ad: 'Köprü',
      sure: 30,
      onAnons: 'Şimdi köprü; belini korumak için karnın kadar kalçan da güçlü olmalı.',
      ortaAnons: 'Yukarıda bir saniye dur, karnını bırakma.',
    },
    {
      id: 'diz-cekme',
      ad: 'Yerinde diz çekme',
      sure: 30,
      onAnons: 'Ayağa kalk, yerinde diz çekiyoruz; her dizi karnına doğru getir ve karnını sık.',
      ortaAnons: 'Dik dur, geriye yaslanma; dizler göbek hizasına kadar.',
    },
    {
      id: 'plank',
      ad: 'Plank',
      sure: 30,
      onAnons: 'Tekrar plank; bu sefer ilkinden daha sıkı tut, yorgunluk normal.',
      ortaAnons: 'Titremek güçlendiğin anlamına gelir, kalçanı yukarı kaldırıp kaçma.',
    },
    {
      id: 'mekik',
      ad: 'Mekik',
      sure: 30,
      onAnons: 'Son hareket mekik; ne kaldıysa buraya bırakıyoruz.',
      ortaAnons: 'Yavaş in, yavaş kalk. Son saniyeler.',
    },
  ],
};

const bacak6: Seans = {
  dinlenme: 10,
  giris:
    'Altı dakikalık bacak ve kalça seansı. Önce kısa bir ısınma, sonra squat, hamle ve köprüyle iki tur. Dizlerini koru, hareketi tam yap.',
  kapanis: 'Bitti. Merdivenleri yarın hissedeceksin; bu iyi bir şey.',
  hareketler: [
    {
      id: 'kol-cevirme',
      ad: 'Yerinde yürüyüş + kol çevirme',
      sure: 30,
      onAnons: 'Isınarak başlıyoruz; yerinde yürü, kollarını büyük daireler çizerek çevir.',
      ortaAnons: 'Dizlerini biraz daha yukarı kaldır, vücudun ısınsın.',
    },
    {
      id: 'squat',
      ad: 'Squat',
      sure: 40,
      onAnons: 'İlk tur squat ile başlıyor; ayaklar omuz genişliğinde, kalçayı geriye gönder.',
      ortaAnons: 'Topuklar yerde kalsın, aşağıda göğsün dik.',
    },
    {
      id: 'hamle',
      ad: 'Hamle',
      sure: 40,
      onAnons: 'Sırada hamle; öne adım at, arka dizini yere doğru indir, bacak değiştir.',
      ortaAnons: 'Gövden dik, öndeki diz ayak bileğinin üstünde.',
    },
    {
      id: 'kopru',
      ad: 'Köprü',
      sure: 40,
      onAnons: 'Sırtüstü uzan, köprü; kalçanı kaldır ve yukarıda sık.',
      ortaAnons: 'Topuklarından it, belini değil kalçanı kullan.',
    },
    {
      id: 'squat',
      ad: 'Squat',
      sure: 40,
      onAnons: 'İkinci tur; yine squat, bu sefer biraz daha derine inmeyi dene.',
      ortaAnons: 'Yorulunca hızlanma, tempo aynı kalsın.',
    },
    {
      id: 'hamle',
      ad: 'Hamle',
      sure: 40,
      onAnons: 'Hamle tekrar; dengen kaçarsa bir elini duvara koyabilirsin.',
      ortaAnons: 'Her adımda arka diz yere yaklaşsın, acele yok.',
    },
    {
      id: 'diz-cekme',
      ad: 'Yerinde diz çekme',
      sure: 30,
      onAnons: 'Son hareket yerinde diz çekme; kalan enerjini buraya bırak.',
      ortaAnons: 'Son saniyeler, bırakma.',
    },
  ],
};

const masa3: Seans = {
  dinlenme: 8,
  giris:
    'Uzun süre oturduysan bu üç dakika senin için. Yere inmiyoruz, ayakta yapıyoruz; ofiste, evde, her yerde olur.',
  kapanis: 'Bitti. Kan dolaşımın açıldı, şimdi işine daha dinç dönebilirsin.',
  hareketler: [
    {
      id: 'kol-cevirme',
      ad: 'Yerinde yürüyüş + kol çevirme',
      sure: 30,
      onAnons: 'Kalk ve yerinde yürü; kollarını büyük daireler çizerek çevir, omuzların açılsın.',
      ortaAnons: 'Omuzlarını kulaklarından uzaklaştır, göğsün açık.',
    },
    {
      id: 'squat',
      ad: 'Squat',
      sure: 30,
      onAnons: 'Squat; sandalyeye oturur gibi in, sandalyeye değmeden kalk.',
      ortaAnons: 'Yavaş in, hızlı kalk.',
    },
    {
      id: 'hamle',
      ad: 'Hamle',
      sure: 30,
      onAnons: 'Hamle; öne adım at, bacak değiştir. Oturmaktan kısalan kalça kasları açılsın.',
      ortaAnons: 'Gövden dik kalsın, öne eğilme.',
    },
    {
      id: 'diz-cekme',
      ad: 'Yerinde diz çekme',
      sure: 30,
      onAnons: 'Yerinde diz çekme; nabzını biraz yükseltiyoruz.',
      ortaAnons: 'Kollarını da kullan, nefes al ver.',
    },
    {
      id: 'kol-cevirme',
      ad: 'Yerinde yürüyüş + kol çevirme',
      sure: 30,
      onAnons: 'Son olarak sakinleşiyoruz; yerinde yürü, kolları bu sefer ters yöne çevir.',
      ortaAnons: 'Derin bir nefes al, yavaşça ver.',
    },
  ],
};

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
    id: 'karin-4',
    tur: 'kisa',
    ad: 'Karın 4 dakika',
    altBaslik: 'Plank, mekik, köprü',
    sure: '4 dk',
    seviye: 'Başlangıç',
    seans: karin4,
    kapak: 'mekik',
  },
  {
    id: 'bacak-6',
    tur: 'kisa',
    ad: 'Bacak ve kalça',
    altBaslik: 'Squat, hamle, köprü · iki tur',
    sure: '6 dk',
    seviye: 'Orta',
    seans: bacak6,
    kapak: 'hamle',
  },
  {
    id: 'masa-basi-3',
    tur: 'kisa',
    ad: 'Masa başı mola',
    altBaslik: 'Ayakta, yere inmeden',
    sure: '3 dk',
    seviye: 'Başlangıç',
    seans: masa3,
    kapak: 'kol-cevirme',
  },
  {
    id: 'tam-vucut-10',
    tur: 'kisa',
    ad: 'Tam vücut 10 dakika',
    altBaslik: 'İki tur, baştan ayağa',
    sure: '10 dk',
    seviye: 'Orta',
    seans: tamVucut10,
    kapak: 'dagci',
  },
  {
    id: 'hiit-7',
    tur: 'kisa',
    ad: 'Yağ yakıcı 7 dakika',
    altBaslik: 'Yüksek tempo, kısa mola',
    sure: '7 dk',
    seviye: 'Orta',
    seans: hiit7,
    kapak: 'burpee',
  },
  {
    id: 'kol-gogus-6',
    tur: 'kisa',
    ad: 'Kol ve göğüs',
    altBaslik: 'Şınav, dips, omuz şınavı',
    sure: '6 dk',
    seviye: 'Orta',
    seans: kolGogus,
    kapak: 'sandalye-dips',
  },
  {
    id: 'sirt-durus-5',
    tur: 'kisa',
    ad: 'Sırt ve duruş',
    altBaslik: 'Telefona eğilen boyun için',
    sure: '5 dk',
    seviye: 'Başlangıç',
    seans: sirtDurus,
    kapak: 'superman',
  },
  {
    id: 'aksam-esneme',
    tur: 'kisa',
    ad: 'Akşam esneme',
    altBaslik: 'Uyumadan önce gevşe',
    sure: '5 dk',
    seviye: 'Herkes',
    seans: aksamEsneme,
    kapak: 'cocuk-pozu',
  },
  {
    id: 'kalisteniks-baslangic',
    tur: 'kisa',
    ad: 'Kalisteniks temel',
    altBaslik: 'İtiş, çekiş, bacak, karın',
    sure: '9 dk',
    seviye: 'Orta',
    seans: kalisteniksTemel,
    kapak: 'barfiks',
  },
  {
    id: 'sinav-30',
    tur: 'uzun',
    ad: '30 gün şınav',
    altBaslik: 'Her gün biraz daha fazla',
    sure: '30 gün',
    seviye: 'Herkes',
    gunler: artanGunler(10, 2, 'tekrar'), // 10 → 54
    kapak: 'sinav',
    hareket: { id: 'sinav', ad: 'şınav' },
  },
  {
    id: 'plank-30',
    tur: 'uzun',
    ad: '30 gün plank',
    altBaslik: '20 saniyeden iki dakikaya',
    sure: '30 gün',
    seviye: 'Herkes',
    gunler: artanGunler(20, 4, 'sn'), // 20 → 108 sn
    kapak: 'plank',
    hareket: { id: 'plank', ad: 'plank' },
  },
  {
    id: 'squat-30',
    tur: 'uzun',
    ad: '30 gün squat',
    altBaslik: 'Güçlü bacaklar, sağlam dizler',
    sure: '30 gün',
    seviye: 'Herkes',
    gunler: artanGunler(20, 3, 'tekrar'), // 20 → 86
    kapak: 'squat',
    hareket: { id: 'squat', ad: 'squat' },
  },
  {
    id: 'duvar-30',
    tur: 'uzun',
    ad: '30 gün duvar oturuşu',
    altBaslik: 'Sandalyesiz oturmayı öğren',
    sure: '30 gün',
    seviye: 'Herkes',
    gunler: artanGunler(20, 4, 'sn'), // 20 → 108 sn
    kapak: 'duvar-oturusu',
    hareket: { id: 'duvar-oturusu', ad: 'duvar oturuşu' },
  },
  {
    id: 'disiplin-rehberi',
    tur: 'rehber',
    ad: 'Disiplin nasıl kurulur',
    altBaslik: 'Motivasyon bitince ne yapmalı',
    sure: '6 bölüm',
    seviye: 'Herkes',
    bolumler: [
      {
        baslik: 'Motivasyonu bekleme',
        metin: 'Motivasyon gelir ve gider. Disiplin, canın istemediği gün de yapmaktır. O yüzden işi isteğe değil saate bağla: "Kahvaltıdan önce 5 dakika" gibi.',
      },
      {
        baslik: 'Küçük başla',
        metin: 'İlk hafta hedefin gülünç derecede kolay olsun: 5 şınav, 2 sayfa, 5 dakika. Amaç güçlenmek değil, her gün gelmek. Gelmeyi öğrenince miktarı artırırsın.',
      },
      {
        baslik: 'Küçük hâli de sayılır',
        metin: 'Zor günde hiç yapmamak yerine küçük hâlini yap. 30 şınav yerine 5 şınav, zinciri korur. Bu uygulamada basılı tutunca küçük hâli işaretlenir; o gün de disiplin günüdür.',
      },
      {
        baslik: 'İki gün üst üste kaçırma',
        metin: 'Bir gün kaçırmak olur, insanız. Kural şu: ikinci gün asla. Bir kaçırma kaza, iki kaçırma yeni bir alışkanlığın başlangıcıdır.',
      },
      {
        baslik: 'Ortamı hazırla',
        metin: 'Spor kıyafetini akşamdan çıkar, telefonu yatağın uzağına koy, su şişesini masada tut. İrade kası yorulur; ortam yorulmaz.',
      },
      {
        baslik: 'Kimliğini değiştir',
        metin: '"Spor yapmaya çalışıyorum" deme, "Ben her gün hareket eden biriyim" de. Her işaretlediğin kare bu kimliğe atılmış bir oy. Disiplin günü sayacın da bu yüzden hiç sıfırlanmaz.',
      },
    ],
  },
  {
    id: 'beslenme-temelleri',
    tur: 'rehber',
    ad: 'Beslenme temelleri',
    altBaslik: 'Diyet değil, düzen',
    sure: '6 bölüm',
    seviye: 'Herkes',
    bolumler: [
      { baslik: 'Kalori açığı', metin: 'Kilo vermek için harcadığından biraz az yemen gerekir. Günde 300–500 kalori açık yeterli; daha fazlası kas kaybettirir ve sürdürülemez.' },
      { baslik: 'Protein', metin: 'Her öğünde bir avuç protein olsun: yumurta, tavuk, balık, yoğurt, mercimek. Kilogram başına yaklaşık 1,6 gram hem kası korur hem tok tutar.' },
      { baslik: 'Su', metin: 'Güne bir bardak suyla başla. Açlık sandığın şey çoğu zaman susuzluktur. İdrarın açık renkteyse yeterince içiyorsun.' },
      { baslik: 'Tabak kuralı', metin: 'Tabağın yarısı sebze, çeyreği protein, çeyreği pilav, makarna ya da ekmek. Saymadan da dengeli yersin.' },
      { baslik: 'Şeker ve paketli yiyecek', metin: 'Yasaklama, azalt. Şekerli içeceği önce yarıya indir, sonra haftada bire. İçecekteki kalori tok tutmaz.' },
      { baslik: '%80 kuralı', metin: 'Haftanın büyük kısmında düzgün ye, bir iki öğün serbest olsun. Mükemmel değil, sürdürülebilir olan kazanır.' },
    ],
  },
  {
    id: 'uyku-toparlanma',
    tur: 'rehber',
    ad: 'Uyku ve toparlanma',
    altBaslik: 'Kas antrenmanda değil, uykuda büyür',
    sure: '5 bölüm',
    seviye: 'Herkes',
    bolumler: [
      { baslik: 'Neden önemli', metin: 'Antrenman kası yorar, uyku onarır. 7–9 saat uyumayan biri aynı antrenmandan yarı sonuç alır; iştahı da artar.' },
      { baslik: 'Aynı saat', metin: 'Her gün aynı saatte yat ve kalk, hafta sonu da. Vücut saati düzene girince uykuya dalmak kolaylaşır.' },
      { baslik: 'Ekransız son yarım saat', metin: 'Yatmadan 30 dakika önce telefonu bırak. Bunun yerine Akşam esneme programını yap ya da kitap oku.' },
      { baslik: 'Dinlenme günü', metin: 'Programlardaki dinlenme günlerini atlama. Dinlenmek pes etmek değil, planın parçası. O gün yürüyüş yapabilirsin.' },
      { baslik: 'Ağrı mı, sakatlık mı', metin: 'Ertesi gün yayılan kas ağrısı normaldir, geçer. Keskin, tek noktada ya da eklemde ağrı varsa dur ve dinlen; geçmezse doktora git.' },
    ],
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
