import SwiftUI
import WatchKit

extension Color {
  static let gece = Color(red: 0x14 / 255, green: 0x18 / 255, blue: 0x1F / 255)
  static let gece2 = Color(red: 0x1E / 255, green: 0x24 / 255, blue: 0x2D / 255)
  static let volt = Color(red: 0xC8 / 255, green: 0xF0 / 255, blue: 0x31 / 255)
  static let soluk = Color(red: 0x90 / 255, green: 0x97 / 255, blue: 0xA2 / 255)
}

@main
struct DogruDisiplinSaat: App {
  @StateObject private var depo = Depo.shared
  @Environment(\.scenePhase) private var sahne

  @ViewBuilder private var kok: some View {
    #if DEBUG
      // Simülatör denemesi: `-ornek -ekran antrenman` ya da `-ekran aliskanlik`.
      let arg = ProcessInfo.processInfo.arguments
      if let i = arg.firstIndex(of: "-ekran"), i + 1 < arg.count, let p = Depo.ornek.programlar.first {
        if arg[i + 1] == "antrenman" { AntrenmanGorunumu(program: p) } else { List { ForEach(Depo.ornek.aliskanliklar) { AliskanlikSatiri(a: $0) } } }
      } else {
        BugunGorunumu()
      }
    #else
      BugunGorunumu()
    #endif
  }

  var body: some Scene {
    WindowGroup {
      NavigationStack { kok }
        .environmentObject(depo)
        .tint(.volt)
        .onChange(of: sahne) { _, yeni in if yeni == .active { depo.tazele() } }
    }
  }
}

/// Markanın imza işareti: boş, tam (volt) ya da çapraz yarım (küçük hâli).
struct IsaretKare: View {
  let isaret: String?
  var boyut: CGFloat = 24

  var body: some View {
    RoundedRectangle(cornerRadius: boyut * 0.28)
      .fill(isaret == "tam" ? Color.volt : Color.clear)
      .overlay {
        if isaret == "kucuk" {
          UcgenYarim().fill(Color.volt).clipShape(RoundedRectangle(cornerRadius: boyut * 0.28))
        }
      }
      .overlay(RoundedRectangle(cornerRadius: boyut * 0.28).stroke(isaret == nil ? Color.soluk : Color.volt, lineWidth: 1.5))
      .overlay {
        if isaret == "tam" {
          Image(systemName: "checkmark").font(.system(size: boyut * 0.5, weight: .bold)).foregroundStyle(Color.gece)
        }
      }
      .frame(width: boyut, height: boyut)
  }
}

struct UcgenYarim: Shape {
  func path(in r: CGRect) -> Path {
    Path { p in
      p.move(to: CGPoint(x: r.minX, y: r.minY))
      p.addLine(to: CGPoint(x: r.maxX, y: r.minY))
      p.addLine(to: CGPoint(x: r.minX, y: r.maxY))
      p.closeSubpath()
    }
  }
}

struct BugunGorunumu: View {
  @EnvironmentObject private var depo: Depo

  var body: some View {
    List {
      if let d = depo.durum {
        Section {
          VStack(alignment: .leading, spacing: 0) {
            Text("\(d.disiplinGunu)")
              .font(.system(size: 52, weight: .heavy, design: .rounded))
              .foregroundStyle(Color.volt)
              .contentTransition(.numericText())
            Text("disiplin günü").font(.footnote).foregroundStyle(Color.soluk)
          }
          .listRowBackground(Color.clear)
          .accessibilityElement(children: .combine)
        }

        Section {
          NavigationLink {
            ProgramListesi()
          } label: {
            Label("Antrenman başlat", systemImage: "figure.strengthtraining.functional")
              .foregroundStyle(Color.gece)
          }
          .listRowBackground(RoundedRectangle(cornerRadius: 22).fill(Color.volt))
        }

        Section {
          if d.aliskanliklar.isEmpty {
            Text("Alışkanlıkları telefondan ekle.").font(.footnote).foregroundStyle(Color.soluk)
          }
          ForEach(d.aliskanliklar) { a in
            AliskanlikSatiri(a: a)
          }
        } header: {
          Text("Bugün · \(depo.yapilanSayisi)/\(d.aliskanliklar.count)")
        } footer: {
          if !d.aliskanliklar.isEmpty {
            Text("Dokun: yaptım. Basılı tut: küçük hâli.").font(.caption2)
          }
        }
      } else {
        VStack(alignment: .leading, spacing: 6) {
          Text("Doğru Disiplin").font(.headline)
          Text("Telefonda uygulamayı bir kez aç; alışkanlıkların buraya gelir.")
            .font(.footnote).foregroundStyle(Color.soluk)
        }
        .listRowBackground(Color.clear)
      }
    }
    .navigationTitle("Bugün")
    .containerBackground(Color.gece.gradient, for: .navigation)
  }
}

struct AliskanlikSatiri: View {
  @EnvironmentObject private var depo: Depo
  let a: Aliskanlik

  var body: some View {
    HStack(spacing: 10) {
      IsaretKare(isaret: a.isaret)
      VStack(alignment: .leading, spacing: 1) {
        Text(a.ad).font(.body).foregroundStyle(a.isaret == nil ? .primary : Color.soluk).lineLimit(2)
        if a.isaret == "kucuk" {
          Text("Küçük hâli").font(.caption2).foregroundStyle(Color.volt)
        }
      }
      Spacer(minLength: 0)
      Text(a.simge)
    }
    .contentShape(Rectangle())
    .onTapGesture {
      depo.isaretle(a.id, a.isaret == nil ? "tam" : nil)
      WKInterfaceDevice.current().play(a.isaret == nil ? .success : .click)
    }
    .onLongPressGesture(minimumDuration: 0.45) {
      depo.isaretle(a.id, "kucuk")
      WKInterfaceDevice.current().play(.directionUp)
    }
    .accessibilityElement(children: .combine)
    .accessibilityAddTraits(.isButton)
    .accessibilityValue(a.isaret == "tam" ? "Yapıldı" : a.isaret == "kucuk" ? "Küçük hâli yapıldı" : "Yapılmadı")
    .accessibilityAction(named: "Küçük hâlini yaptım") { depo.isaretle(a.id, "kucuk") }
  }
}

struct ProgramListesi: View {
  @EnvironmentObject private var depo: Depo

  var body: some View {
    List(depo.durum?.programlar ?? []) { p in
      NavigationLink(value: p) {
        VStack(alignment: .leading, spacing: 2) {
          Text(p.ad).font(.headline)
          Text("\(p.sure) · \(p.hareketler.count) hareket").font(.caption2).foregroundStyle(Color.soluk)
        }
      }
    }
    .navigationTitle("Antrenman")
    .navigationDestination(for: Program.self) { AntrenmanGorunumu(program: $0) }
    .containerBackground(Color.gece.gradient, for: .navigation)
  }
}
