package ir.parvanesalon.app.presentation.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel

@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    onNavigateToLoyalty: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToAdmin: () -> Unit = {},
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val isAdminOrStaff = uiState.user?.role == "admin" || uiState.user?.role == "staff"

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7FF)),
        contentPadding = PaddingValues(bottom = 100.dp)
    ) {
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0)))
                    )
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier
                            .size(90.dp)
                            .background(Color.White.copy(0.3f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            uiState.user?.fullName?.firstOrNull()?.toString() ?: "؟",
                            fontSize = 36.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    Text(uiState.user?.fullName ?: "...", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Text(uiState.user?.phone ?: "", color = Color.White.copy(0.8f), fontSize = 14.sp)

                    // Role badge
                    if (isAdminOrStaff) {
                        Spacer(Modifier.height(8.dp))
                        Surface(color = Color.White.copy(0.2f), shape = RoundedCornerShape(10.dp)) {
                            Text(
                                if (uiState.user?.role == "admin") "👑 مدیر سالن" else "💼 متخصص",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                            )
                        }
                    }

                    if ((uiState.user?.loyaltyPoints ?: 0) > 0) {
                        Spacer(Modifier.height(10.dp))
                        Surface(color = Color.White.copy(0.2f), shape = RoundedCornerShape(12.dp)) {
                            Row(
                                Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Star, null, tint = Color(0xFFFFF176), modifier = Modifier.size(20.dp))
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    "${uiState.user?.loyaltyPoints} امتیاز وفاداری",
                                    color = Color.White,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // ── Admin/Staff Panel Button ──────────────────────
        if (isAdminOrStaff) {
            item {
                Spacer(Modifier.height(16.dp))
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clickable { onNavigateToAdmin() },
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFE91E8C)
                    ),
                    elevation = CardDefaults.cardElevation(4.dp)
                ) {
                    Row(
                        Modifier.padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Text("⚙️", fontSize = 28.sp)
                        Column(Modifier.weight(1f)) {
                            Text(
                                if (uiState.user?.role == "admin") "پنل مدیریت سالن" else "پنل متخصص",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp
                            )
                            Text(
                                if (uiState.user?.role == "admin")
                                    "مدیریت رزروها، کاربران، گالری و اعلان‌ها"
                                else
                                    "مشاهده رزروها و مدیریت گالری",
                                color = Color.White.copy(0.85f),
                                fontSize = 12.sp
                            )
                        }
                        Text("›", fontSize = 24.sp, color = Color.White)
                    }
                }
            }
        }

        // ── Regular menu items ────────────────────────────
        item {
            Spacer(Modifier.height(16.dp))
            Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ProfileMenuItem(
                    icon = "⭐",
                    title = "امتیاز وفاداری",
                    subtitle = "مشاهده امتیازات و تاریخچه",
                    onClick = onNavigateToLoyalty
                )
                ProfileMenuItem(
                    icon = "🔔",
                    title = "اعلان‌ها",
                    subtitle = "مشاهده اعلان‌ها و یادآوری‌ها",
                    onClick = onNavigateToNotifications
                )
                ProfileMenuItem(
                    icon = "📅",
                    title = "رزروهای من",
                    subtitle = "تاریخچه نوبت‌ها",
                    onClick = {}
                )
                ProfileMenuItem(
                    icon = "👤",
                    title = "ویرایش پروفایل",
                    subtitle = "نام، شماره، ایمیل",
                    onClick = {}
                )
            }
        }

        item {
            Spacer(Modifier.height(16.dp))
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
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
                    Spacer(Modifier.height(4.dp))
                    Text("© ۱۴۰۳ — تمامی حقوق محفوظ است", fontSize = 12.sp, color = Color.Gray.copy(0.7f))
                }
            }
        }

        item {
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = {
                    viewModel.logout()
                    onLogout()
                },
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFEBEE)),
                shape = RoundedCornerShape(14.dp)
            ) {
                Text("خروج از حساب", color = Color(0xFFD32F2F), fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun ProfileMenuItem(icon: String, title: String, subtitle: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Row(
            Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                Modifier
                    .size(44.dp)
                    .background(Color(0xFFFCF0F8), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) { Text(icon, fontSize = 22.sp) }
            Column(Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(subtitle, fontSize = 12.sp, color = Color.Gray)
            }
            Text("›", fontSize = 22.sp, color = Color.Gray)
        }
    }
}
