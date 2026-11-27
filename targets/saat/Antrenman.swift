import HealthKit
import SwiftUI
import WatchKit

/// Bilekte "birlikte yap": hareket → mola → hareket. Telefon gerekmez.
/// HealthKit antrenman oturumu açılır: ekran kararınca da sayaç ve titreşimler sürer, nabız görünür,
/// antrenman Sağlık'a ve Etkinlik halkalarına yazılır. İzin verilmezse sayaç yine çalışır.
@MainActor
final class AntrenmanOturumu: NSObject, ObservableObject {
  struct Adim { let calis: Bool; let i: Int; let sure: Double }

  let program: Program
  let adimlar: [Adim]
  @Published private(set) var no = 0
  @Published private(set) var kalan: Double = 0
  @Published private(set) var durdu = false
  @Published private(set) var bitti = false
  @Published private(set) var nabiz: Int?

  private var bitis = Date()
  private var sayac: Timer?
  private var sonUyari = 0
  private let baslangic = Date()
  private let saglik = HKHealthStore()
  private var oturum: HKWorkoutSession?
  private var kurucu: HKLiveWorkoutBuilder?

  init(program: Program) {
    self.program = program
    var a = [Adim(calis: false, i: 0, sure: 5)]  // "Hazır ol"
    for (i, h) in program.hareketler.enumerated() {
      a.append(Adim(calis: true, i: i, sure: Double(h.sure)))
      if i < program.hareketler.count - 1 { a.append(Adim(calis: false, i: i + 1, sure: Double(max(program.dinlenme, 5)))) }
    }
    adimlar = a
    super.init()
  }

  var adim: Adim { adimlar[min(no, adimlar.count - 1)] }
  var hareket: Hareket { program.hareketler[adim.i] }

  func baslat() {
    guard sayac == nil, !bitti else { return }
    adimaGec(0)
    sayac = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { [weak self] _ in
      Task { @MainActor in self?.tik() }
    }
    saglikBaslat()
  }

  func duraklatDevam() {
    if durdu { bitis = Date().addingTimeInterval(kalan); durdu = false; oturum?.resume() }
    else { durdu = true; oturum?.pause() }
    WKInterfaceDevice.current().play(.click)
  }

  func atla() { adimaGec(no + 1) }

  func birak() {
    sayac?.invalidate(); sayac = nil
    oturum?.end()
    kurucu?.discardWorkout()
  }

  private func adimaGec(_ n: Int) {
    guard n < adimlar.count else { return tamamla() }
    no = n
    kalan = adim.sure
    bitis = Date().addingTimeInterval(adim.sure)
    sonUyari = Int(adim.sure.rounded(.up))
    if n > 0 { WKInterfaceDevice.current().play(adim.calis ? .start : .stop) }
  }

  private func tik() {
    guard !durdu, !bitti else { return }
    kalan = max(0, bitis.timeIntervalSinceNow)
    let sn = Int(kalan.rounded(.up))
    // Son 3 saniye: hafif tık; ekrana bakmadan geçişi hissettirir.
    if sn < sonUyari { sonUyari = sn; if (1...3).contains(sn) { WKInterfaceDevice.current().play(.click) } }
    if kalan <= 0 { adimaGec(no + 1) }
  }

  private func tamamla() {
    sayac?.invalidate(); sayac = nil
    bitti = true
    WKInterfaceDevice.current().play(.success)
    Depo.shared.antrenmanBitti(program, sureSn: Int(Date().timeIntervalSince(baslangic)))
    guard let oturum, let kurucu else { return }
    oturum.end()
    kurucu.endCollection(withEnd: Date()) { _, _ in kurucu.finishWorkout { _, _ in } }
  }

  // MARK: HealthKit
  private func saglikBaslat() {
    guard HKHealthStore.isHealthDataAvailable() else { return }
    let yaz: Set<HKSampleType> = [HKObjectType.workoutType()]
    let oku: Set<HKObjectType> = [HKQuantityType(.heartRate), HKQuantityType(.activeEnergyBurned)]
    saglik.requestAuthorization(toShare: yaz, read: oku) { [weak self] izin, _ in
      guard izin else { return }
      Task { @MainActor in self?.oturumAc() }
    }
  }

