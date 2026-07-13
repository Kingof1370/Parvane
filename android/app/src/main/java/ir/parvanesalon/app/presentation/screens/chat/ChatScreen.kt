package ir.parvanesalon.app.presentation.screens.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Send
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
import ir.parvanesalon.app.data.remote.models.ChatMessageDto
import ir.parvanesalon.app.data.remote.models.ChatRoomDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(viewModel: ChatViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()
    var showCreateDialog by remember { mutableStateOf(false) }

    if (uiState.selectedRoom != null) {
        ChatRoomScreen(
            room = uiState.selectedRoom!!,
            messages = uiState.messages,
            isLoading = uiState.messagesLoading,
            onSend = { viewModel.sendMessage(it) },
            onBack = { viewModel.selectRoom(uiState.selectedRoom!!).let { } }
        )
    } else {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFFAF7FF))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0))))
                    .padding(20.dp)
            ) {
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("مشاوره آنلاین", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        Text("چت با متخصصان ما", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
                    }
                    FloatingActionButton(
                        onClick = { showCreateDialog = true },
                        containerColor = Color.White,
                        contentColor = Color(0xFFE91E8C),
                        modifier = Modifier.size(40.dp),
                        elevation = FloatingActionButtonDefaults.elevation(0.dp)
                    ) {
                        Icon(Icons.Default.Add, null, modifier = Modifier.size(20.dp))
                    }
                }
            }

            if (uiState.isLoading) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Color(0xFFE91E8C))
                }
            } else if (uiState.rooms.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("💬", fontSize = 64.sp)
                        Spacer(Modifier.height(16.dp))
                        Text("هنوز گفتگویی ندارید", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Spacer(Modifier.height(8.dp))
                        Text("برای دریافت مشاوره با متخصصان چت کنید", color = Color.Gray, fontSize = 14.sp)
                        Spacer(Modifier.height(24.dp))
                        Button(
                            onClick = { showCreateDialog = true },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE91E8C)),
                            shape = RoundedCornerShape(14.dp)
                        ) { Text("شروع گفتگو", color = Color.White) }
                    }
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(uiState.rooms) { room ->
                        ChatRoomCard(room = room, onClick = { viewModel.selectRoom(room) })
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        var subject by remember { mutableStateOf("") }
        var category by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text("گفتگوی جدید") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        label = { Text("موضوع (اختیاری)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                    OutlinedTextField(
                        value = category,
                        onValueChange = { category = it },
                        label = { Text("نوع سرویس (مثلاً: مو، ناخن)") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.createRoom(subject.ifBlank { null }, category.ifBlank { null })
                        showCreateDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE91E8C))
                ) { Text("شروع گفتگو", color = Color.White) }
            },
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) { Text("انصراف") }
            }
        )
    }
}

@Composable
private fun ChatRoomCard(room: ChatRoomDto, onClick: () -> Unit) {
    val statusColor = when (room.status) {
        "open" -> Color(0xFF4CAF50)
        "closed" -> Color.Gray
        else -> Color(0xFFFF9800)
    }
    val statusLabel = when (room.status) {
        "open" -> "باز"
        "closed" -> "بسته"
        else -> "در انتظار"
    }

    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0))), RoundedCornerShape(14.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("💬", fontSize = 24.sp)
            }
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                    Text(room.subject ?: "مشاوره", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Text(statusLabel, fontSize = 12.sp, color = statusColor)
                }
                if (room.staff != null) {
                    Text("متخصص: ${room.staff.fullName}", fontSize = 13.sp, color = Color(0xFFE91E8C))
                } else {
                    Text("در انتظار اختصاص متخصص", fontSize = 13.sp, color = Color.Gray)
                }
                if (room.serviceCategory != null) {
                    Text(room.serviceCategory, fontSize = 12.sp, color = Color.Gray)
                }
                if (room.unreadClientCount > 0) {
                    Spacer(Modifier.height(4.dp))
                    Surface(color = Color(0xFFE91E8C), shape = RoundedCornerShape(12.dp)) {
                        Text(
                            "${room.unreadClientCount} پیام جدید",
                            color = Color.White,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChatRoomScreen(
    room: ChatRoomDto,
    messages: List<ChatMessageDto>,
    isLoading: Boolean,
    onSend: (String) -> Unit,
    onBack: () -> Unit,
) {
    var messageText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    Column(Modifier.fillMaxSize().background(Color(0xFFFAF7FF))) {
        TopAppBar(
            title = {
                Column {
                    Text(room.subject ?: "مشاوره", fontWeight = FontWeight.Bold)
                    Text(room.staff?.fullName ?: "در انتظار متخصص", fontSize = 12.sp, color = Color.Gray)
                }
            },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowForward, null)
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
        )

        if (isLoading) {
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFFE91E8C))
            }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.weight(1f),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages) { msg ->
                    val isClient = msg.senderType == "client"
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isClient) Arrangement.End else Arrangement.Start
                    ) {
                        Box(
                            modifier = Modifier
                                .widthIn(max = 280.dp)
                                .background(
                                    if (isClient) Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0)))
                                    else Brush.horizontalGradient(listOf(Color(0xFFF5F5F5), Color(0xFFF5F5F5))),
                                    RoundedCornerShape(
                                        topStart = 16.dp, topEnd = 16.dp,
                                        bottomStart = if (isClient) 16.dp else 4.dp,
                                        bottomEnd = if (isClient) 4.dp else 16.dp
                                    )
                                )
                                .padding(12.dp)
                        ) {
                            Column {
                                Text(
                                    msg.content,
                                    color = if (isClient) Color.White else Color.Black,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                }
            }
        }

        if (room.status != "closed") {
            Row(
                Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedTextField(
                    value = messageText,
                    onValueChange = { messageText = it },
                    placeholder = { Text("پیام بنویسید...", fontSize = 14.sp) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(16.dp),
                    singleLine = false,
                    maxLines = 3,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFFE91E8C)
                    )
                )
                IconButton(
                    onClick = {
                        if (messageText.isNotBlank()) {
                            onSend(messageText.trim())
                            messageText = ""
                        }
                    },
                    modifier = Modifier
                        .size(48.dp)
                        .background(
                            Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0))),
                            RoundedCornerShape(14.dp)
                        )
                ) {
                    Icon(Icons.Default.Send, null, tint = Color.White)
                }
            }
        } else {
            Box(
                Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF5F5F5))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("این گفتگو بسته شده است", color = Color.Gray, fontSize = 14.sp)
            }
        }
    }
}
