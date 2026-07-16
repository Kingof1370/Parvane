package ir.parvanesalon.app.presentation.screens.loyalty

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import ir.parvanesalon.app.data.remote.models.LoyaltyTransactionDto

@Composable
fun LoyaltyScreen(viewModel: LoyaltyViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7FF)),
        contentPadding = PaddingValues(bottom = 24.dp)
    ) {
        item {
            // Header with balance
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
                    Icon(Icons.Default.Star, null, tint = Color(0xFFFFF176), modifier = Modifier.size(48.dp))
                    Spacer(Modifier.height(8.dp))
                    Text(
                        "امتیاز وفاداری شما",
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 16.sp
                    )
                    Text(
                        "${uiState.data?.balance ?: 0}",
                        color = Color.White,
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "امتیاز",
                        color = Color.White.copy(alpha = 0.9f),
                        fontSize = 14.sp
                    )
                }
            }
        }

        item {
            // Stats cards
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                StatCard(
                    title = "کل کسب‌شده",
                    value = "${uiState.data?.totalEarned ?: 0}",
                    color = Color(0xFF4CAF50),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "استفاده‌شده",
                    value = "${uiState.data?.totalRedeemed ?: 0}",
                    color = Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
            }
        }

        item {
            // How to earn points
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(2.dp)
            ) {
                Column(Modifier.padding(16.dp)) {
                    Text("چطور امتیاز کسب کنید؟", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Spacer(Modifier.height(12.dp))
                    EarnRuleRow("🏆", "انجام هر رزرو", "+۱۰۰ امتیاز")
                    EarnRuleRow("⭐", "ثبت نظر پس از سرویس", "+۵۰ امتیاز")
                    EarnRuleRow("👥", "معرفی دوست جدید", "+۲۰۰ امتیاز")
                }
            }
        }

        item {
            Spacer(Modifier.height(8.dp))
            Text(
                "تاریخچه تراکنش‌ها",
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
        }

        if (uiState.isLoading) {
            item {
                Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFFE91E8C))
                }
            }
        } else {
            val transactions = uiState.data?.transactions ?: emptyList()
            if (transactions.isEmpty()) {
                item {
                    Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                        Text("هنوز تراکنشی ثبت نشده", color = Color.Gray)
                    }
                }
            } else {
                items(transactions) { tx ->
                    TransactionRow(tx)
                }
            }
        }
    }
}

@Composable
private fun StatCard(title: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(
            Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, fontWeight = FontWeight.Bold, fontSize = 24.sp, color = color)
            Text(title, fontSize = 12.sp, color = Color.Gray)
        }
    }
}

@Composable
private fun EarnRuleRow(icon: String, description: String, points: String) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(icon, fontSize = 20.sp)
            Spacer(Modifier.width(8.dp))
            Text(description, fontSize = 14.sp)
        }
        Text(points, fontWeight = FontWeight.Bold, color = Color(0xFFE91E8C), fontSize = 14.sp)
    }
}

@Composable
private fun TransactionRow(tx: LoyaltyTransactionDto) {
    val typeLabel = when (tx.type) {
        "earned_appointment" -> "🏆 رزرو انجام‌شده"
        "earned_review" -> "⭐ ثبت نظر"
        "earned_referral" -> "👥 معرفی دوست"
        "redeemed_discount" -> "🎁 استفاده از تخفیف"
        "redeemed_free_service" -> "🎀 سرویس رایگان"
        "admin_adjustment" -> "🔧 تعدیل ادمین"
        "expired" -> "⏰ انقضا"
        else -> tx.type
    }
    val isPositive = tx.points > 0

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Row(
            Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(Modifier.weight(1f)) {
                Text(typeLabel, fontWeight = FontWeight.Medium, fontSize = 14.sp)
                tx.description?.let { Text(it, fontSize = 12.sp, color = Color.Gray) }
            }
            Text(
                "${if (isPositive) "+" else ""}${tx.points}",
                fontWeight = FontWeight.Bold,
                color = if (isPositive) Color(0xFF4CAF50) else Color(0xFFF44336),
                fontSize = 16.sp
            )
        }
    }
}
