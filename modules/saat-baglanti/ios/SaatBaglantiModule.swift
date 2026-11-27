import ExpoModulesCore
import WatchConnectivity

/// Telefon tarafı: son durumu saate `applicationContext` ile yollar (saat açılınca en sonuncusunu alır);
/// saatten `transferUserInfo` ile gelen olayları kuyruğa yazar. Kuyruk UserDefaults'ta durur, uygulama
/// kapalıyken gelen olaylar da kaybolmaz; JS açılınca `bekleyenleriAl` ile boşaltır.
public class SaatBaglantiModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SaatBaglanti")
    Events("olay")

    OnCreate {
      SaatOturumu.shared.bildir = { [weak self] in self?.sendEvent("olay", [:]) }
      SaatOturumu.shared.baslat()
    }

    Function("durumGonder") { (json: String) in
      SaatOturumu.shared.durumGonder(json)
    }

    Function("bekleyenleriAl") { () -> [String] in
      SaatOturumu.shared.kuyruguBosalt()
    }
  }
}

final class SaatOturumu: NSObject, WCSessionDelegate {
  static let shared = SaatOturumu()
  private let anahtar = "saat-bekleyen-olaylar"
  private let kilit = NSLock()
  private var sonDurum: String?
  var bildir: (() -> Void)?

  func baslat() {
    guard WCSession.isSupported() else { return }
    let s = WCSession.default
    if s.delegate == nil { s.delegate = self }
    if s.activationState != .activated { s.activate() }
  }

  func durumGonder(_ json: String) {
    sonDurum = json
    gonderHazirsa()
  }

  private func gonderHazirsa() {
    guard WCSession.isSupported(), let json = sonDurum else { return }
    let s = WCSession.default
    guard s.activationState == .activated, s.isPaired, s.isWatchAppInstalled else { return }
    try? s.updateApplicationContext(["durum": json, "t": Date().timeIntervalSince1970])
  }

  func kuyruguBosalt() -> [String] {
    kilit.lock(); defer { kilit.unlock() }
    let d = UserDefaults.standard
    let liste = d.stringArray(forKey: anahtar) ?? []
    d.removeObject(forKey: anahtar)
    return liste
  }

  private func kuyrugaEkle(_ json: String) {
    kilit.lock()
    let d = UserDefaults.standard
    var liste = d.stringArray(forKey: anahtar) ?? []
    liste.append(json)
    d.set(Array(liste.suffix(500)), forKey: anahtar)
    kilit.unlock()
    DispatchQueue.main.async { self.bildir?() }
  }

  // MARK: WCSessionDelegate
  func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
    gonderHazirsa()
  }
  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) { session.activate() }
  func sessionWatchStateDidChange(_ session: WCSession) { gonderHazirsa() }

  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
    if let json = userInfo["olay"] as? String { kuyrugaEkle(json) }
  }
  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    if let json = message["olay"] as? String { kuyrugaEkle(json) }
  }
}
