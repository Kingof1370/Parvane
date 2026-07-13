package ir.parvanesalon.app.presentation.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.local.TokenManager
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.LoginRequest
import ir.parvanesalon.app.data.remote.models.RegisterRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val api: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState

    /**
     * پارس خطای واقعی از بدنه پاسخ سرور
     * NestJS یا یک رشته می‌فرستد یا آرایه‌ای از رشته‌ها در فیلد message
     */
    private fun parseServerError(errorBodyString: String?, fallback: String): String {
        if (errorBodyString.isNullOrBlank()) return fallback
        return try {
            val json = Json { ignoreUnknownKeys = true; isLenient = true }
            val element = json.parseToJsonElement(errorBodyString).jsonObject
            val messageElement = element["message"] ?: return fallback
            // اگر آرایه بود اولین پیام را بگیر
            try {
                val arr = messageElement.jsonArray
                arr.firstOrNull()?.jsonPrimitive?.content ?: fallback
            } catch (_: Exception) {
                // اگر رشته بود مستقیم برگردان
                try {
                    messageElement.jsonPrimitive.content
                } catch (_: Exception) {
                    fallback
                }
            }
        } catch (_: Exception) {
            fallback
        }
    }

    fun login(phone: String, password: String) {
        if (phone.isBlank() || password.isBlank()) {
            _uiState.update { it.copy(error = "لطفاً تمام فیلدها را پر کنید") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val response = api.login(LoginRequest(identifier = phone, password = password))
                if (response.isSuccessful && response.body() != null) {
                    val auth = response.body()!!
                    tokenManager.saveTokens(auth.accessToken, auth.refreshToken, auth.user.id, auth.user.role)
                    _uiState.update { it.copy(isLoading = false, isAuthenticated = true) }
                } else {
                    val rawError = response.errorBody()?.string()
                    val errorMsg = when (response.code()) {
                        401 -> parseServerError(rawError, "شماره تلفن یا رمز عبور اشتباه است")
                        400 -> parseServerError(rawError, "اطلاعات ورودی نادرست است")
                        else -> parseServerError(rawError, "خطا در ورود به حساب")
                    }
                    _uiState.update { it.copy(isLoading = false, error = errorMsg) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "خطا در اتصال به سرور") }
            }
        }
    }

    fun register(fullName: String, phone: String, email: String?, password: String, confirmPassword: String) {
        if (fullName.isBlank() || phone.isBlank() || password.isBlank()) {
            _uiState.update { it.copy(error = "لطفاً فیلدهای اجباری را پر کنید") }
            return
        }
        if (!phone.matches(Regex("^09[0-9]{9}$"))) {
            _uiState.update { it.copy(error = "شماره موبایل باید با 09 شروع شده و 11 رقم باشد") }
            return
        }
        if (password.length < 6) {
            _uiState.update { it.copy(error = "رمز عبور باید حداقل 6 کاراکتر باشد") }
            return
        }
        if (password != confirmPassword) {
            _uiState.update { it.copy(error = "تکرار رمز عبور مطابقت ندارد") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val response = api.register(
                    RegisterRequest(
                        fullName = fullName.trim(),
                        phone = phone.trim(),
                        email = email?.trim()?.ifBlank { null },
                        password = password
                    )
                )
                if (response.isSuccessful && response.body() != null) {
                    val auth = response.body()!!
                    tokenManager.saveTokens(auth.accessToken, auth.refreshToken, auth.user.id, auth.user.role)
                    _uiState.update { it.copy(isLoading = false, isAuthenticated = true) }
                } else {
                    val rawError = response.errorBody()?.string()
                    val errorMsg = when (response.code()) {
                        400 -> parseServerError(
                            rawError,
                            "خطا در ثبت‌نام. لطفاً اطلاعات را بررسی کنید"
                        )
                        409 -> "این شماره تلفن یا ایمیل قبلاً ثبت‌نام کرده است"
                        else -> parseServerError(rawError, "خطا در ثبت‌نام")
                    }
                    _uiState.update { it.copy(isLoading = false, error = errorMsg) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "خطا در اتصال به سرور") }
            }
        }
    }

    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}
