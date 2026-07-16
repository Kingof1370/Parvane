package ir.parvanesalon.app.presentation.screens.admin

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import ir.parvanesalon.app.data.remote.models.AdminAppointmentDto
import ir.parvanesalon.app.data.remote.models.AdminChatRoomDto
import ir.parvanesalon.app.data.remote.models.AdminGalleryItemDto
import ir.parvanesalon.app.data.remote.models.AdminUserDto
import ir.parvanesalon.app.data.remote.models.StaffDto

private val Pink = Color(0xFFE91E8C)
private val Purple = Color(0xFF9C27B0)
private val PinkLight = Color(0xFFFCE4EC)
private val Background = Color(0xFFFAF7FF)

// ═══════════════════════════════════════
//          MAIN ADMIN PANEL
// ═══════════════════════════════════════
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPanelScreen(
    onBack: () -> Unit,
    viewModel: AdminViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }

    val tabs = listOf(
        Triple("داشبورد", Icons.Default.Dashboard, 0),
        Triple("رزروها", Icons.Default.CalendarMonth, 1),
        Triple("مشتریان", Icons.Default.People, 2),
        Triple("متخصصان", Icons.Default.Person, 3),
        Triple("گالری", Icons.Default.PhotoLibrary, 4),
        Triple("اعلان‌ها", Icons.Default.Notifications, 5),
        Triple("مشاوره‌ها", Icons.Default.Chat, 6),
        Triple("تنظیمات", Icons.Default.Settings, 7),
    )

    // Messages
    LaunchedEffect(state.successMessage) {
        if (!state.successMessage.isNullOrEmpty()) {
            kotlinx.coroutines.delay(3000)
            viewModel.clearMessages()
        }
    }

    // Load data when tab changes
    LaunchedEffect(selectedTab) {
        when (selectedTab) {
            0 -> viewModel.loadDashboard()
            1 -> viewModel.loadAppointments()
            2 -> viewModel.loadClients()
            3 -> { viewModel.loadStaffUsers(); viewModel.loadStaffProfiles() }
            4 -> viewModel.loadGallery()
            5 -> { /* notification form – no load needed */ }
            6 -> { viewModel.loadChatRooms(); viewModel.loadStaffProfiles() }
            7 -> viewModel.loadSettings()
        }
    }

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = {
                        Text(
                            "پنل مدیریت سالن",
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, null, tint = Color.White)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Pink
                    )
                )
                // Horizontal scrollable tab row
                ScrollableTabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Pink,
                    contentColor = Color.White,
                    edgePadding = 8.dp,
                ) {
                    tabs.forEachIndexed { idx, (label, icon, _) ->
                        Tab(
                            selected = selectedTab == idx,
                            onClick = { selectedTab = idx },
                            text = {
                                Text(
                                    label,
                                    fontSize = 12.sp,
                                    fontWeight = if (selectedTab == idx) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            icon = { Icon(icon, null, modifier = Modifier.size(18.dp)) },
                            selectedContentColor = Color.White,
                            unselectedContentColor = Color.White.copy(0.6f),
                        )
                    }
                }
            }
        },
        snackbarHost = {
            Column {
                state.successMessage?.let { msg ->
                    Snackbar(
                        modifier = Modifier.padding(8.dp),
                        containerColor = Color(0xFF4CAF50),
                        contentColor = Color.White,
                    ) { Text(msg) }
                }
                state.error?.let { err ->
                    Snackbar(
                        modifier = Modifier.padding(8.dp),
                        containerColor = Color(0xFFD32F2F),
                        contentColor = Color.White,
                        action = { TextButton(onClick = viewModel::clearMessages) { Text("بستن", color = Color.White) } }
                    ) { Text(err) }
                }
            }
        }
    ) { padding ->
        Box(
            Modifier
                .fillMaxSize()
                .background(Background)
                .padding(padding)
        ) {
            if (state.isLoading) {
                LinearProgressIndicator(Modifier.fillMaxWidth(), color = Pink)
            }
            when (selectedTab) {
                0 -> AdminDashboardTab(state)
                1 -> AdminAppointmentsTab(state, viewModel)
                2 -> AdminClientsTab(state, viewModel)
                3 -> AdminStaffTab(state, viewModel)
                4 -> AdminGalleryTab(state, viewModel)
                5 -> AdminNotificationsTab(state, viewModel)
                6 -> AdminChatTab(state, viewModel)
                7 -> AdminSettingsTab(state, viewModel)
            }
        }
    }
}

