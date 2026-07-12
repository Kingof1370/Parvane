package ir.parvanesalon.app.presentation.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.local.TokenManager
import ir.parvanesalon.app.data.remote.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AuthUiState(
    val isLoading: Boolean = false,
    val otpSent: Boolean = false,
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

    fun sendOtp(phone: String) {
        if (phone.length != 11 || !phone.startsWith("09")) {
            _uiState.update { it.copy(error = "شماره موبایل معتبر نیست") }
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val response = api.sendOtp(mapOf("phone" to phone))
                if (response.isSuccessful) {
                    _uiState.update { it.copy(isLoading = false, otpSent = true) }
                } else {
                    _uiState.update { it.copy(isLoading = false, error = "خطا در ارسال کد") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "خطا در اتصال به سرور") }
            }
        }
    }

    fun verifyOtp(phone: String, otp: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                val response = api.verifyOtp(mapOf("phone" to phone, "otp" to otp))
                if (response.isSuccessful && response.body() != null) {
                    val auth = response.body()!!
                    tokenManager.saveTokens(auth.accessToken, auth.refreshToken, auth.user.id, auth.user.role)
                    _uiState.update { it.copy(isLoading = false, isAuthenticated = true) }
                } else {
                    _uiState.update { it.copy(isLoading = false, error = "کد تأیید اشتباه است") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = "خطا در اتصال به سرور") }
            }
        }
    }
}
