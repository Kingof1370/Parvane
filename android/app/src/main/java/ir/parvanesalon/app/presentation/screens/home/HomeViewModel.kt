package ir.parvanesalon.app.presentation.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.AppointmentDto
import ir.parvanesalon.app.data.remote.models.StaffDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = false,
    val staff: List<StaffDto> = emptyList(),
    val nextAppointment: AppointmentDto? = null,
    val error: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState

    init { loadData() }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val staffRes = api.getStaff()
                val apptRes = api.getMyAppointments(status = "confirmed")
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        staff = staffRes.body() ?: emptyList(),
                        nextAppointment = apptRes.body()?.firstOrNull()
                    )
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }
}
