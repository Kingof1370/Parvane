package ir.parvanesalon.app.presentation.screens.notifications

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.NotificationDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationsUiState(
    val isLoading: Boolean = false,
    val notifications: List<NotificationDto> = emptyList(),
    val unreadCount: Int = 0,
    val error: String? = null,
)

@HiltViewModel
class NotificationsViewModel @Inject constructor(
    private val api: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationsUiState())
    val uiState: StateFlow<NotificationsUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val notifRes = api.getNotifications()
                val countRes = api.getUnreadCount()
                if (notifRes.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        notifications = notifRes.body() ?: emptyList(),
                        unreadCount = countRes.body()?.count ?: 0
                    )
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "خطا در بارگذاری اعلان‌ها")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun markRead(id: String) {
        viewModelScope.launch {
            try {
                api.markNotificationRead(id)
                val updated = _uiState.value.notifications.map {
                    if (it.id == id) it.copy(isRead = true) else it
                }
                val unread = updated.count { !it.isRead }
                _uiState.value = _uiState.value.copy(notifications = updated, unreadCount = unread)
            } catch (_: Exception) {}
        }
    }

    fun markAllRead() {
        viewModelScope.launch {
            try {
                api.markAllRead()
                val updated = _uiState.value.notifications.map { it.copy(isRead = true) }
                _uiState.value = _uiState.value.copy(notifications = updated, unreadCount = 0)
            } catch (_: Exception) {}
        }
    }
}
