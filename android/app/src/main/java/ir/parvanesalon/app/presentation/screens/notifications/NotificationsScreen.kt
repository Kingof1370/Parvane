package ir.parvanesalon.app.presentation.screens.notifications

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import ir.parvanesalon.app.data.remote.models.NotificationDto

@Composable
fun NotificationsScreen(viewModel: NotificationsViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7FF))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0)))
                )
                .padding(20.dp)
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("اعلان‌ها", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    if (uiState.unreadCount > 0) {
                        Text("${uiState.unreadCount} اعلان خوانده‌نشده", color = Color.White.copy(0.8f), fontSize = 13.sp)
                    }
                }
                if (uiState.unreadCount > 0) {
                    TextButton(onClick = { viewModel.markAllRead() }) {
                        Text("همه خوانده شد", color = Color.White, fontSize = 13.sp)
                    }
                }
            }
        }

        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFFE91E8C))
            }
        } else if (uiState.notifications.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🔔", fontSize = 64.sp)
                    Spacer(Modifier.height(16.dp))
                    Text("اعلانی ندارید", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(uiState.notifications) { notif ->
                    NotificationCard(
                        notif = notif,
                        onClick = { if (!notif.isRead) viewModel.markRead(notif.id) }
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationCard(notif: NotificationDto, onClick: () -> Unit) {
    val typeEmoji = when {
        notif.type.contains("appointment") -> "📅"
        notif.type.contains("loyalty") -> "⭐"
        notif.type.contains("chat") -> "💬"
        notif.type.contains("payment") -> "💳"
        notif.type.contains("review") -> "📝"
        notif.type.contains("aftercare") -> "🌸"
        else -> "🔔"
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(if (notif.isRead) 1.dp else 3.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (notif.isRead) Color.White else Color(0xFFFCF0F8)
        )
    ) {
        Row(
            Modifier.padding(16.dp),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(
                        if (notif.isRead) Color(0xFFF5F5F5) else Color(0xFFE91E8C).copy(0.1f),
                        RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(typeEmoji, fontSize = 22.sp)
            }
            Column(Modifier.weight(1f)) {
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        notif.title,
                        fontWeight = if (notif.isRead) FontWeight.Normal else FontWeight.Bold,
                        fontSize = 14.sp,
                        modifier = Modifier.weight(1f)
                    )
                    if (!notif.isRead) {
                        Box(
                            Modifier
                                .size(8.dp)
                                .background(Color(0xFFE91E8C), RoundedCornerShape(4.dp))
                        )
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(notif.body, fontSize = 13.sp, color = Color.Gray, lineHeight = 20.sp)
            }
        }
    }
}
