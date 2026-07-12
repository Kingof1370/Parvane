package ir.parvanesalon.app.presentation.screens.booking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.CreateAppointmentRequest
import ir.parvanesalon.app.data.remote.models.ServiceDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BookingUiState(
    val isLoadingSlots: Boolean = false,
    val isBooking: Boolean = false,
    val bookingSuccess: Boolean = false,
    val slots: List<String> = emptyList(),
    val service: ServiceDto? = null,
    val error: String? = null
)

@HiltViewModel
class BookingViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    private val _uiState = MutableStateFlow(BookingUiState())
    val uiState: StateFlow<BookingUiState> = _uiState

    fun init(serviceId: String, @Suppress("UNUSED_PARAMETER") staffId: String) {
        viewModelScope.launch {
            try {
                val service = api.getService(serviceId).body()
                _uiState.update { it.copy(service = service) }
            } catch (ignored: Exception) {}
        }
    }

    fun loadSlots(staffId: String, serviceId: String, date: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingSlots = true) }
            try {
                val res = api.getAvailableSlots(staffId, serviceId, date).body()
                _uiState.update { it.copy(isLoadingSlots = false, slots = res?.slots ?: emptyList()) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoadingSlots = false, slots = emptyList()) }
            }
        }
    }

    fun book(serviceId: String, staffId: String, date: String, startTime: String, notes: String?) {
        viewModelScope.launch {
            _uiState.update { it.copy(isBooking = true, error = null) }
            try {
                val res = api.createAppointment(CreateAppointmentRequest(serviceId, staffId, date, startTime, notes))
                if (res.isSuccessful) {
                    _uiState.update { it.copy(isBooking = false, bookingSuccess = true) }
                } else {
                    _uiState.update { it.copy(isBooking = false, error = "خطا در ثبت رزرو") }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(isBooking = false, error = "خطا در اتصال به سرور") }
            }
        }
    }
}
