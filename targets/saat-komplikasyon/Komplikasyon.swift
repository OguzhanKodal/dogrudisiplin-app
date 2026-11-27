import SwiftUI
import WidgetKit

// Saat uygulamasının App Group'a yazdığı durumdan yalnız gereken alanlar (Depo.swift → SaatDurumu).
private struct Ozet: Decodable {
  struct A: Decodable { let isaret: String? }
  let gun: String
  let disiplinGunu: Int
  let bugunSayildi: Bool
  let aliskanliklar: [A]
}

struct Giris: TimelineEntry {
  let date: Date
  let disiplinGunu: Int
  let bugunSayildi: Bool
  let yapilan: Int
  let toplam: Int
}

private func bugunAnahtari(_ t: Date) -> String {
  let c = Calendar.current.dateComponents([.year, .month, .day], from: t)
  return String(format: "%04d-%02d-%02d", c.year!, c.month!, c.day!)
}

struct Saglayici: TimelineProvider {
  func oku(_ t: Date = Date()) -> Giris {
    let d = UserDefaults(suiteName: "group.com.kodal.dogrudisiplin")?.data(forKey: "saat-durumu")
    guard let d, let o = try? JSONDecoder().decode(Ozet.self, from: d) else {
      return Giris(date: t, disiplinGunu: 0, bugunSayildi: false, yapilan: 0, toplam: 0)
    }
    let bugun = o.gun == bugunAnahtari(t)
    return Giris(
      date: t, disiplinGunu: o.disiplinGunu, bugunSayildi: bugun && o.bugunSayildi,
      yapilan: bugun ? o.aliskanliklar.filter { $0.isaret != nil }.count : 0, toplam: o.aliskanliklar.count)
  }

  func placeholder(in context: Context) -> Giris { Giris(date: Date(), disiplinGunu: 88, bugunSayildi: true, yapilan: 3, toplam: 5) }
  func getSnapshot(in context: Context, completion: @escaping (Giris) -> Void) { completion(context.isPreview ? placeholder(in: context) : oku()) }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Giris>) -> Void) {
    // Gece yarısı bugünkü işaretler sıfırlanır: o an için ikinci giriş.
    let yarin = Calendar.current.startOfDay(for: Date().addingTimeInterval(86_400))
    completion(Timeline(entries: [oku(), oku(yarin)], policy: .after(yarin)))
  }
}

private let volt = Color(red: 0xC8 / 255, green: 0xF0 / 255, blue: 0x31 / 255)

struct KomplikasyonGorunumu: View {
  @Environment(\.widgetFamily) private var aile
  let g: Giris

  var body: some View {
    switch aile {
    case .accessoryCircular:
      ZStack {
        AccessoryWidgetBackground()
        VStack(spacing: -2) {
          Text("\(g.disiplinGunu)").font(.system(size: 20, weight: .heavy, design: .rounded)).minimumScaleFactor(0.6)
          RoundedRectangle(cornerRadius: 2).fill(g.bugunSayildi ? volt : .clear)
            .overlay(RoundedRectangle(cornerRadius: 2).stroke(volt, lineWidth: 1))
            .frame(width: 8, height: 8)
        }
      }
      .widgetAccentable()
    case .accessoryCorner:
      Text("\(g.disiplinGunu)").font(.system(size: 18, weight: .heavy, design: .rounded))
        .widgetLabel { Text(g.toplam > 0 ? "Bugün \(g.yapilan)/\(g.toplam)" : "disiplin günü") }
    case .accessoryInline:
      Text("\(g.disiplinGunu) disiplin günü\(g.toplam > 0 ? " · \(g.yapilan)/\(g.toplam)" : "")")
    default:
      HStack(spacing: 8) {
        Text("\(g.disiplinGunu)").font(.system(size: 34, weight: .heavy, design: .rounded)).foregroundStyle(volt).widgetAccentable()
        VStack(alignment: .leading, spacing: 1) {
          Text("disiplin günü").font(.caption2)
          Text(g.toplam > 0 ? "Bugün \(g.yapilan)/\(g.toplam)" : g.bugunSayildi ? "Bugün sayıldı" : "Bugün bekliyor")
            .font(.caption2).foregroundStyle(.secondary)
        }
        Spacer(minLength: 0)
      }
    }
  }
}

@main
struct DogruDisiplinKomplikasyon: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "disiplin-gunu", provider: Saglayici()) { g in
      KomplikasyonGorunumu(g: g).containerBackground(.clear, for: .widget)
    }
    .configurationDisplayName("Disiplin günü")
    .description("Hiç sıfırlanmayan sayaç ve bugünkü alışkanlıklar.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryCorner, .accessoryInline])
  }
}
