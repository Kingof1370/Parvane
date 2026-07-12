package ir.parvanesalon.app.presentation.screens.services

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import ir.parvanesalon.app.data.remote.models.ServiceDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ServicesScreen(
    onNavigateToBooking: (String, String) -> Unit,
    onBack: () -> Unit,
    viewModel: ServicesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    var selectedService by remember { mutableStateOf<ServiceDto?>(null) }

    if (selectedService != null) {
        StaffPickerDialog(
            service = selectedService!!,
            staff = uiState.staff,
            onDismiss = { selectedService = null },
            onSelectStaff = { staffId ->
                onNavigateToBooking(selectedService!!.id, staffId)
                selectedService = null
            }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("خدمات سالن") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Category filter
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedCategory == null,
                        onClick = { selectedCategory = null; viewModel.loadServices(null) },
                        label = { Text("همه") }
                    )
                }
                items(uiState.categories) { cat ->
                    FilterChip(
                        selected = selectedCategory == cat.id,
                        onClick = { selectedCategory = cat.id; viewModel.loadServices(cat.id) },
                        label = { Text(cat.name) }
                    )
                }
            }

            if (uiState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.services) { service ->
                        ServiceCard(service = service, onBook = { selectedService = service })
                    }
                }
            }
        }
    }
}

@Composable
fun ServiceCard(service: ServiceDto, onBook: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth(), elevation = CardDefaults.cardElevation(2.dp)) {
        Row(modifier = Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(service.name, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold))
                service.description?.let {
                    Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2)
                }
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("⏱ ${service.durationMinutes} دقیقه", style = MaterialTheme.typography.labelMedium)
                    val price = service.discountedPrice ?: service.price
                    Text("${price.toLong()} تومان", style = MaterialTheme.typography.labelMedium.copy(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold))
                }
            }
            Button(onClick = onBook, modifier = Modifier.padding(start = 8.dp)) { Text("رزرو") }
        }
    }
}

@Composable
fun StaffPickerDialog(
    service: ServiceDto,
    staff: List<ir.parvanesalon.app.data.remote.models.StaffDto>,
    onDismiss: () -> Unit,
    onSelectStaff: (String) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("انتخاب متخصص") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                staff.forEach { s ->
                    OutlinedButton(onClick = { onSelectStaff(s.id) }, modifier = Modifier.fillMaxWidth()) {
                        Text(s.fullName)
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = { TextButton(onClick = onDismiss) { Text("انصراف") } }
    )
}