// ═══════════════════════════════════════
//          TAB 1 — DASHBOARD
// ═══════════════════════════════════════
@Composable
private fun AdminDashboardTab(state: AdminUiState) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("خلاصه امروز", fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.padding(bottom = 4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatCard(Modifier.weight(1f), "📅", "رزروهای امروز", state.summary.todayAppointments.toString(), Pink)
                StatCard(Modifier.weight(1f), "⏳", "در انتظار تأیید", state.summary.pendingAppointments.toString(), Color(0xFFFF9800))
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatCard(Modifier.weight(1f), "👥", "مشتریان", state.summary.totalClients.toString(), Color(0xFF2196F3))
                StatCard(Modifier.weight(1f), "👩‍💼", "متخصصان", state.summary.totalStaff.toString(), Purple)
            }
        }
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1B5E20))
            ) {
                Row(
                    Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("💰 کل درآمد (تکمیل‌شده)", color = Color.White.copy(0.8f), fontSize = 12.sp)
                        Text(
                            "${state.summary.totalRevenue.toLong().toLocaleString()} تومان",
                            color = Color.White,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text("💵", fontSize = 36.sp)
                }
            }
        }
        item {
            Spacer(Modifier.height(4.dp))
            Text("مشتریان این ماه", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Spacer(Modifier.height(6.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                MiniStatCard(Modifier.weight(1f), "جدید", state.clientsStats.newThisMonth.toString(), Color(0xFF4CAF50))
                MiniStatCard(Modifier.weight(1f), "فعال", state.clientsStats.active.toString(), Color(0xFF2196F3))
                MiniStatCard(Modifier.weight(1f), "غیرفعال", state.clientsStats.inactive.toString(), Color(0xFFFF5722))
            }
        }
        if (state.recentAppointments.isNotEmpty()) {
            item {
                Spacer(Modifier.height(4.dp))
                Text("آخرین رزروها", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            }
            items(state.recentAppointments.take(6)) { appt ->
                AdminApptCard(appt, onStatusChange = null)
            }
        }
    }
}

@Composable
private fun StatCard(modifier: Modifier, emoji: String, label: String, value: String, color: Color) {
    Card(modifier = modifier, shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = color)) {
        Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(emoji, fontSize = 28.sp)
            Spacer(Modifier.height(4.dp))
            Text(value, color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(label, color = Color.White.copy(0.85f), fontSize = 11.sp, textAlign = TextAlign.Center)
        }
    }
}

@Composable
private fun MiniStatCard(modifier: Modifier, label: String, value: String, color: Color) {
    Card(modifier = modifier, shape = RoundedCornerShape(12.dp)) {
        Column(Modifier.padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = color)
            Text(label, fontSize = 11.sp, color = Color.Gray)
        }
    }
}

