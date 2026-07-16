package ir.parvanesalon.app.presentation.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Notifications
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
import ir.parvanesalon.app.data.remote.models.StaffDto

data class QuickAction(val icon: String, val label: String, val route: String)

@Composable
fun HomeScreen(
    onNavigate: (String) -> Unit,
    onStaffClick: (String) -> Unit,
    unreadNotifications: Int = 0,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    val quickActions = listOf(
        QuickAction("📅", "رزرو نوبت", "services"),
        QuickAction("🖼️", "گالری استایل", "gallery"),
        QuickAction("💬", "مشاوره آنلاین", "chat"),
        QuickAction("⭐", "امتیاز وفاداری", "loyalty"),
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7FF)),
        contentPadding = PaddingValues(bottom = 100.dp)
    ) {
        item {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0)))
                    )
                    .padding(start = 20.dp, end = 20.dp, top = 24.dp, bottom = 40.dp)
            ) {
                Column {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                "سالن زیبایی پروانه ✿",
                                color = Color.White,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold
                            )
                            if (uiState.userName != null) {
                                Text("سلام، ${uiState.userName}!", color = Color.White.copy(0.9f), fontSize = 14.sp)
                            }
                        }
                        Badge(
                            modifier = Modifier
                                .clickable { onNavigate("notifications") }
                                .size(44.dp)
                                .background(Color.White.copy(0.2f), CircleShape),
                            containerColor = if (unreadNotifications > 0) Color(0xFFFFF176) else Color.Transparent
                        ) {
                            Icon(
                                Icons.Default.Notifications,
                                null,
                                tint = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                    Spacer(Modifier.height(16.dp))
                    if (uiState.loyaltyPoints > 0) {
                        Surface(
                            color = Color.White.copy(0.2f),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Star, null, tint = Color(0xFFFFF176), modifier = Modifier.size(16.dp))
                                Text(" ${uiState.loyaltyPoints} امتیاز وفاداری", color = Color.White, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }
        }

        item {
            // Quick actions card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .offset(y = (-20).dp)
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(20.dp),
                elevation = CardDefaults.cardElevation(8.dp)
            ) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    quickActions.forEach { action ->
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            modifier = Modifier
                                .clickable { onNavigate(action.route) }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Box(
                                Modifier
                                    .size(48.dp)
                                    .background(Color(0xFFFCF0F8), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(action.icon, fontSize = 22.sp)
                            }
                            Spacer(Modifier.height(6.dp))
                            Text(action.label, fontSize = 11.sp, color = Color.Gray, fontWeight = FontWeight.Medium)
                        }
                    }
                }
            }
        }

        item {
            Text(
                "متخصصان ما",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                modifier = Modifier.padding(start = 16.dp, bottom = 12.dp)
            )
        }

        if (uiState.isLoading) {
            item {
                Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFFE91E8C))
                }
            }
        } else {
            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.staff) { staff ->
                        StaffCard(staff = staff, onClick = { onStaffClick(staff.id) })
                    }
                }
            }
        }

        item {
            Spacer(Modifier.height(20.dp))
            // About / copyright card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFCF0F8))
            ) {
                Column(
                    Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("✿", fontSize = 32.sp)
                    Spacer(Modifier.height(8.dp))
                    Text("سالن زیبایی پروانه", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFFE91E8C))
                    Spacer(Modifier.height(4.dp))
                    Text("توسعه‌دهنده: علی بهمنی", fontSize = 13.sp, color = Color.Gray)
                    Text("تماس: ۰۹۹۱۵۴۲۰۵۵۸", fontSize = 13.sp, color = Color.Gray)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "© ۱۴۰۳ — تمامی حقوق محفوظ است",
                        fontSize = 12.sp,
                        color = Color.Gray.copy(0.7f)
                    )
                }
            }
        }
    }
}

@Composable
private fun StaffCard(staff: StaffDto, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .width(160.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp)
                    .background(Brush.verticalGradient(listOf(Color(0xFFE91E8C).copy(0.1f), Color(0xFF9C27B0).copy(0.1f))))
            ) {
                if (staff.avatar != null) {
                    AsyncImage(
                        model = staff.avatar,
                        contentDescription = staff.fullName,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                } else {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(staff.fullName.first().toString(), fontSize = 48.sp, color = Color(0xFFE91E8C), fontWeight = FontWeight.Bold)
                    }
                }
            }
            Column(Modifier.padding(12.dp)) {
                Text(staff.fullName, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1)
                if (staff.section != null) Text(staff.section, fontSize = 12.sp, color = Color.Gray, maxLines = 1)
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 4.dp)) {
                    Icon(Icons.Default.Star, null, tint = Color(0xFFFFC107), modifier = Modifier.size(14.dp))
                    Text(" ${staff.rating} (${staff.totalReviews})", fontSize = 12.sp, color = Color.Gray)
                }
                if (staff.experienceYears > 0) {
                    Text("${staff.experienceYears} سال تجربه", fontSize = 11.sp, color = Color(0xFFE91E8C))
                }
            }
        }
    }
}
