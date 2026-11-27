// Ek "birlikte yap" seansları. Hareket id'leri hareket-gorseli.tsx'teki çizimlerle eşleşir.
import type { Hareket, Seans } from './programlar';

const h = (id: string, ad: string, sure: number, onAnons: string, ortaAnons?: string): Hareket => ({
  id,
  ad,
  sure,
  onAnons,
  ortaAnons,
});

const AD = {
  yildiz: 'Yıldız zıplama',
  dagci: 'Dağcı',
  burpee: 'Burpee',
  superman: 'Süpermen',
  dips: 'Sandalye dips',
  kediInek: 'Kedi-inek',
  arkaBacak: 'Arka bacak esnetme',
  barfiks: 'Barfiks',
  dizdeSinav: 'Dizde şınav',
  omuzSinavi: 'Omuz şınavı',
  yanPlank: 'Yan plank',
  duvar: 'Duvar oturuşu',
  cocuk: 'Çocuk pozu',
  squat: 'Squat',
  sinav: 'Şınav',
  hamle: 'Hamle',
  plank: 'Plank',
  kopru: 'Köprü',
  mekik: 'Mekik',
  diz: 'Yerinde diz çekme',
  kol: 'Yerinde yürüyüş + kol çevirme',
};

export const tamVucut10: Seans = {
  dinlenme: 12,
  giris:
    'On dakikada bütün vücudu çalıştırıyoruz. Dört hareket, iki tur, araya biraz kardiyo. Zorlanırsan hızını düşür ama durma.',
  kapanis: 'Bitti. On dakika, iki tur, bütün vücut. Bugün kendine gerçekten bir şey kattın.',
  hareketler: [
    h('yildiz-ziplama', AD.yildiz, 40, 'Isınmayla başlıyoruz; yıldız zıplama, kollar yukarı, ayaklar açılıp kapanıyor.', 'Ayak uçlarına yumuşak bas, dizlerini kilitleme.'),
    h('squat', AD.squat, 40, 'Birinci tur squat ile açılıyor; kalça geriye, göğüs dik.', 'Topuklarından it, dizler ayak parmaklarıyla aynı yöne baksın.'),
    h('sinav', AD.sinav, 40, 'Şınav; zorlanırsan dizlerini yere koy, form her şeyden önemli.', 'Dirseklerin gövdene çok açılmasın, kırk beş derece yeterli.'),
    h('dagci', AD.dagci, 40, 'Dağcı; şınav pozisyonunda dizleri sırayla göğse çekiyoruz.', 'Kalçan yukarı fırlamasın, omuzların bileklerinin üstünde.'),
    h('hamle', AD.hamle, 40, 'Hamle; öne adım, arka diz yere yaklaşır, bacak değiştir.', 'Gövden dik, adımın yeterince uzun olsun.'),
    h('plank', AD.plank, 40, 'Birinci turun sonu plank; kıpırdamadan tut.', 'Karnını sık, nefesini tutma.'),
    h('burpee', AD.burpee, 30, 'Ortadayız, burpee zamanı; çömel, ellerin yere, kalk ve zıpla.', 'Kendi hızında yap, her tekrar sayılır.'),
    h('squat', AD.squat, 40, 'İkinci tur; yine squat, ilk turdaki kadar derin.', 'Yorulunca bile tempoyu koru.'),
    h('sinav', AD.sinav, 40, 'Şınav tekrar; dizde yapmak da tam sayılır.', 'Vücudun tek tahta gibi kalsın.'),
    h('dagci', AD.dagci, 40, 'Dağcı tekrar; bu sefer biraz daha hızlı.', 'Nefes al ver, ritmi bulursan kolaylaşır.'),
    h('hamle', AD.hamle, 40, 'Hamle; son bacak hareketi bu.', 'Dengen kaçarsa yavaşla, sorun değil.'),
    h('plank', AD.plank, 40, 'Ve son hareket plank; ne kaldıysa buraya bırak.', 'Son saniyeler, bırakma.'),
  ],
};

