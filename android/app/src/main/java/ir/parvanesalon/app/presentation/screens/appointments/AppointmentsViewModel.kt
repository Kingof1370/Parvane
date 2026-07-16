package ir.parvanesalon.app.presentation.screens.appointments

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.AppointmentDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AppointmentsUiState(val isLoading: Boolean = false, val appointments: List<AppointmentDto> = emptyList())

@HiltViewModel
class AppointmentsViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    private val _uiState = MutableStateFlow(AppointmentsUiState())
    val uiState: StateFlow<AppointmentsUiState> = _uiState

    init { loadTab(0) }

    fun loadTab(tab: Int) {
        val status = when (tab) {
            0 -> "confirmed"
            1 -> "completed"
            2 -> "cancelled"
            else -> null
        }
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val appts = api.getMyAppointments(status).body() ?: emptyList()
                _uiState.update { it.copy(isLoading = false, appointments = appts) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false) }
            }
        }
    }

    fun cancelAppointment(id: String) {
        viewModelScope.launch {
            try {
                api.cancelAppointment(id, mapOf("reason" to "لغو توسط مشتری"))
                loadTab(0)
            } catch (ignored: Exception) {}
        }
    }
}
