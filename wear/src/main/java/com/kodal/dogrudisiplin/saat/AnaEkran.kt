package com.kodal.dogrudisiplin.saat

import android.content.pm.ApplicationInfo
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.Text

object Renk {
    val gece = Color(0xFF14181F)
    val gece2 = Color(0xFF1E242D)
    val volt = Color(0xFFC8F031)
    val soluk = Color(0xFF9097A2)
    val kemik = Color(0xFFF2F2EE)
}

class AnaEkran : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Depo.yukle(this)
        // Deneme sürümünde telefonsuz deneme: `am start ... --ez ornek true`.
        if ((applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0 && intent.getBooleanExtra("ornek", false)) {
            Depo.telefondanGeldi(this, ORNEK)
        }
        Depo.telefondanCek(this)
        setContent { MaterialTheme { Uygulama() } }
    }
}

private val ORNEK = """{"v":1,"gun":"${java.time.LocalDate.now()}","disiplinGunu":88,"bugunSayildi":true,
"aliskanliklar":[{"id":"a","ad":"Sabah 5 dakika","kucuk":"1 hareket","simge":"💪","isaret":"tam"},
{"id":"b","ad":"10 sayfa kitap","kucuk":"1 sayfa","simge":"📖","isaret":"kucuk"},
{"id":"c","ad":"2 litre su","kucuk":"1 bardak","simge":"💧","isaret":null}],
"programlar":[{"id":"sabah-5","ad":"Sabah 5 dakika","sure":"5 dk","dinlenme":8,"hareketler":[{"id":"squat","ad":"Squat","sure":25},{"id":"sinav","ad":"Şınav","sure":25}]},
{"id":"karin-4","ad":"Karın 4 dakika","sure":"4 dk","dinlenme":10,"hareketler":[{"id":"plank","ad":"Plank","sure":30}]}]}"""

private sealed interface Sayfa {
    data object Bugun : Sayfa
    data object Programlar : Sayfa
    data class Antrenman(val p: Program) : Sayfa
}

@Composable
private fun Uygulama() {
    var sayfa by remember { mutableStateOf<Sayfa>(Sayfa.Bugun) }
    val durum by Depo.durum.collectAsState()
    BackHandler(enabled = sayfa != Sayfa.Bugun) { sayfa = if (sayfa is Sayfa.Antrenman) Sayfa.Programlar else Sayfa.Bugun }
    Box(Modifier.fillMaxSize().background(Renk.gece)) {
        when (val s = sayfa) {
            Sayfa.Bugun -> BugunSayfasi(durum?.tazele()) { sayfa = Sayfa.Programlar }
            Sayfa.Programlar -> ProgramSayfasi(durum?.programlar.orEmpty()) { sayfa = Sayfa.Antrenman(it) }
            is Sayfa.Antrenman -> AntrenmanSayfasi(s.p) { sayfa = Sayfa.Bugun }
        }
    }
}

/** Markanın imza işareti: boş, tam (volt) ya da çapraz yarım (küçük hâli). */
@Composable
fun IsaretKare(isaret: String?, boyut: Int = 26) {
    val sekil = RoundedCornerShape((boyut * 0.28f).dp)
    Box(
        Modifier.size(boyut.dp).clip(sekil)
            .background(if (isaret == "tam") Renk.volt else Color.Transparent)
            .drawBehind {
                if (isaret == "kucuk") {
                    drawPath(Path().apply { moveTo(0f, 0f); lineTo(size.width, 0f); lineTo(0f, size.height); close() }, Renk.volt)
                }
            }
            .border(1.5.dp, if (isaret == null) Renk.soluk else Renk.volt, sekil),
        contentAlignment = Alignment.Center,
    ) {
        if (isaret == "tam") Text("✓", color = Renk.gece, fontSize = (boyut * 0.55).sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Kapsul(metin: String, onClick: () -> Unit) {
    Box(
        Modifier.fillMaxWidth().padding(horizontal = 8.dp).clip(RoundedCornerShape(50)).background(Renk.volt)
            .combinedClickable(onClick = onClick, role = Role.Button).padding(vertical = 12.dp),
        contentAlignment = Alignment.Center,
    ) { Text(metin, color = Renk.gece, fontWeight = FontWeight.Bold) }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun BugunSayfasi(d: SaatDurumu?, antrenman: () -> Unit) {
    val c = LocalContext.current
    val dokunma = LocalHapticFeedback.current
    ScalingLazyColumn(
        Modifier.fillMaxSize(),
        state = rememberScalingLazyListState(),
        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 28.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        if (d == null) {
            item { Text("Doğru Disiplin", fontWeight = FontWeight.Bold, color = Renk.kemik) }
            item { Text("Telefonda uygulamayı bir kez aç; alışkanlıkların buraya gelir.", color = Renk.soluk, fontSize = 13.sp) }
            return@ScalingLazyColumn
        }
        item {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.semantics(mergeDescendants = true) {}) {
                Text("${d.disiplinGunu}", color = Renk.volt, fontSize = 44.sp, fontWeight = FontWeight.Black)
                Text("disiplin günü", color = Renk.soluk, fontSize = 12.sp)
            }
        }
        item { Kapsul("Antrenman başlat", antrenman) }
        if (d.aliskanliklar.isNotEmpty()) {
            item { Text("Bugün · ${d.yapilan}/${d.aliskanliklar.size}", color = Renk.soluk, fontSize = 12.sp, modifier = Modifier.padding(top = 6.dp)) }
        } else {
            item { Text("Alışkanlıkları telefondan ekle.", color = Renk.soluk, fontSize = 12.sp) }
        }
        items(d.aliskanliklar, key = { it.id }) { a ->
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Renk.gece2)
                    .combinedClickable(
                        role = Role.Checkbox,
                        onClick = {
                            Depo.isaretle(c, a.id, if (a.isaret == null) "tam" else null)
                            dokunma.performHapticFeedback(HapticFeedbackType.Confirm)
                        },
                        onLongClick = {
                            Depo.isaretle(c, a.id, "kucuk")
                            dokunma.performHapticFeedback(HapticFeedbackType.LongPress)
                        },
                        onLongClickLabel = "Küçük hâlini yaptım",
                    )
                    .semantics {
                        contentDescription = "${a.ad}, " + when (a.isaret) { "tam" -> "yapıldı"; "kucuk" -> "küçük hâli yapıldı"; else -> "yapılmadı" }
                    }
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                IsaretKare(a.isaret)
                Column(Modifier.weight(1f)) {
                    Text(a.ad, color = if (a.isaret == null) Renk.kemik else Renk.soluk, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    if (a.isaret == "kucuk") Text("Küçük hâli", color = Renk.volt, fontSize = 11.sp)
                }
                Text(a.simge)
            }
        }
        if (d.aliskanliklar.isNotEmpty()) {
            item { Text("Dokun: yaptım. Basılı tut: küçük hâli.", color = Renk.soluk, fontSize = 11.sp) }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun ProgramSayfasi(programlar: List<Program>, sec: (Program) -> Unit) {
    ScalingLazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 28.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        item { Text("Antrenman", fontWeight = FontWeight.Bold, color = Renk.kemik) }
        items(programlar, key = { it.id }) { p ->
            Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Renk.gece2)
                    .combinedClickable(role = Role.Button, onClick = { sec(p) }).padding(horizontal = 14.dp, vertical = 10.dp),
            ) {
                Text(p.ad, color = Renk.kemik, fontWeight = FontWeight.SemiBold)
                Text("${p.sure} · ${p.hareketler.size} hareket", color = Renk.soluk, fontSize = 11.sp)
            }
        }
    }
}