export const hiit7: Seans = {
  dinlenme: 15,
  giris:
    'Yedi dakikalık yüksek tempolu seans. Kırk saniye bütün gücünle, sonra kısa mola. Nabzın yükselecek; amaç da bu.',
  kapanis: 'Bitti. Nefesini topla, su iç. Bu yedi dakika bir saatlik yürüyüşün işini gördü.',
  hareketler: [
    h('yildiz-ziplama', AD.yildiz, 40, 'Yıldız zıplamayla nabzı yükseltiyoruz.', 'Kolları sonuna kadar yukarı aç.'),
    h('dagci', AD.dagci, 40, 'Dağcı; şınav pozisyonunda dizler göğse, hızlı.', 'Omuzlar sabit, işi bacaklar yapsın.'),
    h('squat', AD.squat, 40, 'Squat; hızlı ama derin.', 'Göğüs dik, aşağıda bir an bile oturma.'),
    h('burpee', AD.burpee, 40, 'Burpee; en zor hareket, en çok yakan hareket.', 'Zıplamayı küçültebilirsin, durmamak önemli.'),
    h('diz-cekme', AD.diz, 40, 'Yerinde diz çekme; koşar gibi, dizler göbek hizasına.', 'Kollarını da çalıştır, tempo düşmesin.'),
    h('hamle', AD.hamle, 40, 'Hamle; bacak değiştirerek, kontrollü.', 'Ön diz ayak bileğinin üstünde.'),
    h('dagci', AD.dagci, 40, 'Son hareket dağcı; kalan her şeyi buraya ver.', 'Son saniyeler, bırakma.'),
  ],
};

export const aksamEsneme: Seans = {
  dinlenme: 8,
  giris:
    'Gün bitti, şimdi gevşiyoruz. Altı dakika yavaş esneme. Zorlamak yok; nefes al, ver ve vücudunun bırakmasına izin ver.',
  kapanis: 'Bitti. Şimdi telefonu bırak ve dinlen. Yarın yine buradayız.',
  hareketler: [
    h('kedi-inek', AD.kediInek, 45, 'Dizlerin ve ellerin yerde; nefes alırken sırtını çukurlaştır, verirken yuvarla.', 'Hareketi nefesine bağla, acele etme.'),
    h('cocuk-pozu', AD.cocuk, 45, 'Çocuk pozu; kalçanı topuklarına götür, kollarını öne uzat.', 'Her nefes verişte biraz daha bırak.'),
    h('arka-bacak-esneme', AD.arkaBacak, 45, 'Ayağa kalk; kalçadan öne eğil, ellerini ayaklarına doğru uzat.', 'Dizlerini hafif bükebilirsin, sırtın gergin olmasın.'),
    h('kopru', AD.kopru, 40, 'Sırtüstü köprü; kalçayı yavaşça kaldır, yavaşça indir.', 'Yukarıda iki saniye dur, kalçanı sık.'),
    h('superman', AD.superman, 30, 'Yüzüstü süpermen; kolları ve bacakları hafifçe kaldır.', 'Boynunu uzat, yukarı bakma, yere bak.'),
    h('cocuk-pozu', AD.cocuk, 45, 'Son olarak tekrar çocuk pozu; gözlerini kapat ve sadece nefes al.', 'Omuzların kulaklarından uzak, alnın yerde.'),
  ],
};

export const sirtDurus: Seans = {
  dinlenme: 10,
  giris:
    'Bütün gün eğilip telefona bakıyoruz. Bu beş dakika sırtın ve duruşun için. Yavaş ve kontrollü yapacağız.',
  kapanis: 'Bitti. Şimdi dik dur, omuzlarını geriye al. Bunu gün içinde de hatırla.',
  hareketler: [
    h('kedi-inek', AD.kediInek, 40, 'Kedi-inek ile omurgayı ısıtıyoruz.', 'Omurgayı tek tek boğum boğum hareket ettirdiğini düşün.'),
    h('superman', AD.superman, 35, 'Süpermen; kollar ve bacaklar yerden kalkar, bir saniye tutarsın.', 'Kalçanı sık, beli değil sırtın tamamını kullan.'),
    h('kopru', AD.kopru, 40, 'Köprü; güçlü kalça, sağlıklı bel demek.', 'Topuklarından it, kaburgalarını aşağıda tut.'),
    h('plank', AD.plank, 35, 'Plank; karın kasları sırtın korsesidir.', 'Kalçan düz bir çizgide, ne yukarıda ne aşağıda.'),
    h('superman', AD.superman, 35, 'Tekrar süpermen; bu sefer yukarıda iki saniye kal.', 'Yere bak, boynunu zorlama.'),
    h('cocuk-pozu', AD.cocuk, 40, 'Son olarak çocuk pozu; sırtını uzat ve gevşe.', 'Kollarını öne doğru biraz daha uzat.'),
  ],
};

