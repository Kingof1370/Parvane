package ir.parvanesalon.app.presentation.screens.services

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.CategoryDto
import ir.parvanesalon.app.data.remote.models.ServiceDto
import ir.parvanesalon.app.data.remote.models.StaffDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ServicesUiState(
    val isLoading: Boolean = false,
    val services: List<ServiceDto> = emptyList(),
    val categories: List<CategoryDto> = emptyList(),
    val staff: List<StaffDto> = emptyList()
)

@HiltViewModel
class ServicesViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    private val _uiState = MutableStateFlow(ServicesUiState())
    val uiState: StateFlow<ServicesUiState> = _uiState

    init { loadInitial() }

    private fun loadInitial() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            try {
                val services = api.getServices().body() ?: emptyList()
                val categories = api.getCategories().body() ?: emptyList()
                val staff = api.getStaff().body() ?: emptyList()
                _uiState.update { it.copy(isLoading = false, services = services, categories = categories, staff = staff) }
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false) }
            }
        }
    }

    fun loadServices(categoryId: String?) {
        viewModelScope.launch {
            try {
                val services = api.getServices(categoryId).body() ?: emptyList()
                _uiState.update { it.copy(services = services) }
            } catch (ignored: Exception) {}
        }
    }
}
