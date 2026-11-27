import Foundation
import WatchConnectivity
import WidgetKit

// Telefonla aynı sözleşme (src/lib/saat.ts → SaatDurumu, v: 1).
struct SaatDurumu: Codable, Equatable {
  var v: Int
  var gun: String
  var disiplinGunu: Int
  var bugunSayildi: Bool
  var aliskanliklar: [Aliskanlik]
  var programlar: [Program]
}

struct Aliskanlik: Codable, Equatable, Identifiable {
  let id: String
  let ad: String
  let kucuk: String
  let simge: String
  var isaret: String?  // "tam" | "kucuk" | nil
}

struct Program: Codable, Equatable, Identifiable, Hashable {
  let id: String
  let ad: String
  let sure: String
  let dinlenme: Int
  let hareketler: [Hareket]
}

struct Hareket: Codable, Equatable, Hashable {
  let id: String
  let ad: String
  let sure: Int
}

enum Gun {
  static func bugun(_ t: Date = Date()) -> String {
    let c = Calendar.current.dateComponents([.year, .month, .day], from: t)
    return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
  }
}

/// Saattaki tek veri kaynağı. Telefondan son durumu alır, App Group'a yazar (komplikasyon okur),
/// saatte yapılan işaretleri hemen gösterir ve telefona olay olarak yollar.
@MainActor
final class Depo: NSObject, ObservableObject {
  static let shared = Depo()
  static let grup = "group.com.kodal.dogrudisiplin"
  private let anahtar = "saat-durumu"
  private var ortak: UserDefaults { UserDefaults(suiteName: Depo.grup) ?? .standard }

  @Published private(set) var durum: SaatDurumu?

  override init() {
    super.init()
    if let veri = ortak.data(forKey: anahtar), let d = try? JSONDecoder().decode(SaatDurumu.self, from: veri) {
      durum = Depo.gunuTazele(d)
    }
    #if DEBUG
      // Simülatörde telefon olmadan denemek için: `-ornek` argümanıyla örnek veri.
      if ProcessInfo.processInfo.arguments.contains("-ornek") { durum = Depo.ornek }
    #endif
    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }

  #if DEBUG
    static let ornek = SaatDurumu(
      v: 1, gun: Gun.bugun(), disiplinGunu: 88, bugunSayildi: true,
      aliskanliklar: [
        Aliskanlik(id: "a", ad: "Sabah 5 dakika", kucuk: "1 hareket", simge: "💪", isaret: "tam"),
        Aliskanlik(id: "b", ad: "10 sayfa kitap", kucuk: "1 sayfa", simge: "📖", isaret: "kucuk"),
        Aliskanlik(id: "c", ad: "2 litre su", kucuk: "1 bardak", simge: "💧", isaret: nil),
      ],
      programlar: [
        Program(id: "sabah-5", ad: "Sabah 5 dakika", sure: "5 dk", dinlenme: 8, hareketler: [
          Hareket(id: "squat", ad: "Squat", sure: 25), Hareket(id: "sinav", ad: "Şınav", sure: 25),
        ]),
        Program(id: "karin-4", ad: "Karın 4 dakika", sure: "4 dk", dinlenme: 10, hareketler: [
          Hareket(id: "plank", ad: "Plank", sure: 30),
        ]),
      ])
  #endif

  /// Gün değiştiyse dünkü işaretler bugüne taşınmaz.
  static func gunuTazele(_ d: SaatDurumu) -> SaatDurumu {
    let bugun = Gun.bugun()
    guard d.gun != bugun else { return d }
    var y = d
    y.gun = bugun
    y.bugunSayildi = false
    y.aliskanliklar = d.aliskanliklar.map { var a = $0; a.isaret = nil; return a }
    return y
  }

  var yapilanSayisi: Int { durum?.aliskanliklar.filter { $0.isaret != nil }.count ?? 0 }

  func tazele() {
    if let d = durum { yaz(Depo.gunuTazele(d)) }
  }

  /// nil: geri al, "tam": yaptım, "kucuk": küçük hâlini yaptım.
  func isaretle(_ id: String, _ isaret: String?) {
    guard var d = durum.map(Depo.gunuTazele), let i = d.aliskanliklar.firstIndex(where: { $0.id == id }) else { return }
    d.aliskanliklar[i].isaret = isaret
    // Disiplin günü: bugün ilk kez sayılıyorsa bir artar (telefon gelince kesin değeri yollar).
    let simdi = d.aliskanliklar.contains { $0.isaret != nil }
    if simdi && !d.bugunSayildi { d.disiplinGunu += 1; d.bugunSayildi = true }
    yaz(d)
    gonder(["tur": "isaret", "gun": d.gun, "id": id, "isaret": isaret.map { $0 as Any } ?? NSNull()])
  }

  func antrenmanBitti(_ p: Program, sureSn: Int) {
    if var d = durum.map(Depo.gunuTazele) {
      if !d.bugunSayildi { d.disiplinGunu += 1; d.bugunSayildi = true }
      yaz(d)
    }
    gonder(["tur": "antrenman", "programId": p.id, "tarih": Gun.bugun(), "sureSn": sureSn])
  }

  private func yaz(_ d: SaatDurumu) {
    durum = d
    if let veri = try? JSONEncoder().encode(d) { ortak.set(veri, forKey: anahtar) }
    WidgetCenter.shared.reloadAllTimelines()
  }

  private func gonder(_ olay: [String: Any]) {
    guard let veri = try? JSONSerialization.data(withJSONObject: olay), let json = String(data: veri, encoding: .utf8) else { return }
    // transferUserInfo sıraya girer: telefon uzaktayken de kaybolmaz, bağlanınca teslim edilir.
    WCSession.default.transferUserInfo(["olay": json])
  }

  fileprivate func telefondanGeldi(_ baglam: [String: Any]) {
    guard let json = baglam["durum"] as? String, let veri = json.data(using: .utf8),
      let d = try? JSONDecoder().decode(SaatDurumu.self, from: veri), d.v == 1
    else { return }
    yaz(Depo.gunuTazele(d))
  }
}

extension Depo: WCSessionDelegate {
  nonisolated func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
    let baglam = session.receivedApplicationContext
    guard !baglam.isEmpty else { return }
    Task { @MainActor in self.telefondanGeldi(baglam) }
  }

  nonisolated func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    Task { @MainActor in self.telefondanGeldi(applicationContext) }
  }
}