export const kolGogus: Seans = {
  dinlenme: 12,
  giris:
    'Altı dakika üst vücut: göğüs, omuz ve kollar. Kolaydan zora gidiyoruz. Bir hareket ağır gelirse bir öncekine dön, yine sayılır.',
  kapanis: 'Bitti. Kolların yanıyorsa doğru yaptın. Kaslar dinlenirken büyür; yarın dinlen ya da bacak çalış.',
  hareketler: [
    h('kol-cevirme', AD.kol, 30, 'Omuzları ısıtıyoruz; kolları büyük daireler çizerek çevir.', 'Önce ileri, sonra geri çevir.'),
    h('dizde-sinav', AD.dizdeSinav, 40, 'Dizde şınav; dizlerden başa düz bir çizgi.', 'Göğsünü yere yaklaştır, sonra güçlü it.'),
    h('sandalye-dips', AD.dips, 35, 'Sandalye dips; ellerin sandalyenin kenarında, dirsekleri geriye bükerek in.', 'Omuzlarını kulaklarına doğru kaldırma.'),
    h('sinav', AD.sinav, 35, 'Şimdi tam şınav; olmazsa dizlerine geç.', 'Yavaş in, hızlı kalk.'),
    h('omuz-sinavi', AD.omuzSinavi, 35, 'Omuz şınavı; kalça yukarıda, ters V gibi, başını ellerinin arasına indir.', 'Ağırlık omuzlarda, bacaklar sadece destek.'),
    h('sandalye-dips', AD.dips, 35, 'Tekrar dips; son kol hareketi bu.', 'Dirsekler geriye baksın, yana açılmasın.'),
    h('plank', AD.plank, 40, 'Plank ile bitiriyoruz; her şeyi bir arada tut.', 'Son saniyeler, karnını sık.'),
  ],
};

export const kalisteniksTemel: Seans = {
  dinlenme: 15,
  giris:
    'Kalisteniksin temeli: kendi ağırlığını taşımak. Dokuz dakikada itiş, çekiş, bacak ve karın. Bar yoksa barfiks yerine sağlam bir masanın altında çekiş yap ya da süpermen yap.',
  kapanis: 'Bitti. Bu hareketleri her hafta biraz daha iyi yapacaksın. Kalisteniks sabır işidir.',
  hareketler: [
    h('yildiz-ziplama', AD.yildiz, 40, 'Isınma; yıldız zıplama.', 'Eklemlerin ısınsın, acele yok.'),
    h('dizde-sinav', AD.dizdeSinav, 40, 'İtişle başlıyoruz; dizde şınav, kusursuz form.', 'Dirsekler kırk beş derece.'),
    h('barfiks', AD.barfiks, 30, 'Barfiks; bara tutun, çeneni barın üstüne çek. Olmuyorsa sadece asılı dur, o da güçlendirir.', 'Omuzlarını aşağı çek, sallanma.'),
    h('squat', AD.squat, 45, 'Bacak; squat, tam derinlik.', 'Aşağıda göğüs dik.'),
    h('omuz-sinavi', AD.omuzSinavi, 35, 'Omuz şınavı; amuda giden yolun ilk adımı.', 'Başın ellerinin önüne insin, üçgen gibi.'),
    h('barfiks', AD.barfiks, 30, 'Tekrar barfiks; kaç tane olursa.', 'Yukarıda bir saniye dur, yavaş in.'),
    h('sandalye-dips', AD.dips, 35, 'Dips; kolların arkası çalışıyor.', 'Göğsün açık, omuzlar geride.'),
    h('hamle', AD.hamle, 40, 'Hamle; tek bacak gücü.', 'Kontrollü in, güçlü kalk.'),
    h('yan-plank', AD.yanPlank, 30, 'Yan plank; sağ tarafla başla, yarısında taraf değiştir.', 'Kalçan düşmesin, vücudun dümdüz.'),
    h('plank', AD.plank, 40, 'Ve plank ile bitiriyoruz.', 'Son saniyeler.'),
  ],
};