// ═══════════════════════════════════════
//       TAB 2 — APPOINTMENTS
// ═══════════════════════════════════════
@Composable
private fun AdminAppointmentsTab(state: AdminUiState, vm: AdminViewModel) {
    val filters = listOf("all" to "همه", "pending" to "در انتظار", "confirmed" to "تأیید شده", "completed" to "انجام شده", "cancelled" to "لغو شده")
    var cancelDialog by remember { mutableStateOf<String?>(null) }
    var cancelReason by remember { mutableStateOf("") }

    if (cancelDialog != null) {
        AlertDialog(
            onDismissRequest = { cancelDialog = null; cancelReason = "" },
            title = { Text("دلیل لغو (اختیاری)") },
            text = {
                OutlinedTextField(
                    value = cancelReason,
                    onValueChange = { cancelReason = it },
                    placeholder = { Text("دلیل...") },
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    vm.updateAppointmentStatus(cancelDialog!!, "cancelled", cancelReason.ifBlank { null })
                    cancelDialog = null; cancelReason = ""
                }) { Text("لغو رزرو", color = Color.Red) }
            },
            dismissButton = { TextButton(onClick = { cancelDialog = null }) { Text("انصراف") } }
        )
    }

    Column(Modifier.fillMaxSize()) {
        // Status filter chips
        Row(
            Modifier
                .fillMaxWidth()
                .padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            filters.forEach { (value, label) ->
                FilterChip(
                    selected = state.appointmentFilter == value,
                    onClick = { vm.loadAppointments(value) },
                    label = { Text(label, fontSize = 11.sp) }
                )
            }
        }
        if (state.appointments.isEmpty() && !state.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("هیچ رزروی یافت نشد", color = Color.Gray)
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(state.appointments) { appt ->
                    AdminApptCard(
                        appt = appt,
                        onStatusChange = { status ->
                            if (status == "cancelled") cancelDialog = appt.id
                            else vm.updateAppointmentStatus(appt.id, status)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun AdminApptCard(appt: AdminAppointmentDto, onStatusChange: ((String) -> Unit)?) {
    var expanded by remember { mutableStateOf(false) }
    val statusColor = when (appt.status) {
        "pending" -> Color(0xFFFF9800)
        "confirmed" -> Color(0xFF2196F3)
        "completed" -> Color(0xFF4CAF50)
        "cancelled" -> Color(0xFFF44336)
        else -> Color.Gray
    }
    val statusLabel = when (appt.status) {
        "pending" -> "در انتظار"
        "confirmed" -> "تأیید شده"
        "completed" -> "انجام شده"
        "cancelled" -> "لغو شده"
        else -> appt.status
    }

    Card(
        modifier = Modifier.fillMaxWidth().animateContentSize(),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(14.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(appt.service.name, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text("👩‍💼 ${appt.staff.fullName}", fontSize = 12.sp, color = Color.Gray)
                    appt.client?.let { Text("👤 ${it.fullName} — ${it.phone}", fontSize = 12.sp, color = Color.Gray) }
                    Text("📅 ${appt.date}  ⏰ ${appt.startTime}–${appt.endTime}", fontSize = 12.sp, color = Color.DarkGray)
                }
                Column(horizontalAlignment = Alignment.End) {
                    Badge(containerColor = statusColor) { Text(statusLabel, color = Color.White, fontSize = 11.sp) }
                    if (onStatusChange != null) {
                        TextButton(onClick = { expanded = !expanded }, contentPadding = PaddingValues(0.dp)) {
                            Text(if (expanded) "بستن" else "عملیات", fontSize = 12.sp, color = Pink)
                        }
                    }
                }
            }
            if (expanded && onStatusChange != null) {
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (appt.status == "pending") {
                        OutlinedButton(
                            onClick = { onStatusChange("confirmed"); expanded = false },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF2196F3))
                        ) { Text("تأیید", fontSize = 12.sp) }
                    }
                    if (appt.status in listOf("pending", "confirmed")) {
                        OutlinedButton(
                            onClick = { onStatusChange("completed"); expanded = false },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF4CAF50))
                        ) { Text("انجام شد", fontSize = 12.sp) }
                        OutlinedButton(
                            onClick = { onStatusChange("cancelled") },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.Red)
                        ) { Text("لغو", fontSize = 12.sp) }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════
//       TAB 3 — CLIENTS
// ═══════════════════════════════════════
@Composable
private fun AdminClientsTab(state: AdminUiState, vm: AdminViewModel) {
    var search by remember { mutableStateOf("") }
    var makeStaffDialog by remember { mutableStateOf<AdminUserDto?>(null) }
    var section by remember { mutableStateOf("") }

    makeStaffDialog?.let { user ->
        AlertDialog(
            onDismissRequest = { makeStaffDialog = null },
            title = { Text("ارتقا به متخصص") },
            text = {
                Column {
                    Text("کاربر «${user.fullName}» را به متخصص ارتقا می‌دهید.", fontSize = 13.sp)
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = section,
                        onValueChange = { section = it },
                        label = { Text("بخش تخصصی (مثال: مو، ناخن)") },
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            },
            confirmButton = {
                Button(onClick = {
                    vm.changeUserRole(user.id, "staff", section.ifBlank { null })
                    makeStaffDialog = null; section = ""
                }, colors = ButtonDefaults.buttonColors(containerColor = Pink)) { Text("ارتقا") }
            },
            dismissButton = { TextButton(onClick = { makeStaffDialog = null }) { Text("انصراف") } }
        )
    }

    Column(Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = search,
            onValueChange = { search = it },
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            placeholder = { Text("جستجو نام یا تلفن...") },
            leadingIcon = { Icon(Icons.Default.Search, null) },
            trailingIcon = {
                if (search.isNotEmpty()) IconButton(onClick = { search = ""; vm.loadClients("") }) {
                    Icon(Icons.Default.Clear, null)
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        LaunchedEffect(search) {
            kotlinx.coroutines.delay(500)
            vm.loadClients(search)
        }

        if (state.clients.isEmpty() && !state.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("مشتریان یافت نشد", color = Color.Gray)
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.clients) { user ->
                    AdminUserCard(
                        user = user,
                        onToggleActive = { vm.toggleUserActive(user.id) },
                        onMakeStaff = if (user.role == "client") ({ makeStaffDialog = user }) else null
                    )
                }
            }
        }
    }
}

@Composable
private fun AdminUserCard(user: AdminUserDto, onToggleActive: () -> Unit, onMakeStaff: (() -> Unit)?) {
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), elevation = CardDefaults.cardElevation(1.dp)) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(44.dp).background(PinkLight, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(user.fullName.firstOrNull()?.toString() ?: "؟", fontWeight = FontWeight.Bold, color = Pink)
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(user.fullName, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    Spacer(Modifier.width(6.dp))
                    if (!user.isActive) {
                        Badge(containerColor = Color(0xFFEF9A9A)) { Text("غیرفعال", color = Color.White, fontSize = 10.sp) }
                    }
                }
                Text(user.phone, fontSize = 12.sp, color = Color.Gray)
                if (user.loyaltyPoints > 0) Text("⭐ ${user.loyaltyPoints} امتیاز", fontSize = 11.sp, color = Color(0xFFFF9800))
            }
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                IconButton(onClick = onToggleActive, modifier = Modifier.size(36.dp)) {
                    Icon(
                        if (user.isActive) Icons.Default.Block else Icons.Default.CheckCircle,
                        null,
                        tint = if (user.isActive) Color(0xFFFF5722) else Color(0xFF4CAF50),
                        modifier = Modifier.size(20.dp)
                    )
                }
                onMakeStaff?.let {
                    IconButton(onClick = it, modifier = Modifier.size(36.dp)) {
                        Icon(Icons.Default.PersonAdd, null, tint = Purple, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════
//       TAB 4 — STAFF MANAGEMENT
// ═══════════════════════════════════════
@Composable
private fun AdminStaffTab(state: AdminUiState, vm: AdminViewModel) {
    var showCreateDialog by remember { mutableStateOf(false) }
    var newName by remember { mutableStateOf("") }
    var newPhone by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var newSection by remember { mutableStateOf("") }
    var resetPasswordDialog by remember { mutableStateOf<AdminUserDto?>(null) }
    var newPass by remember { mutableStateOf("") }

    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text("ساخت حساب متخصص جدید", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(newName, { newName = it }, label = { Text("نام کامل *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(newPhone, { newPhone = it }, label = { Text("شماره تلفن *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(newPassword, { newPassword = it }, label = { Text("رمز عبور *") }, modifier = Modifier.fillMaxWidth(), singleLine = true, visualTransformation = PasswordVisualTransformation())
                    OutlinedTextField(newSection, { newSection = it }, label = { Text("بخش تخصصی (مثلاً: مو)") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newName.isNotBlank() && newPhone.isNotBlank() && newPassword.isNotBlank()) {
                            vm.createStaffUser(newName, newPhone, newPassword, newSection.ifBlank { null })
                            showCreateDialog = false; newName = ""; newPhone = ""; newPassword = ""; newSection = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Pink)
                ) { Text("ساخت") }
            },
            dismissButton = { TextButton(onClick = { showCreateDialog = false }) { Text("انصراف") } }
        )
    }

    resetPasswordDialog?.let { user ->
        AlertDialog(
            onDismissRequest = { resetPasswordDialog = null; newPass = "" },
            title = { Text("تغییر رمز: ${user.fullName}") },
            text = {
                OutlinedTextField(newPass, { newPass = it }, label = { Text("رمز جدید") }, modifier = Modifier.fillMaxWidth(), singleLine = true, visualTransformation = PasswordVisualTransformation())
            },
            confirmButton = {
                Button(onClick = {
                    if (newPass.isNotBlank()) { vm.resetUserPassword(user.id, newPass); resetPasswordDialog = null; newPass = "" }
                }, colors = ButtonDefaults.buttonColors(containerColor = Pink)) { Text("تغییر") }
            },
            dismissButton = { TextButton(onClick = { resetPasswordDialog = null }) { Text("انصراف") } }
        )
    }

    Column(Modifier.fillMaxSize()) {
        Button(
            onClick = { showCreateDialog = true },
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Pink),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.PersonAdd, null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("ساخت حساب متخصص جدید")
        }

        if (state.staffUsers.isEmpty() && !state.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("هنوز هیچ متخصصی ثبت نشده", color = Color.Gray)
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(state.staffUsers) { user ->
                    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), elevation = CardDefaults.cardElevation(1.dp)) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                Modifier.size(44.dp).background(
                                    if (user.role == "admin") Color(0xFF7E57C2).copy(0.2f) else PinkLight,
                                    CircleShape
                                ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(user.fullName.firstOrNull()?.toString() ?: "؟", fontWeight = FontWeight.Bold, color = if (user.role == "admin") Color(0xFF7E57C2) else Pink)
                            }
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(user.fullName, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                    Badge(containerColor = if (user.role == "admin") Color(0xFF7E57C2) else Pink) {
                                        Text(if (user.role == "admin") "ادمین" else "متخصص", color = Color.White, fontSize = 10.sp)
                                    }
                                    if (!user.isActive) Badge(containerColor = Color(0xFFEF9A9A)) { Text("غیرفعال", color = Color.White, fontSize = 10.sp) }
                                }
                                Text(user.phone, fontSize = 12.sp, color = Color.Gray)
                                user.staffSection?.let { Text("بخش: $it", fontSize = 11.sp, color = Purple) }
                            }
                            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                IconButton(onClick = { vm.toggleUserActive(user.id); vm.loadStaffUsers() }, modifier = Modifier.size(32.dp)) {
                                    Icon(
                                        if (user.isActive) Icons.Default.Block else Icons.Default.CheckCircle,
                                        null,
                                        tint = if (user.isActive) Color(0xFFFF5722) else Color(0xFF4CAF50),
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                                IconButton(onClick = { resetPasswordDialog = user }, modifier = Modifier.size(32.dp)) {
                                    Icon(Icons.Default.Lock, null, tint = Color.Gray, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════
//       TAB 5 — GALLERY
// ═══════════════════════════════════════
@Composable
private fun AdminGalleryTab(state: AdminUiState, vm: AdminViewModel) {
    var showCreateDialog by remember { mutableStateOf(false) }
    var newTitle by remember { mutableStateOf("") }
    var newImageUrl by remember { mutableStateOf("") }
    var newStaffName by remember { mutableStateOf("") }
    var newDesc by remember { mutableStateOf("") }
    var deleteConfirm by remember { mutableStateOf<AdminGalleryItemDto?>(null) }

    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text("افزودن آیتم به گالری", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(newTitle, { newTitle = it }, label = { Text("عنوان *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(newImageUrl, { newImageUrl = it }, label = { Text("لینک تصویر *") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(newStaffName, { newStaffName = it }, label = { Text("نام متخصص") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
                    OutlinedTextField(newDesc, { newDesc = it }, label = { Text("توضیحات") }, modifier = Modifier.fillMaxWidth(), maxLines = 3)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newTitle.isNotBlank() && newImageUrl.isNotBlank()) {
                            vm.createGalleryItem(newTitle, newImageUrl, newStaffName.ifBlank { null }, newDesc.ifBlank { null })
                            showCreateDialog = false; newTitle = ""; newImageUrl = ""; newStaffName = ""; newDesc = ""
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Pink)
                ) { Text("افزودن") }
            },
            dismissButton = { TextButton(onClick = { showCreateDialog = false }) { Text("انصراف") } }
        )
    }

    deleteConfirm?.let { item ->
        AlertDialog(
            onDismissRequest = { deleteConfirm = null },
            title = { Text("حذف آیتم") },
            text = { Text("آیا «${item.title}» حذف شود؟") },
            confirmButton = { TextButton(onClick = { vm.deleteGalleryItem(item.id); deleteConfirm = null }) { Text("حذف", color = Color.Red) } },
            dismissButton = { TextButton(onClick = { deleteConfirm = null }) { Text("انصراف") } }
        )
    }

    Column(Modifier.fillMaxSize()) {
        Button(
            onClick = { showCreateDialog = true },
            modifier = Modifier.fillMaxWidth().padding(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Pink),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(Icons.Default.Add, null, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("افزودن آیتم به گالری")
        }

        LazyColumn(
            contentPadding = PaddingValues(horizontal = 12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(state.galleryItems) { item ->
                Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), elevation = CardDefaults.cardElevation(1.dp)) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(48.dp).background(PinkLight, RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) {
                            Text("🖼️", fontSize = 22.sp)
                        }
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(item.title, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            item.staffName?.let { Text("متخصص: $it", fontSize = 12.sp, color = Color.Gray) }
                            Row {
                                Text("👁 ${item.viewsCount}", fontSize = 11.sp, color = Color.Gray)
                                Spacer(Modifier.width(8.dp))
                                Text("❤️ ${item.likesCount}", fontSize = 11.sp, color = Color.Gray)
                                if (!item.isActive) {
                                    Spacer(Modifier.width(6.dp))
                                    Text("(آرشیو)", fontSize = 11.sp, color = Color(0xFFFF7043))
                                }
                            }
                        }
                        IconButton(onClick = { deleteConfirm = item }) {
                            Icon(Icons.Default.Delete, null, tint = Color(0xFFD32F2F))
                        }
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════
//      TAB 6 — NOTIFICATIONS
// ═══════════════════════════════════════
@Composable
private fun AdminNotificationsTab(state: AdminUiState, vm: AdminViewModel) {
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF3E0))
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("📢 ارسال اعلان عمومی", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFFE65100))
                Text("این اعلان برای تمام کاربران فعال ارسال می‌شود.", fontSize = 12.sp, color = Color.Gray)
            }
        }

        OutlinedTextField(
            value = state.broadcastTitle,
            onValueChange = vm::setBroadcastTitle,
            label = { Text("عنوان اعلان *") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            shape = RoundedCornerShape(12.dp)
        )

        OutlinedTextField(
            value = state.broadcastMessage,
            onValueChange = vm::setBroadcastMessage,
            label = { Text("متن اعلان *") },
            modifier = Modifier.fillMaxWidth().height(140.dp),
            maxLines = 6,
            shape = RoundedCornerShape(12.dp)
        )

        Button(
            onClick = vm::broadcastNotification,
            modifier = Modifier.fillMaxWidth(),
            enabled = state.broadcastTitle.isNotBlank() && state.broadcastMessage.isNotBlank() && !state.isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = Pink),
            shape = RoundedCornerShape(14.dp)
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
            } else {
                Icon(Icons.Default.Send, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("ارسال به همه کاربران", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
        }

        // Example templates
        Text("قالب‌های آماده:", fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
        listOf(
            "تخفیف ویژه" to "🎉 تخفیف ${30}% برای رزرو در این هفته! همین الان رزرو کنید.",
            "اطلاعیه تعطیلی" to "📢 سالن روز ${""} تعطیل می‌باشد. از صبوری شما سپاسگزاریم.",
            "خدمات جدید" to "✨ خدمات جدید به سالن اضافه شد! همین الان مشاهده کنید.",
        ).forEach { (title, msg) ->
            OutlinedButton(
                onClick = { vm.setBroadcastTitle(title); vm.setBroadcastMessage(msg) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp)
            ) {
                Column(Modifier.fillMaxWidth()) {
                    Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Pink)
                    Text(msg, fontSize = 11.sp, color = Color.Gray, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}

// ═══════════════════════════════════════
//       TAB 7 — CHAT MANAGEMENT
// ═══════════════════════════════════════
@Composable
private fun AdminChatTab(state: AdminUiState, vm: AdminViewModel) {
    var assignDialog by remember { mutableStateOf<AdminChatRoomDto?>(null) }

    assignDialog?.let { room ->
        var selectedStaff by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { assignDialog = null },
            title = { Text("اختصاص متخصص") },
            text = {
                Column {
                    Text("اتاق مشاوره: ${room.client?.fullName ?: "ناشناس"}", fontSize = 13.sp)
                    Spacer(Modifier.height(8.dp))
                    if (state.staffProfiles.isEmpty()) {
                        Text("متخصصی یافت نشد", color = Color.Gray)
                    } else {
                        state.staffProfiles.forEach { staff ->
                            Row(
                                Modifier.fillMaxWidth().clickable { selectedStaff = staff.id }.padding(vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(selected = selectedStaff == staff.id, onClick = { selectedStaff = staff.id })
                                Text("${staff.fullName} — ${staff.section ?: ""}", fontSize = 13.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (selectedStaff.isNotBlank()) {
                            vm.assignStaffToRoom(room.id, selectedStaff)
                            assignDialog = null
                        }
                    },
                    enabled = selectedStaff.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = Pink)
                ) { Text("اختصاص") }
            },
            dismissButton = { TextButton(onClick = { assignDialog = null }) { Text("انصراف") } }
        )
    }

    if (state.chatRooms.isEmpty() && !state.isLoading) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("💬", fontSize = 48.sp)
                Spacer(Modifier.height(8.dp))
                Text("هیچ اتاق مشاوره‌ای وجود ندارد", color = Color.Gray)
            }
        }
    } else {
        LazyColumn(
            contentPadding = PaddingValues(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(state.chatRooms) { room ->
                ChatRoomCard(room = room, onAssign = { assignDialog = room })
            }
        }
    }
}

@Composable
private fun ChatRoomCard(room: AdminChatRoomDto, onAssign: () -> Unit) {
    val statusColor = when (room.status) {
        "pending" -> Color(0xFFFF9800)
        "open" -> Color(0xFF4CAF50)
        "closed" -> Color.Gray
        else -> Color.Gray
    }
    Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(14.dp), elevation = CardDefaults.cardElevation(1.dp)) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(room.client?.fullName ?: "ناشناس", fontWeight = FontWeight.SemiBold)
                    Badge(containerColor = statusColor) {
                        Text(
                            when (room.status) { "pending" -> "در انتظار"; "open" -> "باز"; else -> "بسته" },
                            color = Color.White, fontSize = 10.sp
                        )
                    }
                    if (room.unreadStaffCount > 0) Badge(containerColor = Pink) { Text("${room.unreadStaffCount} جدید", color = Color.White, fontSize = 10.sp) }
                }
                room.client?.phone?.let { Text(it, fontSize = 12.sp, color = Color.Gray) }
                room.subject?.let { Text("موضوع: $it", fontSize = 12.sp, color = Color.Gray) }
                room.staff?.let { Text("متخصص: ${it.fullName}", fontSize = 12.sp, color = Purple) }
                    ?: Text("متخصص اختصاص نیافته", fontSize = 12.sp, color = Color(0xFFFF9800))
            }
            if (room.status != "closed") {
                OutlinedButton(
                    onClick = onAssign,
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                ) { Text("اختصاص", fontSize = 12.sp, color = Pink) }
            }
        }
    }
}

// ═══════════════════════════════════════
//       TAB 8 — SETTINGS
// ═══════════════════════════════════════
@Composable
private fun AdminSettingsTab(state: AdminUiState, vm: AdminViewModel) {
    var salonName by remember(state.settings) { mutableStateOf(state.settings["salon_name"] ?: "") }
    var salonPhone by remember(state.settings) { mutableStateOf(state.settings["salon_phone"] ?: "") }
    var salonAddress by remember(state.settings) { mutableStateOf(state.settings["salon_address"] ?: "") }
    var workingHours by remember(state.settings) { mutableStateOf(state.settings["salon_working_hours"] ?: "") }
    var ownerName by remember(state.settings) { mutableStateOf(state.settings["owner_name"] ?: "") }
    var instagram by remember(state.settings) { mutableStateOf(state.settings["instagram_link"] ?: "") }
    var telegram by remember(state.settings) { mutableStateOf(state.settings["telegram_link"] ?: "") }
    var cancelHours by remember(state.settings) { mutableStateOf(state.settings["cancel_before_hours"] ?: "24") }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text("⚙️ اطلاعات سالن", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Pink)

        SettingField("نام سالن", salonName) { salonName = it }
        SettingField("شماره تلفن سالن", salonPhone) { salonPhone = it }
        SettingField("آدرس", salonAddress) { salonAddress = it }
        SettingField("ساعات کاری", workingHours, maxLines = 3) { workingHours = it }
        SettingField("نام مالک/مدیر", ownerName) { ownerName = it }

        Divider()
        Text("🔗 شبکه‌های اجتماعی", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Purple)
        SettingField("لینک اینستاگرام", instagram) { instagram = it }
        SettingField("لینک تلگرام", telegram) { telegram = it }

        Divider()
        Text("📋 قوانین رزرو", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color(0xFF1976D2))
        SettingField("حداقل ساعت قبل از لغو رزرو", cancelHours) { cancelHours = it }

        Spacer(Modifier.height(8.dp))
        Button(
            onClick = {
                vm.saveSettings(mapOf(
                    "salon_name" to salonName,
                    "salon_phone" to salonPhone,
                    "salon_address" to salonAddress,
                    "salon_working_hours" to workingHours,
                    "owner_name" to ownerName,
                    "instagram_link" to instagram,
                    "telegram_link" to telegram,
                    "cancel_before_hours" to cancelHours,
                ))
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = !state.isLoading,
            colors = ButtonDefaults.buttonColors(containerColor = Pink),
            shape = RoundedCornerShape(14.dp)
        ) {
            if (state.isLoading) {
                CircularProgressIndicator(Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
            } else {
                Icon(Icons.Default.Save, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("ذخیره تنظیمات", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun SettingField(label: String, value: String, maxLines: Int = 1, onChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label, fontSize = 13.sp) },
        modifier = Modifier.fillMaxWidth(),
        maxLines = maxLines,
        shape = RoundedCornerShape(12.dp)
    )
}

// Helper extension
private fun Long.toLocaleString(): String {
    return toString().reversed().chunked(3).joinToString(",").reversed()
}
