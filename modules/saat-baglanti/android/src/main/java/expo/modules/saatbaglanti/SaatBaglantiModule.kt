package expo.modules.saatbaglanti

import android.net.Uri
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Telefon tarafı Wear OS köprüsü. Son durum "/durum" veri öğesine yazılır (saat bağlanınca eşitlenir);
 * saatin "/olay/<id>" öğeleri [SaatDinleyici] tarafından kuyruğa alınır ve silinir.
 */
class SaatBaglantiModule : Module() {
  private val ctx get() = requireNotNull(appContext.reactContext) { "React context yok" }

  override fun definition() = ModuleDefinition {
    Name("SaatBaglanti")
    Events("olay")

    OnCreate {
      SaatKuyrugu.bildir = { sendEvent("olay", emptyMap<String, Any>()) }
      kalanOlaylariTopla()
    }

    OnDestroy { SaatKuyrugu.bildir = null }

    Function("durumGonder") { json: String ->
      val istek = PutDataMapRequest.create("/durum").apply {
        dataMap.putString("json", json)
        dataMap.putLong("t", System.currentTimeMillis())
      }.asPutDataRequest().setUrgent()
      Wearable.getDataClient(ctx).putDataItem(istek)
      Unit
    }

    Function("bekleyenleriAl") { SaatKuyrugu.bosalt(ctx) }
  }

  /** Dinleyici çalışamadan (uygulama yeni kuruldu vb.) kalan olay öğelerini toplar. */
  private fun kalanOlaylariTopla() {
    val c = appContext.reactContext ?: return
    val istemci = Wearable.getDataClient(c)
    istemci.getDataItems(Uri.parse("wear://*/olay/"), DataClient.FILTER_PREFIX).addOnSuccessListener { tampon ->
      val uriler = mutableListOf<Uri>()
      tampon.forEach { oge ->
        DataMapItem.fromDataItem(oge).dataMap.getString("json")?.let { SaatKuyrugu.ekle(c, it) }
        uriler.add(oge.uri)
      }
      tampon.release()
      uriler.forEach { istemci.deleteDataItems(it) }
    }
  }
}
