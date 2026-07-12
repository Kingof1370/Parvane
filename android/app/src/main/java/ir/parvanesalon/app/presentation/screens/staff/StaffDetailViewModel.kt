package ir.parvanesalon.app.presentation.screens.staff

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.StaffDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class StaffDetailUiState(val staff: StaffDto? = null)

@HiltViewModel
class StaffDetailViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    private val _uiState = MutableStateFlow(StaffDetailUiState())
    val uiState: StateFlow<StaffDetailUiState> = _uiState

    fun loadStaff(id: String) {
        viewModelScope.launch {
            try {
                val staff = api.getStaffById(id).body()
                _uiState.update { it.copy(staff = staff) }
            } catch (ignored: Exception) {}
        }
    }
}
