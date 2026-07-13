package ir.parvanesalon.app.presentation.screens.loyalty

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.LoyaltyPointsResponse
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoyaltyUiState(
    val isLoading: Boolean = false,
    val data: LoyaltyPointsResponse? = null,
    val error: String? = null,
    val redeemSuccess: String? = null,
)

@HiltViewModel
class LoyaltyViewModel @Inject constructor(
    private val api: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoyaltyUiState())
    val uiState: StateFlow<LoyaltyUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val res = api.getMyLoyalty()
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, data = res.body())
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "خطا در بارگذاری امتیازات")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(redeemSuccess = null, error = null)
    }
}
