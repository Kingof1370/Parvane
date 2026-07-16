package ir.parvanesalon.app.presentation.screens.booking

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
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
import coil.compose.AsyncImage

enum class TimeRangePref(val label: String, val value: String) {
    ANY("هر ساعت", "any"),
    MORNING("صبح (۸-۱۲)", "morning"),
    AFTERNOON("بعد از ظهر (۱۲-۱۷)", "afternoon"),
    EVENING("عصر (۱۷-۲۱)", "evening"),
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingScreen(
    staffId: String,
    serviceId: String? = null,
    selectedStyleImageUrl: String? = null,
    selectedStyleGalleryId: String? = null,
    onBack: () -> Unit,
    onSuccess: () -> Unit,
    viewModel: BookingViewModel = hiltViewModel()
) {
    LaunchedEffect(staffId, serviceId) { viewModel.init(staffId, serviceId) }
    if (selectedStyleImageUrl != null) viewModel.setSelectedStyle(selectedStyleGalleryId, selectedStyleImageUrl)

    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.success) {
        if (uiState.success) onSuccess()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7FF)),
        contentPadding = PaddingValues(bottom = 32.dp)
    ) {
        item {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0))))
                    .padding(20.dp)
            ) {
                IconButton(onClick = onBack, modifier = Modifier.align(Alignment.CenterStart)) {
                    Icon(Icons.Default.ArrowForward, null, tint = Color.White)
                }
                Text(
                    "رزرو نوبت",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }

        // Selected style preview
        if (uiState.selectedStyleImageUrl != null) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(
                            model = uiState.selectedStyleImageUrl,
                            contentDescription = null,
                            modifier = Modifier.size(60.dp).background(Color.Gray, RoundedCornerShape(10.dp))
                        )
                        Spacer(Modifier.width(12.dp))
                        Column {
                            Text("استایل انتخابی", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("مدل مورد نظر شما انتخاب شده است", fontSize = 12.sp, color = Color.Gray)
                        }
                    }
                }
            }
        }

        // Service selection
        item {
            SectionTitle("انتخاب سرویس")
            if (uiState.services.isEmpty()) {
                Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(modifier = Modifier.size(24.dp), color = Color(0xFFE91E8C))
                }
            } else {
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(uiState.services) { svc ->
                        val selected = uiState.selectedServiceId == svc.id
                        Card(
                            modifier = Modifier
                                .width(160.dp)
                                .clickable { viewModel.selectService(svc.id) }
                                .border(
                                    if (selected) 2.dp else 0.dp,
                                    if (selected) Color(0xFFE91E8C) else Color.Transparent,
                                    RoundedCornerShape(14.dp)
                                ),
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = if (selected) Color(0xFFFCF0F8) else Color.White)
                        ) {
                            Column(Modifier.padding(14.dp)) {
                                Text(svc.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 2)
                                Spacer(Modifier.height(4.dp))
                                Text("${svc.durationMinutes} دقیقه", fontSize = 12.sp, color = Color.Gray)
                                Text(
                                    "${svc.price.toLong().format()} تومان",
                                    fontSize = 13.sp,
                                    color = Color(0xFFE91E8C),
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }

        // Date selection
        item {
            SectionTitle("انتخاب تاریخ")
            LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                items(uiState.availableDates) { dateInfo ->
                    val selected = uiState.selectedDate == dateInfo.isoDate
                    Card(
                        modifier = Modifier
                            .width(80.dp)
                            .clickable { viewModel.selectDate(dateInfo.isoDate) }
                            .border(
                                if (selected) 2.dp else 0.dp,
                                if (selected) Color(0xFFE91E8C) else Color.Transparent,
                                RoundedCornerShape(14.dp)
                            ),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = if (selected) Color(0xFFFCF0F8) else Color.White)
                    ) {
                        Column(
                            Modifier.padding(10.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(dateInfo.dayName, fontSize = 12.sp, color = if (selected) Color(0xFFE91E8C) else Color.Gray)
                            Text(dateInfo.dayNum, fontWeight = FontWeight.Bold, fontSize = 18.sp, color = if (selected) Color(0xFFE91E8C) else Color.Black)
                            Text(dateInfo.monthName, fontSize = 11.sp, color = Color.Gray)
                        }
                    }
                }
            }
        }

        // Time range preference
        item {
            SectionTitle("بازه زمانی ترجیحی")
            LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(TimeRangePref.entries) { pref ->
                    FilterChip(
                        selected = uiState.timeRangePreference == pref.value,
                        onClick = { viewModel.setTimeRange(pref.value) },
                        label = { Text(pref.label, fontSize = 13.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFFE91E8C),
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
        }

        // Time slots
        item {
            SectionTitle("انتخاب ساعت")
            if (uiState.slotsLoading) {
                Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(modifier = Modifier.size(28.dp), color = Color(0xFFE91E8C))
                }
            } else if (uiState.slots.isEmpty() && uiState.selectedDate != null) {
                Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    Text("زمان خالی در این روز وجود ندارد", color = Color.Gray)
                }
            } else {
                val filteredSlots = when (uiState.timeRangePreference) {
                    "morning" -> uiState.slots.filter { it < "12:00" }
                    "afternoon" -> uiState.slots.filter { it >= "12:00" && it < "17:00" }
                    "evening" -> uiState.slots.filter { it >= "17:00" }
                    else -> uiState.slots
                }
                val chunked = filteredSlots.chunked(4)
                chunked.forEach { row ->
                    Row(
                        Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        row.forEach { slot ->
                            val sel = uiState.selectedTime == slot
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { viewModel.selectTime(slot) }
                                    .background(
                                        if (sel) Color(0xFFE91E8C) else Color.White,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .border(1.dp, if (sel) Color(0xFFE91E8C) else Color(0xFFEEEEEE), RoundedCornerShape(12.dp))
                                    .padding(vertical = 10.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(slot, fontSize = 14.sp, color = if (sel) Color.White else Color.Black, fontWeight = if (sel) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                        repeat(4 - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
            }
        }

        // Notes
        item {
            SectionTitle("یادداشت (اختیاری)")
            OutlinedTextField(
                value = uiState.notes,
                onValueChange = { viewModel.setNotes(it) },
                placeholder = { Text("توضیحاتی برای متخصص بنویسید...", fontSize = 14.sp) },
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                shape = RoundedCornerShape(14.dp),
                minLines = 3,
                maxLines = 5,
                colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Color(0xFFE91E8C))
            )
        }

        // Pre-payment option
        item {
            Spacer(Modifier.height(12.dp))
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Row(
                    Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("پیش‌پرداخت رزرو 💳", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("با پرداخت پیش‌پرداخت، نوبت تأیید می‌شود", fontSize = 12.sp, color = Color.Gray)
                    }
                    Switch(
                        checked = uiState.requirePrePayment,
                        onCheckedChange = { viewModel.togglePrePayment(it) },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = Color(0xFFE91E8C))
                    )
                }
            }
        }

        // Error message
        if (uiState.error != null) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
                ) {
                    Text(uiState.error!!, color = Color(0xFFD32F2F), modifier = Modifier.padding(12.dp), fontSize = 13.sp)
                }
            }
        }

        // Submit button
        item {
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = { viewModel.submit() },
                enabled = uiState.selectedServiceId != null && uiState.selectedDate != null && uiState.selectedTime != null && !uiState.isLoading,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE91E8C))
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                } else {
                    Text("ثبت رزرو", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(
        title,
        fontWeight = FontWeight.Bold,
        fontSize = 16.sp,
        modifier = Modifier.padding(start = 16.dp, top = 20.dp, bottom = 10.dp)
    )
}

private fun Long.format() = "%,d".format(this).replace(',', '،')
