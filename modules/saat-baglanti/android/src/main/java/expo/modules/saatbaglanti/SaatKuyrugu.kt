package expo.modules.saatbaglanti

import android.content.Context
import android.os.Handler
import android.os.Looper
import org.json.JSONArray

/** Saatten gelen olay kuyruğu (SharedPreferences). JS açıkken yeni olay bildirilir. */
object SaatKuyrugu {
  private const val DOSYA = "saat-baglanti"
  private const val ANAHTAR = "bekleyen-olaylar"
  @Volatile var bildir: (() -> Unit)? = null

  @Synchronized
  fun ekle(c: Context, json: String) {
    val p = c.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)
    val dizi = JSONArray(p.getString(ANAHTAR, "[]"))
    dizi.put(json)
    while (dizi.length() > 500) dizi.remove(0)
    p.edit().putString(ANAHTAR, dizi.toString()).apply()
    Handler(Looper.getMainLooper()).post { bildir?.invoke() }
  }

  @Synchronized
  fun bosalt(c: Context): List<String> {
    val p = c.getSharedPreferences(DOSYA, Context.MODE_PRIVATE)
    val dizi = JSONArray(p.getString(ANAHTAR, "[]"))
    p.edit().remove(ANAHTAR).apply()
    return List(dizi.length()) { dizi.getString(it) }
  }
}
