package com.kodal.dogrudisiplin.saat

import android.content.ComponentName
import android.content.Context
import android.net.Uri
import androidx.wear.tiles.TileService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import com.google.android.gms.wearable.DataClient
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import org.json.JSONObject
import java.time.LocalDate
import java.util.UUID

/**
 * Saatteki tek veri kaynağı. Telefondan gelen son durumu saklar; saatte yapılan işareti hemen gösterir
 * ve telefona "/olay/<id>" veri öğesi olarak yollar (telefon uzaktaysa bağlanınca eşitlenir).
 */
object Depo {
    private const val DOSYA = "saat"
    private const val ANAHTAR = "durum"
    private val _durum = MutableStateFlow<SaatDurumu?>(null)
    val durum: StateFlow<SaatDurumu?> = _durum
    @Volatile private var yuklendi = false

    fun yukle(c: Context) {
        if (yuklendi) return
        yuklendi = true
        c.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).getString(ANAHTAR, null)?.let { _durum.value = SaatDurumu.coz(it)?.tazele() }
    }

    fun anlik(c: Context): SaatDurumu? { yukle(c); return _durum.value?.tazele() }

    /** Uygulama açılınca: dinleyici kaçırdıysa telefonun son durumunu veri katmanından okur. */
    fun telefondanCek(c: Context) {
        Wearable.getDataClient(c).getDataItems(Uri.parse("wear://*/durum"), DataClient.FILTER_LITERAL).addOnSuccessListener { tampon ->
            val enYeni = tampon.map { DataMapItem.fromDataItem(it).dataMap }.maxByOrNull { it.getLong("t") }
            enYeni?.getString("json")?.let { telefondanGeldi(c, it) }
            tampon.release()
        }
    }

    fun telefondanGeldi(c: Context, json: String) {
        val d = SaatDurumu.coz(json) ?: return
        yaz(c, d.tazele())
    }

    /** null: geri al, "tam": yaptım, "kucuk": küçük hâlini yaptım. */
    fun isaretle(c: Context, id: String, isaret: String?) {
        val d = anlik(c) ?: return
        val liste = d.aliskanliklar.map { if (it.id == id) it.copy(isaret = isaret) else it }
        var y = d.copy(aliskanliklar = liste)
        // Disiplin günü: bugün ilk kez sayılıyorsa bir artar (telefon kesin değeri sonra yollar).
        if (liste.any { it.isaret != null } && !d.bugunSayildi) y = y.copy(disiplinGunu = d.disiplinGunu + 1, bugunSayildi = true)
        yaz(c, y)
        olayGonder(c, JSONObject().put("tur", "isaret").put("gun", y.gun).put("id", id).put("isaret", isaret ?: JSONObject.NULL))
    }

    fun antrenmanBitti(c: Context, p: Program, sureSn: Int) {
        anlik(c)?.let { d -> if (!d.bugunSayildi) yaz(c, d.copy(disiplinGunu = d.disiplinGunu + 1, bugunSayildi = true)) }
        olayGonder(c, JSONObject().put("tur", "antrenman").put("programId", p.id).put("tarih", LocalDate.now().toString()).put("sureSn", sureSn))
    }

    private fun yaz(c: Context, d: SaatDurumu) {
        _durum.value = d
        c.getSharedPreferences(DOSYA, Context.MODE_PRIVATE).edit().putString(ANAHTAR, d.json()).apply()
        // Karo ve komplikasyon yeni değeri göstersin.
        TileService.getUpdater(c).requestUpdate(DisiplinKaro::class.java)
        ComplicationDataSourceUpdateRequester.create(c, ComponentName(c, DisiplinKomplikasyon::class.java)).requestUpdateAll()
    }

    private fun olayGonder(c: Context, olay: JSONObject) {
        val istek = PutDataMapRequest.create("/olay/${UUID.randomUUID()}").apply {
            dataMap.putString("json", olay.toString())
            dataMap.putLong("t", System.currentTimeMillis())
        }.asPutDataRequest().setUrgent()
        Wearable.getDataClient(c).putDataItem(istek)
    }
}
