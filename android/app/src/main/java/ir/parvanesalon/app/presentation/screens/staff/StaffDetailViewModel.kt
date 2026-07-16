package ir.parvanesalon.app.presentation.screens.staff

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

data class StaffDetailUiState(
    val isLoading: Boolean = false,
    val staff: StaffDto? = null,
    val error: String? = null,
)

@HiltViewModel
class StaffDetailViewModel @Inject constructor(
    private val api: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(StaffDetailUiState())
    val uiState: StateFlow<StaffDetailUiState> = _uiState.asStateFlow()

    fun load(staffId: String) {
        viewModelScope.launch {
            _uiState.value = StaffDetailUiState(isLoading = true)
            try {
                val res = api.getStaffById(staffId)
                if (res.isSuccessful) {
                    _uiState.value = StaffDetailUiState(staff = res.body())
                } else {
                    _uiState.value = StaffDetailUiState(error = "متخصص یافت نشد")
                }
            } catch (e: Exception) {
                _uiState.value = StaffDetailUiState(error = e.message)
            }
        }
    }
}
