package com.kodal.dogrudisiplin.saat

import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate

// Telefonla aynı sözleşme (src/lib/saat.ts → SaatDurumu, v: 1).
data class Aliskanlik(val id: String, val ad: String, val kucuk: String, val simge: String, val isaret: String?)
data class Hareket(val id: String, val ad: String, val sure: Int)
data class Program(val id: String, val ad: String, val sure: String, val dinlenme: Int, val hareketler: List<Hareket>)

data class SaatDurumu(
    val gun: String,
    val disiplinGunu: Int,
    val bugunSayildi: Boolean,
    val aliskanliklar: List<Aliskanlik>,
    val programlar: List<Program>,
) {
    val yapilan get() = aliskanliklar.count { it.isaret != null }

    /** Gün değiştiyse dünkü işaretler bugüne taşınmaz. */
    fun tazele(): SaatDurumu {
        val bugun = LocalDate.now().toString()
        if (gun == bugun) return this
        return copy(gun = bugun, bugunSayildi = false, aliskanliklar = aliskanliklar.map { it.copy(isaret = null) })
    }

    fun json(): String = JSONObject().apply {
        put("v", 1)
        put("gun", gun)
        put("disiplinGunu", disiplinGunu)
        put("bugunSayildi", bugunSayildi)
        put("aliskanliklar", JSONArray(aliskanliklar.map {
            JSONObject().put("id", it.id).put("ad", it.ad).put("kucuk", it.kucuk).put("simge", it.simge).put("isaret", it.isaret ?: JSONObject.NULL)
        }))
        put("programlar", JSONArray(programlar.map { p ->
            JSONObject().put("id", p.id).put("ad", p.ad).put("sure", p.sure).put("dinlenme", p.dinlenme)
                .put("hareketler", JSONArray(p.hareketler.map { JSONObject().put("id", it.id).put("ad", it.ad).put("sure", it.sure) }))
        }))
    }.toString()

    companion object {
        fun coz(json: String): SaatDurumu? = runCatching {
            val o = JSONObject(json)
            if (o.optInt("v") != 1) return null
            SaatDurumu(
                gun = o.getString("gun"),
                disiplinGunu = o.getInt("disiplinGunu"),
                bugunSayildi = o.getBoolean("bugunSayildi"),
                aliskanliklar = o.getJSONArray("aliskanliklar").nesneler().map {
                    Aliskanlik(it.getString("id"), it.getString("ad"), it.optString("kucuk"), it.optString("simge"),
                        if (it.isNull("isaret")) null else it.getString("isaret"))
                },
                programlar = o.getJSONArray("programlar").nesneler().map { p ->
                    Program(p.getString("id"), p.getString("ad"), p.getString("sure"), p.getInt("dinlenme"),
                        p.getJSONArray("hareketler").nesneler().map { Hareket(it.getString("id"), it.getString("ad"), it.getInt("sure")) })
                },
            )
        }.getOrNull()

        private fun JSONArray.nesneler() = List(length()) { getJSONObject(it) }
    }
}