  private func oturumAc() {
    guard !bitti, oturum == nil else { return }
    let ayar = HKWorkoutConfiguration()
    ayar.activityType = program.id.contains("esneme") ? .flexibility : .functionalStrengthTraining
    ayar.locationType = .indoor
    guard let o = try? HKWorkoutSession(healthStore: saglik, configuration: ayar) else { return }
    let k = o.associatedWorkoutBuilder()
    k.dataSource = HKLiveWorkoutDataSource(healthStore: saglik, workoutConfiguration: ayar)
    k.delegate = self
    oturum = o
    kurucu = k
    let simdi = Date()
    o.startActivity(with: simdi)
    k.beginCollection(withStart: simdi) { _, _ in }
  }
}

extension AntrenmanOturumu: HKLiveWorkoutBuilderDelegate {
  nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}

  nonisolated func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
    let tur = HKQuantityType(.heartRate)
    guard collectedTypes.contains(tur),
      let deger = workoutBuilder.statistics(for: tur)?.mostRecentQuantity()?.doubleValue(for: .count().unitDivided(by: .minute()))
    else { return }
    Task { @MainActor in self.nabiz = Int(deger.rounded()) }
  }
}

struct AntrenmanGorunumu: View {
  @StateObject private var o: AntrenmanOturumu
  @Environment(\.dismiss) private var kapat

  init(program: Program) { _o = StateObject(wrappedValue: AntrenmanOturumu(program: program)) }

  var body: some View {
    Group {
      if o.bitti { bitis } else { calisma }
    }
    .navigationBarBackButtonHidden(!o.bitti)
    .containerBackground(Color.gece.gradient, for: .navigation)
    .onAppear { o.baslat() }
  }

  private var calisma: some View {
    let a = o.adim
    let toplam = o.program.hareketler.count
    return VStack(spacing: 4) {
      HStack {
        Text(o.no == 0 ? "Hazır ol" : a.calis ? "Çalış · \(a.i + 1)/\(toplam)" : "Sıradaki · \(a.i + 1)/\(toplam)")
          .font(.caption2.weight(.semibold))
          .foregroundStyle(a.calis ? Color.volt : Color.soluk)
        Spacer()
        if let n = o.nabiz {
          Label("\(n)", systemImage: "heart.fill").font(.caption2).foregroundStyle(.red).labelStyle(.titleAndIcon)
        }
      }
      Text(o.hareket.ad)
        .font(.headline)
        .lineLimit(2)
        .minimumScaleFactor(0.7)
        .frame(maxWidth: .infinity, alignment: .leading)
        .id(o.no)
        .transition(.opacity)

      ZStack {
        Circle().stroke(Color.gece2, lineWidth: 8)
        Circle()
          .trim(from: 0, to: a.sure > 0 ? o.kalan / a.sure : 0)
          .stroke(a.calis ? Color.volt : Color.soluk, style: StrokeStyle(lineWidth: 8, lineCap: .round))
          .rotationEffect(.degrees(-90))
          .animation(.linear(duration: 0.2), value: o.kalan)
        VStack(spacing: 0) {
          Text("\(Int(o.kalan.rounded(.up)))")
            .font(.system(size: 40, weight: .heavy, design: .rounded))
            .monospacedDigit()
          if o.durdu { Text("DURDU").font(.caption2).foregroundStyle(Color.soluk) }
        }
      }
      .contentShape(Circle())
      .onTapGesture { o.duraklatDevam() }
      .accessibilityElement(children: .combine)
      .accessibilityLabel("\(Int(o.kalan.rounded(.up))) saniye kaldı")
      .accessibilityHint(o.durdu ? "Devam etmek için dokun" : "Durdurmak için dokun")
    }
    .padding(.horizontal, 4)
    .toolbar {
      ToolbarItem(placement: .topBarLeading) {
        Button { o.birak(); kapat() } label: { Image(systemName: "xmark").foregroundStyle(Color.gece) }.accessibilityLabel("Antrenmanı bırak")
      }
      ToolbarItem(placement: .topBarTrailing) {
        Button { o.atla() } label: { Image(systemName: "forward.end.fill").foregroundStyle(Color.gece) }.accessibilityLabel("Sonraki adım")
      }
    }
  }

  private var bitis: some View {
    VStack(spacing: 8) {
      IsaretKare(isaret: "tam", boyut: 44)
      Text("Bitti").font(.title2.bold())
      Text("Disiplin günün sayıldı.").font(.footnote).foregroundStyle(Color.soluk)
      Button("Tamam") { kapat() }.tint(.volt)
    }
  }
}
