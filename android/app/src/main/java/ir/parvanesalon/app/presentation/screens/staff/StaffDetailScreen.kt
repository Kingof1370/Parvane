package ir.parvanesalon.app.presentation.screens.staff

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import ir.parvanesalon.app.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StaffDetailScreen(
    staffId: String,
    onBook: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: StaffDetailViewModel = hiltViewModel()
) {
    LaunchedEffect(staffId) { viewModel.loadStaff(staffId) }
    val uiState by viewModel.uiState.collectAsState()
    val staff = uiState.staff

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(staff?.fullName ?: "متخصص") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } }
            )
        }
    ) { padding ->
        if (staff == null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        } else {
            LazyColumn(modifier = Modifier.padding(padding).fillMaxSize()) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(GradientStart, GradientMid))).padding(32.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Box(Modifier.size(96.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surface), contentAlignment = Alignment.Center) {
                                Text(staff.fullName.first().toString(), style = MaterialTheme.typography.headlineLarge.copy(color = MaterialTheme.colorScheme.primary))
                            }
                            Text(staff.fullName, style = MaterialTheme.typography.titleLarge.copy(color = MaterialTheme.colorScheme.onPrimary, fontWeight = FontWeight.Bold))
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, null, tint = GoldTertiary, modifier = Modifier.size(18.dp))
                                Text("${staff.rating} (${staff.totalReviews} نظر)", style = MaterialTheme.typography.bodyMedium.copy(color = MaterialTheme.colorScheme.onPrimary))
                            }
                        }
                    }
                }

                staff.bio?.let { bio ->
                    item {
                        Card(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text("درباره", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
                                Spacer(Modifier.height(4.dp))
                                Text(bio, style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                }

                item {
                    Text("تخصص‌ها", style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold), modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
                }

                items(staff.specialties) { service ->
                    ListItem(
                        headlineContent = { Text(service.name) },
                        supportingContent = { Text("${service.durationMinutes} دقیقه  •  ${(service.discountedPrice ?: service.price).toLong()} تومان") },
                        trailingContent = { Button(onClick = { onBook(service.id) }) { Text("رزرو") } }
                    )
                    HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
                }
            }
        }
    }
}
