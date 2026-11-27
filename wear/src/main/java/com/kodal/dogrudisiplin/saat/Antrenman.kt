package com.kodal.dogrudisiplin.saat

import android.app.Activity
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.WindowManager
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Text
import kotlinx.coroutines.delay

private data class Adim(val calis: Boolean, val i: Int, val sureSn: Int)

private fun adimlar(p: Program): List<Adim> = buildList {
    add(Adim(false, 0, 5)) // Hazır ol
    p.hareketler.forEachIndexed { i, h ->
        add(Adim(true, i, h.sure))
        if (i < p.hareketler.lastIndex) add(Adim(false, i + 1, maxOf(p.dinlenme, 5)))
    }
}

/** Bilekte "birlikte yap": hareket → mola → hareket. Geçişte ve son 3 saniyede titreşir, ekran açık kalır. */
@Composable
fun AntrenmanSayfasi(p: Program, kapat: () -> Unit) {
    val c = LocalContext.current
    val liste = remember(p) { adimlar(p) }
    var no by remember { mutableIntStateOf(0) }
    var kalanMs by remember { mutableFloatStateOf(liste[0].sureSn * 1000f) }
    var durdu by remember { mutableStateOf(false) }
    var bitti by remember { mutableStateOf(false) }
    val baslangic = remember { SystemClock.elapsedRealtime() }
    val titres = remember { c.getSystemService(Vibrator::class.java) }

    // Antrenman boyunca ekran kararmasın.
    DisposableEffect(Unit) {
        val w = (c as? Activity)?.window
        w?.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onDispose { w?.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON) }
    }

    LaunchedEffect(no, durdu, bitti) {
        if (durdu || bitti) return@LaunchedEffect
        var son = SystemClock.elapsedRealtime()
        var sonSaniye = kotlin.math.ceil(kalanMs / 1000f).toInt()
        while (kalanMs > 0) {
            delay(100)
            val simdi = SystemClock.elapsedRealtime()
            kalanMs -= (simdi - son)
            son = simdi
            val sn = kotlin.math.ceil(kalanMs / 1000f).toInt()
            if (sn < sonSaniye) {
                sonSaniye = sn
                if (sn in 1..3) titres?.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK))
            }
        }
        if (no + 1 < liste.size) {
            no += 1
            kalanMs = liste[no].sureSn * 1000f
            titres?.vibrate(VibrationEffect.createPredefined(if (liste[no].calis) VibrationEffect.EFFECT_HEAVY_CLICK else VibrationEffect.EFFECT_DOUBLE_CLICK))
        } else {
            bitti = true
            titres?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 120, 80, 120, 80, 240), -1))
            Depo.antrenmanBitti(c, p, ((SystemClock.elapsedRealtime() - baslangic) / 1000).toInt())
        }
    }

    Box(Modifier.fillMaxSize().background(Renk.gece), contentAlignment = Alignment.Center) {
        if (bitti) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                IsaretKare("tam", 40)
                Text("Bitti", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Renk.kemik)
                Text("Disiplin günün sayıldı.", color = Renk.soluk, fontSize = 12.sp)
                Box(
                    Modifier.clip(RoundedCornerShape(50)).background(Renk.volt).clickable(role = Role.Button, onClick = kapat)
                        .padding(horizontal = 22.dp, vertical = 8.dp),
                ) { Text("Tamam", color = Renk.gece, fontWeight = FontWeight.Bold) }
            }
            return@Box
        }
        val a = liste[no]
        val h = p.hareketler[a.i]
        val toplam = p.hareketler.size
        val oran = (kalanMs / (a.sureSn * 1000f)).coerceIn(0f, 1f)
        val sn = kotlin.math.ceil(kalanMs / 1000f).toInt()

        // Dış halka: adımın kalan süresi (yuvarlak ekranın kenarını izler).
        Canvas(Modifier.fillMaxSize().padding(4.dp)) {
            val kalinlik = 6.dp.toPx()
            drawArc(Renk.gece2, -90f, 360f, false, style = Stroke(kalinlik))
            drawArc(if (a.calis) Renk.volt else Renk.soluk, -90f, 360f * oran, false, style = Stroke(kalinlik, cap = StrokeCap.Round))
        }

        Column(
            Modifier.fillMaxWidth().padding(horizontal = 22.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(
                if (no == 0) "Hazır ol" else if (a.calis) "Çalış · ${a.i + 1}/$toplam" else "Sıradaki · ${a.i + 1}/$toplam",
                color = if (a.calis) Renk.volt else Renk.soluk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold,
            )
            AnimatedContent(h.ad, transitionSpec = { fadeIn() togetherWith fadeOut() }, label = "hareket") {
                Text(it, color = Renk.kemik, fontSize = 16.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, maxLines = 2)
            }
            Box(
                Modifier.size(84.dp).clip(CircleShape).clickable(role = Role.Button) { durdu = !durdu }
                    .semantics { contentDescription = "$sn saniye kaldı. " + if (durdu) "Devam için dokun" else "Durdurmak için dokun" },
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("$sn", color = Renk.kemik, fontSize = 40.sp, fontWeight = FontWeight.Black)
                    if (durdu) Text("DURDU", color = Renk.soluk, fontSize = 10.sp)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                KucukDugme("✕", "Antrenmanı bırak") { kapat() }
                KucukDugme("»", "Sonraki adım") {
                    if (no + 1 < liste.size) { no += 1; kalanMs = liste[no].sureSn * 1000f } else kalanMs = 0f
                }
            }
        }
    }
}

@Composable
private fun KucukDugme(simge: String, etiket: String, onClick: () -> Unit) {
    Box(
        Modifier.size(36.dp).clip(CircleShape).background(Renk.gece2).clickable(role = Role.Button, onClick = onClick)
            .semantics { contentDescription = etiket },
        contentAlignment = Alignment.Center,
    ) { Text(simge, color = Renk.kemik, fontSize = 14.sp) }
}
