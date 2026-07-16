package ir.parvanesalon.app.presentation.screens.auth

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import ir.parvanesalon.app.R
import ir.parvanesalon.app.presentation.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onSuccess: () -> Unit,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    // Tab state: 0 = ورود, 1 = ثبت‌نام
    var selectedTab by remember { mutableStateOf(0) }

    // Login fields
    var loginPhone by remember { mutableStateOf("") }
    var loginPassword by remember { mutableStateOf("") }
    var loginPasswordVisible by remember { mutableStateOf(false) }

    // Register fields
    var regFullName by remember { mutableStateOf("") }
    var regPhone by remember { mutableStateOf("") }
    var regEmail by remember { mutableStateOf("") }
    var regPassword by remember { mutableStateOf("") }
    var regConfirmPassword by remember { mutableStateOf("") }
    var regPasswordVisible by remember { mutableStateOf(false) }
    var regConfirmPasswordVisible by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.isAuthenticated) {
        if (uiState.isAuthenticated) onSuccess()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(GradientStart, GradientMid),
                    endY = 500f
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
        ) {
            // ===== هدر: عکس صاحب سالن + نام کامل =====
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 56.dp, bottom = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // عکس دایره‌ای صاحب سالن
                Box(
                    modifier = Modifier
                        .size(110.dp)
                        .clip(CircleShape)
                        .border(
                            width = 3.dp,
                            color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.5f),
                            shape = CircleShape
                        )
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.owner_photo),
                        contentDescription = "پروانه اکبرپور - مدیر سالن",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                Spacer(Modifier.height(16.dp))

                // نام کامل سالن
                Text(
                    text = "سالن زیبایی پروانه اکبرپور",
                    style = MaterialTheme.typography.headlineSmall.copy(
                        color = MaterialTheme.colorScheme.onPrimary,
                        fontWeight = FontWeight.Bold,
                        fontSize = 22.sp
                    )
                )

                Spacer(Modifier.height(4.dp))

                Text(
                    text = "خوش آمدید",
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.85f)
                    )
                )
            }

            // ===== کارت فرم ورود / ثبت‌نام =====
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.extraLarge.copy(
                    bottomStart = androidx.compose.foundation.shape.ZeroCornerSize,
                    bottomEnd = androidx.compose.foundation.shape.ZeroCornerSize
                ),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(modifier = Modifier.padding(24.dp)) {

                    // Tabs
                    TabRow(
                        selectedTabIndex = selectedTab,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Tab(
                            selected = selectedTab == 1,
                            onClick = { selectedTab = 1; viewModel.clearError() },
                            text = {
                                Text(
                                    "ثبت‌نام",
                                    fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        )
                        Tab(
                            selected = selectedTab == 0,
                            onClick = { selectedTab = 0; viewModel.clearError() },
                            text = {
                                Text(
                                    "ورود",
                                    fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        )
                    }

                    Spacer(Modifier.height(24.dp))

                    // نمایش خطا
                    AnimatedVisibility(visible = uiState.error != null) {
                        uiState.error?.let { errorMsg ->
                            Column {
                                Card(
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.errorContainer
                                    ),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        errorMsg,
                                        modifier = Modifier.padding(12.dp),
                                        color = MaterialTheme.colorScheme.onErrorContainer,
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                                Spacer(Modifier.height(12.dp))
                            }
                        }
                    }

                    AnimatedContent(targetState = selectedTab, label = "auth_tab") { tab ->
                        if (tab == 0) {
                            // ===== تب ورود =====
                            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                Text(
                                    "ورود به حساب کاربری",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold
                                    )
                                )

                                OutlinedTextField(
                                    value = loginPhone,
                                    onValueChange = { if (it.length <= 11) loginPhone = it },
                                    label = { Text("شماره موبایل") },
                                    leadingIcon = { Icon(Icons.Default.Phone, null) },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                    supportingText = { Text("مثال: 09123456789") }
                                )

                                OutlinedTextField(
                                    value = loginPassword,
                                    onValueChange = { loginPassword = it },
                                    label = { Text("رمز عبور") },
                                    leadingIcon = { Icon(Icons.Default.Lock, null) },
                                    trailingIcon = {
                                        IconButton(onClick = { loginPasswordVisible = !loginPasswordVisible }) {
                                            Icon(
                                                if (loginPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                                null
                                            )
                                        }
                                    },
                                    visualTransformation = if (loginPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Button(
                                    onClick = { viewModel.login(loginPhone, loginPassword) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(52.dp),
                                    enabled = loginPhone.isNotBlank() && loginPassword.isNotBlank() && !uiState.isLoading
                                ) {
                                    if (uiState.isLoading) {
                                        CircularProgressIndicator(
                                            Modifier.size(20.dp),
                                            color = MaterialTheme.colorScheme.onPrimary,
                                            strokeWidth = 2.dp
                                        )
                                    } else {
                                        Text("ورود", fontWeight = FontWeight.SemiBold)
                                    }
                                }

                                TextButton(
                                    onClick = { selectedTab = 1; viewModel.clearError() },
                                    modifier = Modifier.align(Alignment.CenterHorizontally)
                                ) {
                                    Text("حساب کاربری ندارید؟ ثبت‌نام کنید")
                                }
                            }
                        } else {
                            // ===== تب ثبت‌نام =====
                            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                Text(
                                    "ایجاد حساب کاربری جدید",
                                    style = MaterialTheme.typography.titleMedium.copy(
                                        fontWeight = FontWeight.Bold
                                    )
                                )

                                // نام کامل
                                OutlinedTextField(
                                    value = regFullName,
                                    onValueChange = { regFullName = it },
                                    label = { Text("نام و نام خانوادگی *") },
                                    leadingIcon = { Icon(Icons.Default.Person, null) },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                // شماره موبایل
                                OutlinedTextField(
                                    value = regPhone,
                                    onValueChange = { if (it.length <= 11) regPhone = it },
                                    label = { Text("شماره موبایل *") },
                                    leadingIcon = { Icon(Icons.Default.Phone, null) },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                    supportingText = { Text("مثال: 09123456789") }
                                )

                                // ایمیل (اختیاری)
                                OutlinedTextField(
                                    value = regEmail,
                                    onValueChange = { regEmail = it },
                                    label = { Text("ایمیل (اختیاری)") },
                                    leadingIcon = { Icon(Icons.Default.Email, null) },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                // رمز عبور
                                OutlinedTextField(
                                    value = regPassword,
                                    onValueChange = { regPassword = it },
                                    label = { Text("رمز عبور *") },
                                    leadingIcon = { Icon(Icons.Default.Lock, null) },
                                    trailingIcon = {
                                        IconButton(onClick = { regPasswordVisible = !regPasswordVisible }) {
                                            Icon(
                                                if (regPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                                null
                                            )
                                        }
                                    },
                                    visualTransformation = if (regPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                    supportingText = { Text("حداقل 6 کاراکتر") }
                                )

                                // تکرار رمز عبور
                                OutlinedTextField(
                                    value = regConfirmPassword,
                                    onValueChange = { regConfirmPassword = it },
                                    label = { Text("تکرار رمز عبور *") },
                                    leadingIcon = { Icon(Icons.Default.Lock, null) },
                                    trailingIcon = {
                                        IconButton(onClick = { regConfirmPasswordVisible = !regConfirmPasswordVisible }) {
                                            Icon(
                                                if (regConfirmPasswordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                                null
                                            )
                                        }
                                    },
                                    visualTransformation = if (regConfirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth(),
                                    isError = regConfirmPassword.isNotBlank() && regPassword != regConfirmPassword,
                                    supportingText = if (regConfirmPassword.isNotBlank() && regPassword != regConfirmPassword) {
                                        { Text("رمز عبور و تکرار آن مطابقت ندارند", color = MaterialTheme.colorScheme.error) }
                                    } else null
                                )

                                Button(
                                    onClick = {
                                        viewModel.register(
                                            fullName = regFullName,
                                            phone = regPhone,
                                            email = regEmail.ifBlank { null },
                                            password = regPassword,
                                            confirmPassword = regConfirmPassword
                                        )
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(52.dp),
                                    enabled = regFullName.isNotBlank() &&
                                            regPhone.isNotBlank() &&
                                            regPassword.isNotBlank() &&
                                            regConfirmPassword.isNotBlank() &&
                                            !uiState.isLoading
                                ) {
                                    if (uiState.isLoading) {
                                        CircularProgressIndicator(
                                            Modifier.size(20.dp),
                                            color = MaterialTheme.colorScheme.onPrimary,
                                            strokeWidth = 2.dp
                                        )
                                    } else {
                                        Text("ثبت‌نام", fontWeight = FontWeight.SemiBold)
                                    }
                                }

                                TextButton(
                                    onClick = { selectedTab = 0; viewModel.clearError() },
                                    modifier = Modifier.align(Alignment.CenterHorizontally)
                                ) {
                                    Text("قبلاً ثبت‌نام کرده‌اید؟ وارد شوید")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
