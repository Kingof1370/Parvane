package ir.parvanesalon.app.presentation.screens.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.UserDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val isLoading: Boolean = false,
    val user: UserDto? = null,
    val error: String? = null,
)

@HiltViewModel
class ProfileViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val res = api.getProfile()
                if (res.isSuccessful) {
                    _uiState.value = ProfileUiState(user = res.body())
                } else {
                    _uiState.value = ProfileUiState(error = "خطا در بارگذاری پروفایل")
                }
            } catch (e: Exception) {
                _uiState.value = ProfileUiState(error = e.message)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            runCatching { api.logout() }
        }
    }
}
