package com.kodal.dogrudisiplin.saat

import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService

/** Telefon "/durum" öğesini güncelleyince çağrılır; saat uygulaması kapalı olsa da karo ve komplikasyon tazelenir. */
class DurumDinleyici : WearableListenerService() {
    override fun onDataChanged(olaylar: DataEventBuffer) {
        olaylar.forEach { e ->
            if (e.type == DataEvent.TYPE_CHANGED && e.dataItem.uri.path == "/durum") {
                DataMapItem.fromDataItem(e.dataItem).dataMap.getString("json")?.let {
                    Depo.yukle(this)
                    Depo.telefondanGeldi(this, it)
                }
            }
        }
    }
}
