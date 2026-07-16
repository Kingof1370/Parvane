package ir.parvanesalon.app.presentation.screens.appointments

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import ir.parvanesalon.app.data.remote.models.AppointmentDto
import ir.parvanesalon.app.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppointmentsScreen(
    onBack: () -> Unit,
    viewModel: AppointmentsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("آینده", "گذشته", "لغو شده")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("رزروهای من") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { i, title ->
                    Tab(selected = selectedTab == i, onClick = { selectedTab = i; viewModel.loadTab(i) }, text = { Text(title) })
                }
            }

            if (uiState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            } else if (uiState.appointments.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("📅", style = MaterialTheme.typography.displaySmall)
                        Spacer(Modifier.height(8.dp))
                        Text("رزروی وجود ندارد", style = MaterialTheme.typography.bodyLarge)
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.appointments) { appt ->
                        AppointmentCard(
                            appointment = appt,
                            onCancel = if (selectedTab == 0) ({ viewModel.cancelAppointment(appt.id) }) else null
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AppointmentCard(appointment: AppointmentDto, onCancel: (() -> Unit)?) {
    val statusColor = when (appointment.status) {
        "pending" -> StatusPending
        "confirmed" -> StatusConfirmed
        "completed" -> StatusCompleted
        "cancelled" -> StatusCancelled
        else -> Color.Gray
    }
    val statusLabel = when (appointment.status) {
        "pending" -> "در انتظار تأیید"
        "confirmed" -> "تأیید شده"
        "completed" -> "انجام شده"
        "cancelled" -> "لغو شده"
        else -> appointment.status
    }

    Card(modifier = Modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(2.dp)) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(appointment.service.name, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
                Badge(containerColor = statusColor) { Text(statusLabel, color = Color.White) }
            }
            Text("متخصص: ${appointment.staff.fullName}", style = MaterialTheme.typography.bodySmall)
            Text("تاریخ: ${appointment.date}  —  ساعت: ${appointment.startTime}", style = MaterialTheme.typography.bodySmall)
            appointment.paidAmount?.let {
                Text("مبلغ: ${it.toLong()} تومان", style = MaterialTheme.typography.bodySmall)
            }
            onCancel?.let {
                OutlinedButton(onClick = it, modifier = Modifier.fillMaxWidth()) { Text("لغو رزرو") }
            }
        }
    }
}
