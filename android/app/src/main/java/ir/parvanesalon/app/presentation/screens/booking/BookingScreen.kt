package ir.parvanesalon.app.presentation.screens.booking

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingScreen(
    serviceId: String,
    staffId: String,
    onSuccess: () -> Unit,
    onBack: () -> Unit,
    viewModel: BookingViewModel = hiltViewModel()
) {
    LaunchedEffect(serviceId, staffId) { viewModel.init(serviceId, staffId) }

    val uiState by viewModel.uiState.collectAsState()
    var selectedDate by remember { mutableStateOf(LocalDate.now().plusDays(1)) }
    var selectedSlot by remember { mutableStateOf<String?>(null) }
    var notes by remember { mutableStateOf("") }

    LaunchedEffect(uiState.bookingSuccess) {
        if (uiState.bookingSuccess) onSuccess()
    }

    LaunchedEffect(selectedDate) {
        viewModel.loadSlots(staffId, serviceId, selectedDate.format(DateTimeFormatter.ISO_LOCAL_DATE))
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("رزرو نوبت") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(16.dp).fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            uiState.service?.let { service ->
                Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(service.name, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
                        Text("⏱ ${service.durationMinutes} دقیقه  •  ${(service.discountedPrice ?: service.price).toLong()} تومان",
                            style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            Text("انتخاب تاریخ", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items((1..14).toList()) { dayOffset ->
                    val date = LocalDate.now().plusDays(dayOffset.toLong())
                    val isSelected = date == selectedDate
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedDate = date; selectedSlot = null },
                        label = { Text(date.format(DateTimeFormatter.ofPattern("MM/dd"))) }
                    )
                }
            }

            Text("انتخاب ساعت", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
            if (uiState.isLoadingSlots) {
                CircularProgressIndicator()
            } else if (uiState.slots.isEmpty()) {
                Text("زمان خالی در این روز وجود ندارد", color = MaterialTheme.colorScheme.error)
            } else {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(uiState.slots) { slot ->
                        FilterChip(
                            selected = selectedSlot == slot,
                            onClick = { selectedSlot = slot },
                            label = { Text(slot) }
                        )
                    }
                }
            }

            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("توضیحات (اختیاری)") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2
            )

            Spacer(Modifier.weight(1f))

            Button(
                onClick = {
                    viewModel.book(
                        serviceId, staffId,
                        selectedDate.format(DateTimeFormatter.ISO_LOCAL_DATE),
                        selectedSlot!!, notes.ifBlank { null }
                    )
                },
                modifier = Modifier.fillMaxWidth().height(52.dp),
                enabled = selectedSlot != null && !uiState.isBooking
            ) {
                if (uiState.isBooking) CircularProgressIndicator(Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                else Text("ثبت رزرو", fontWeight = FontWeight.SemiBold)
            }

            uiState.error?.let {
                Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}
