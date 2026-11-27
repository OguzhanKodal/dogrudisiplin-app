package com.kodal.dogrudisiplin.saat

import androidx.concurrent.futures.CallbackToFutureAdapter
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.sp
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import com.google.common.util.concurrent.ListenableFuture

/** Kadrandan kaydırınca: disiplin günü, bugünkü alışkanlıklar; dokununca uygulama açılır. */
class DisiplinKaro : TileService() {
    private val VOLT = 0xFFC8F031.toInt()
    private val KEMIK = 0xFFF2F2EE.toInt()
    private val SOLUK = 0xFF9097A2.toInt()

    override fun onTileRequest(istek: RequestBuilders.TileRequest): ListenableFuture<TileBuilders.Tile> =
        CallbackToFutureAdapter.getFuture { sonuc ->
            val d = Depo.anlik(this)
            val alt = when {
                d == null -> "Telefonda uygulamayı aç"
                d.aliskanliklar.isEmpty() -> if (d.bugunSayildi) "Bugün sayıldı" else "Bugün bekliyor"
                else -> "Bugün ${d.yapilan}/${d.aliskanliklar.size}"
            }
            val ac = ModifiersBuilders.Clickable.Builder()
                .setId("ac")
                .setOnClick(
                    ActionBuilders.LaunchAction.Builder().setAndroidActivity(
                        ActionBuilders.AndroidActivity.Builder().setPackageName(packageName).setClassName(AnaEkran::class.java.name).build(),
                    ).build(),
                ).build()
            val icerik = LayoutElementBuilders.Column.Builder()
                .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                .addContent(metin("${d?.disiplinGunu ?: 0}", 48f, VOLT, LayoutElementBuilders.FONT_WEIGHT_BOLD))
                .addContent(metin("disiplin günü", 14f, KEMIK, LayoutElementBuilders.FONT_WEIGHT_NORMAL))
                .addContent(LayoutElementBuilders.Spacer.Builder().setHeight(dp(6f)).build())
                .addContent(metin(alt, 13f, SOLUK, LayoutElementBuilders.FONT_WEIGHT_NORMAL))
                .setModifiers(ModifiersBuilders.Modifiers.Builder().setClickable(ac).build())
                .build()
            val kok = LayoutElementBuilders.Box.Builder()
                .setWidth(androidx.wear.protolayout.DimensionBuilders.expand())
                .setHeight(androidx.wear.protolayout.DimensionBuilders.expand())
                .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
                .setVerticalAlignment(LayoutElementBuilders.VERTICAL_ALIGN_CENTER)
                .addContent(icerik)
                .build()
            sonuc.set(
                TileBuilders.Tile.Builder()
                    .setResourcesVersion("1")
                    .setFreshnessIntervalMillis(30 * 60 * 1000L)
                    .setTileTimeline(TimelineBuilders.Timeline.fromLayoutElement(kok))
                    .build(),
            )
            "karo"
        }

    @Deprecated("Tiles 1.x kaynak isteği")
    override fun onTileResourcesRequest(istek: RequestBuilders.ResourcesRequest): ListenableFuture<ResourceBuilders.Resources> =
        CallbackToFutureAdapter.getFuture { it.set(ResourceBuilders.Resources.Builder().setVersion("1").build()); "kaynak" }

    private fun metin(s: String, boyut: Float, renk: Int, kalinlik: Int) =
        LayoutElementBuilders.Text.Builder()
            .setText(s)
            .setFontStyle(
                LayoutElementBuilders.FontStyle.Builder().setSize(sp(boyut)).setColor(argb(renk)).setWeight(kalinlik).build(),
            ).build()
}
