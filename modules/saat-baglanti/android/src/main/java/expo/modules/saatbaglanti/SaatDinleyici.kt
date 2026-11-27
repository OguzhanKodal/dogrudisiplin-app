package expo.modules.saatbaglanti

import android.net.Uri
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import com.google.android.gms.wearable.WearableListenerService

/** Saatten gelen olay öğelerini kuyruğa yazar ve siler (aynı olay iki kez sayılmasın). */
class SaatDinleyici : WearableListenerService() {
  override fun onDataChanged(olaylar: DataEventBuffer) {
    val silinecek = mutableListOf<Uri>()
    olaylar.forEach { e ->
      val oge = e.dataItem
      if (e.type == DataEvent.TYPE_CHANGED && oge.uri.path?.startsWith("/olay/") == true) {
        DataMapItem.fromDataItem(oge).dataMap.getString("json")?.let { SaatKuyrugu.ekle(this, it) }
        silinecek.add(oge.uri)
      }
    }
    val istemci = Wearable.getDataClient(this)
    silinecek.forEach { istemci.deleteDataItems(it) }
  }
}
