package ir.parvanesalon.app.presentation.screens.staff

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import ir.parvanesalon.app.data.remote.models.PortfolioItemDto
import ir.parvanesalon.app.data.remote.models.ServiceDto
import ir.parvanesalon.app.presentation.screens.staff.StaffDetailViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StaffDetailScreen(
    staffId: String,
    onBack: () -> Unit,
    onBooking: (String) -> Unit,
    viewModel: StaffDetailViewModel = hiltViewModel()
) {
    LaunchedEffect(staffId) { viewModel.load(staffId) }
    val uiState by viewModel.uiState.collectAsState()

    val staff = uiState.staff
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("درباره", "نمونه‌کارها", "تخصص‌ها")

    if (uiState.isLoading || staff == null) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Color(0xFFE91E8C))
        }
        return
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7FF))
    ) {
        item {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0))))
                    .padding(top = 16.dp, bottom = 32.dp, start = 20.dp, end = 20.dp)
            ) {
                IconButton(onClick = onBack, modifier = Modifier.align(Alignment.TopStart)) {
                    Icon(Icons.Default.ArrowForward, null, tint = Color.White)
                }
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp)
                ) {
                    if (staff.avatar != null) {
                        AsyncImage(
                            model = staff.avatar,
                            contentDescription = staff.fullName,
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .background(Color.White),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(0.3f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(staff.fullName.first().toString(), fontSize = 40.sp, color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(staff.fullName, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    if (staff.section != null) {
                        Text("متخصص ${staff.section}", color = Color.White.copy(0.8f), fontSize = 14.sp)
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Star, null, tint = Color(0xFFFFF176), modifier = Modifier.size(20.dp))
                        Text(" ${staff.rating}", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text(" (${staff.totalReviews} نظر)", color = Color.White.copy(0.7f), fontSize = 13.sp)
                    }
                    if (staff.experienceYears > 0) {
                        Text("${staff.experienceYears} سال تجربه", color = Color.White.copy(0.8f), fontSize = 13.sp)
                    }
                }
            }
        }

        item {
            // Book button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .offset(y = (-20).dp)
                    .padding(horizontal = 24.dp)
            ) {
                Button(
                    onClick = { onBooking(staffId) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                    contentPadding = PaddingValues(vertical = 14.dp),
                    shape = RoundedCornerShape(16.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Text("رزرو نوبت", color = Color(0xFFE91E8C), fontWeight = FontWeight.Bold, fontSize = 16.sp)
                }
            }
        }

        item {
            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = Color(0xFFE91E8C),
            ) {
                tabs.forEachIndexed { idx, title ->
                    Tab(
                        selected = selectedTab == idx,
                        onClick = { selectedTab = idx },
                        text = { Text(title, fontWeight = if (selectedTab == idx) FontWeight.Bold else FontWeight.Normal) }
                    )
                }
            }
        }

        when (selectedTab) {
            0 -> {
                // درباره
                item {
                    Column(Modifier.padding(20.dp)) {
                        if (!staff.bio.isNullOrBlank()) {
                            Card(
                                Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Column(Modifier.padding(16.dp)) {
                                    Text("بیوگرافی", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Spacer(Modifier.height(8.dp))
                                    Text(staff.bio, fontSize = 14.sp, color = Color.Gray, lineHeight = 24.sp)
                                }
                            }
                            Spacer(Modifier.height(12.dp))
                        }
                        if (!staff.certificationsText.isNullOrBlank()) {
                            Card(
                                Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Column(Modifier.padding(16.dp)) {
                                    Text("مدارک و گواهینامه‌ها 🏅", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                    Spacer(Modifier.height(8.dp))
                                    Text(staff.certificationsText, fontSize = 14.sp, color = Color.Gray)
                                }
                            }
                            Spacer(Modifier.height(12.dp))
                        }
                        if (!staff.instagramUrl.isNullOrBlank()) {
                            Card(
                                Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                elevation = CardDefaults.cardElevation(2.dp)
                            ) {
                                Row(
                                    Modifier.padding(16.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("📸", fontSize = 24.sp)
                                    Spacer(Modifier.width(8.dp))
                                    Column {
                                        Text("اینستاگرام", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text(staff.instagramUrl, fontSize = 13.sp, color = Color(0xFFE91E8C))
                                    }
                                }
                            }
                        }
                    }
                }
            }
            1 -> {
                // پورتفولیو
                val portfolio = staff.portfolio
                if (portfolio.isEmpty()) {
                    item {
                        Box(
                            Modifier.fillMaxWidth().padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("نمونه‌کاری ثبت نشده", color = Color.Gray)
                        }
                    }
                } else {
                    items(portfolio.chunked(2)) { row ->
                        Row(
                            Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            row.forEach { item ->
                                PortfolioCard(item = item, modifier = Modifier.weight(1f))
                            }
                            if (row.size == 1) Spacer(Modifier.weight(1f))
                        }
                    }
                    item { Spacer(Modifier.height(16.dp)) }
                }
            }
            2 -> {
                // تخصص‌ها
                val specialties = staff.specialties
                if (specialties.isEmpty()) {
                    item {
                        Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                            Text("تخصصی ثبت نشده", color = Color.Gray)
                        }
                    }
                } else {
                    items(specialties) { service ->
                        SpecialtyCard(service = service, modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp))
                    }
                    item { Spacer(Modifier.height(16.dp)) }
                }
            }
        }
    }
}

@Composable
private fun PortfolioCard(item: PortfolioItemDto, modifier: Modifier = Modifier) {
    val typeLabel = when (item.type) {
        "before_after" -> "قبل/بعد"
        "certificate" -> "گواهینامه"
        else -> "نمونه‌کار"
    }
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column {
            AsyncImage(
                model = item.imageUrl,
                contentDescription = item.title,
                modifier = Modifier.fillMaxWidth().height(150.dp),
                contentScale = ContentScale.Crop
            )
            Column(Modifier.padding(10.dp)) {
                Text(item.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, maxLines = 1)
                Text(typeLabel, fontSize = 11.sp, color = Color(0xFFE91E8C))
                if (!item.description.isNullOrBlank()) {
                    Text(item.description, fontSize = 11.sp, color = Color.Gray, maxLines = 2)
                }
            }
        }
    }
}

@Composable
private fun SpecialtyCard(service: ServiceDto, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Row(
            Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(Modifier.weight(1f)) {
                Text(service.name, fontWeight = FontWeight.Medium, fontSize = 15.sp)
                Text("${service.durationMinutes} دقیقه", fontSize = 13.sp, color = Color.Gray)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("${service.price.toLong().format()} تومان", fontWeight = FontWeight.Bold, color = Color(0xFFE91E8C))
                if (service.discountedPrice != null) {
                    Text("${service.discountedPrice.toLong().format()}", fontSize = 12.sp, color = Color.Gray)
                }
            }
        }
    }
}

private fun Long.format(): String {
    return "%,d".format(this).replace(',', '،')
}
