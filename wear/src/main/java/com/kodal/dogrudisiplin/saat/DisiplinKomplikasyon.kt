package com.kodal.dogrudisiplin.saat

import android.app.PendingIntent
import android.content.Intent
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService

/** Kadranda: kısa metin = disiplin günü; uzun metin ve aralık = bugünkü alışkanlık ilerlemesi. */
class DisiplinKomplikasyon : SuspendingComplicationDataSourceService() {
    private fun t(s: String) = PlainComplicationText.Builder(s).build()

    private fun veri(tur: ComplicationType, gun: Int, yapilan: Int, toplam: Int): ComplicationData? {
        val aciklama = t("$gun disiplin günü")
        val ac = PendingIntent.getActivity(this, 0, Intent(this, AnaEkran::class.java), PendingIntent.FLAG_IMMUTABLE)
        return when (tur) {
            ComplicationType.SHORT_TEXT -> ShortTextComplicationData.Builder(t("$gun"), aciklama).setTitle(t("gün")).setTapAction(ac).build()
            ComplicationType.LONG_TEXT ->
                LongTextComplicationData.Builder(t("$gun disiplin günü"), aciklama)
                    .setTitle(t(if (toplam > 0) "Bugün $yapilan/$toplam" else "Doğru Disiplin")).setTapAction(ac).build()
            ComplicationType.RANGED_VALUE ->
                RangedValueComplicationData.Builder(yapilan.toFloat(), 0f, maxOf(toplam, 1).toFloat(), t("Bugün $yapilan/$toplam"))
                    .setText(t("$yapilan/$toplam")).setTitle(t("$gun")).setTapAction(ac).build()
            else -> null
        }
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? = veri(type, 88, 3, 5)

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        val d = Depo.anlik(this)
        return veri(request.complicationType, d?.disiplinGunu ?: 0, d?.yapilan ?: 0, d?.aliskanliklar?.size ?: 0)
    }
}
