package ir.parvanesalon.app.presentation.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import ir.parvanesalon.app.presentation.theme.GradientMid
import ir.parvanesalon.app.presentation.theme.GradientStart

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onLogout: () -> Unit,
    onBack: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showLogoutDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.loggedOut) {
        if (uiState.loggedOut) onLogout()
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("خروج از حساب") },
            text = { Text("آیا مطمئن هستید؟") },
            confirmButton = { TextButton(onClick = { viewModel.logout() }) { Text("خروج", color = MaterialTheme.colorScheme.error) } },
            dismissButton = { TextButton(onClick = { showLogoutDialog = false }) { Text("انصراف") } }
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("پروفایل من") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, null) } },
                actions = {
                    IconButton(onClick = { showLogoutDialog = true }) {
                        Icon(Icons.AutoMirrored.Filled.Logout, null, tint = MaterialTheme.colorScheme.error)
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            // Avatar section
            Box(
                modifier = Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(GradientStart, GradientMid))).padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Box(
                        modifier = Modifier.size(80.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surface),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            uiState.user?.fullName?.firstOrNull()?.toString() ?: "؟",
                            style = MaterialTheme.typography.headlineMedium.copy(color = MaterialTheme.colorScheme.primary)
                        )
                    }
                    Text(uiState.user?.fullName ?: "", style = MaterialTheme.typography.titleMedium.copy(color = MaterialTheme.colorScheme.onPrimary, fontWeight = FontWeight.Bold))
                    Text(uiState.user?.phone ?: "", style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)))
                }
            }

            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ListItem(
                    headlineContent = { Text("شماره موبایل") },
                    supportingContent = { Text(uiState.user?.phone ?: "") },
                    leadingContent = { Icon(Icons.Default.Phone, null) }
                )
                HorizontalDivider()
                ListItem(
                    headlineContent = { Text("ایمیل") },
                    supportingContent = { Text(uiState.user?.email ?: "ثبت نشده") },
                    leadingContent = { Icon(Icons.Default.Email, null) }
                )
                HorizontalDivider()
                ListItem(
                    headlineContent = { Text("نوع حساب") },
                    supportingContent = { Text(when (uiState.user?.role) { "admin" -> "مدیر"; "staff" -> "متخصص"; else -> "مشتری" }) },
                    leadingContent = { Icon(Icons.Default.AccountCircle, null) }
                )
            }
        }
    }
}
