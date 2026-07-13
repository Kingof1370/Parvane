package ir.parvanesalon.app.presentation.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.StaffDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = false,
    val staff: List<StaffDto> = emptyList(),
    val userName: String? = null,
    val loyaltyPoints: Int = 0,
    val unreadNotifications: Int = 0,
    val error: String? = null,
)

@HiltViewModel
class HomeViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val staffRes = api.getStaff()
                val profileRes = runCatching { api.getProfile() }.getOrNull()
                val unreadRes = runCatching { api.getUnreadCount() }.getOrNull()

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    staff = staffRes.body() ?: emptyList(),
                    userName = profileRes?.body()?.fullName,
                    loyaltyPoints = profileRes?.body()?.loyaltyPoints ?: 0,
                    unreadNotifications = unreadRes?.body()?.count ?: 0,
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }
}
