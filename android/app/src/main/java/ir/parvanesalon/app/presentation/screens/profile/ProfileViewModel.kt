package ir.parvanesalon.app.presentation.screens.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.local.TokenManager
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.UserDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(val user: UserDto? = null, val loggedOut: Boolean = false)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val api: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState

    init {
        viewModelScope.launch {
            try {
                val user = api.getProfile().body()
                _uiState.update { it.copy(user = user) }
            } catch (ignored: Exception) {}
        }
    }

    fun logout() {
        viewModelScope.launch {
            try { api.logout() } catch (ignored: Exception) {}
            tokenManager.clearAll()
            _uiState.update { it.copy(loggedOut = true) }
        }
    }
}
