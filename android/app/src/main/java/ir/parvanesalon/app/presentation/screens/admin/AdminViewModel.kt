package ir.parvanesalon.app.presentation.screens.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AdminUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,

    // Dashboard
    val summary: AdminDashboardSummary = AdminDashboardSummary(),
    val clientsStats: ClientsStatsDto = ClientsStatsDto(),
    val recentAppointments: List<AdminAppointmentDto> = emptyList(),

    // Appointments
    val appointments: List<AdminAppointmentDto> = emptyList(),
    val appointmentFilter: String = "all", // all, pending, confirmed, completed, cancelled

    // Users
    val clients: List<AdminUserDto> = emptyList(),
    val staffUsers: List<AdminUserDto> = emptyList(),
    val searchQuery: String = "",

    // Gallery
    val galleryItems: List<AdminGalleryItemDto> = emptyList(),

    // Staff profiles
    val staffProfiles: List<StaffDto> = emptyList(),

    // Settings
    val settings: Map<String, String> = emptyMap(),

    // Chat
    val chatRooms: List<AdminChatRoomDto> = emptyList(),

    // Broadcast
    val broadcastTitle: String = "",
    val broadcastMessage: String = "",
)

@HiltViewModel
class AdminViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _state = MutableStateFlow(AdminUiState())
    val state: StateFlow<AdminUiState> = _state.asStateFlow()

    init {
        loadDashboard()
    }

    // ──── Dashboard ────
    fun loadDashboard() = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val summaryRes = api.getAdminDashboardSummary()
            val recentRes = api.getRecentAppointments(8)
            val statsRes = api.getClientsStats()
            _state.value = _state.value.copy(
                isLoading = false,
                summary = summaryRes.body() ?: AdminDashboardSummary(),
                recentAppointments = recentRes.body() ?: emptyList(),
                clientsStats = statsRes.body() ?: ClientsStatsDto(),
            )
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = "خطا در بارگذاری داشبورد: ${e.message}")
        }
    }

    // ──── Appointments ────
    fun loadAppointments(status: String = "all") = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null, appointmentFilter = status)
        try {
            val res = api.getAdminAppointments(status = if (status == "all") null else status)
            _state.value = _state.value.copy(isLoading = false, appointments = res.body() ?: emptyList())
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = "خطا در بارگذاری رزروها: ${e.message}")
        }
    }

    fun updateAppointmentStatus(id: String, status: String, reason: String? = null) = viewModelScope.launch {
        try {
            val res = api.updateAppointmentStatus(id, UpdateStatusRequest(status, reason))
            if (res.isSuccessful) {
                _state.value = _state.value.copy(successMessage = "وضعیت رزرو بروز شد")
                loadAppointments(_state.value.appointmentFilter)
                loadDashboard()
            } else {
                _state.value = _state.value.copy(error = "خطا در تغییر وضعیت")
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(error = e.message)
        }
    }

    // ──── Users / Clients ────
    fun loadClients(search: String = "") = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null, searchQuery = search)
        try {
            val res = api.getAdminClients(search.ifBlank { null })
            _state.value = _state.value.copy(isLoading = false, clients = res.body() ?: emptyList())
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    fun loadStaffUsers() = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.getStaffUsers()
            _state.value = _state.value.copy(isLoading = false, staffUsers = res.body() ?: emptyList())
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    fun toggleUserActive(userId: String) = viewModelScope.launch {
        try {
            val res = api.toggleUserActive(userId)
            if (res.isSuccessful) {
                _state.value = _state.value.copy(successMessage = res.body()?.message ?: "انجام شد")
                loadClients(_state.value.searchQuery)
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(error = e.message)
        }
    }

    fun changeUserRole(userId: String, role: String, section: String? = null) = viewModelScope.launch {
        try {
            val res = api.changeUserRole(userId, ChangeRoleRequest(role, section))
            if (res.isSuccessful) {
                _state.value = _state.value.copy(successMessage = "نقش کاربر تغییر یافت")
                loadClients(_state.value.searchQuery)
                loadStaffUsers()
            } else {
                _state.value = _state.value.copy(error = "خطا در تغییر نقش")
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(error = e.message)
        }
    }

    fun createStaffUser(fullName: String, phone: String, password: String, section: String?) = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.createStaffUser(CreateStaffRequest(fullName, phone, password = password, staffSection = section))
            if (res.isSuccessful) {
                _state.value = _state.value.copy(isLoading = false, successMessage = "حساب متخصص ساخته شد ✅")
                loadStaffUsers()
            } else {
                val errBody = res.errorBody()?.string()
                _state.value = _state.value.copy(isLoading = false, error = "خطا: $errBody")
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    fun resetUserPassword(userId: String, newPassword: String) = viewModelScope.launch {
        try {
            val res = api.resetUserPassword(userId, ResetPasswordRequest(newPassword))
            if (res.isSuccessful) {
                _state.value = _state.value.copy(successMessage = "رمز عبور تغییر کرد ✅")
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(error = e.message)
        }
    }

    // ──── Gallery ────
    fun loadGallery() = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.getAdminGallery()
            _state.value = _state.value.copy(isLoading = false, galleryItems = res.body() ?: emptyList())
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    fun createGalleryItem(title: String, imageUrl: String, staffName: String?, description: String?) = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.createGalleryItem(CreateGalleryItemRequest(title, description, imageUrl, staffName))
            if (res.isSuccessful) {
                _state.value = _state.value.copy(isLoading = false, successMessage = "آیتم گالری اضافه شد ✅")
                loadGallery()
            } else {
                _state.value = _state.value.copy(isLoading = false, error = "خطا در افزودن آیتم")
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    fun deleteGalleryItem(id: String) = viewModelScope.launch {
        try {
            val res = api.deleteGalleryItem(id)
            if (res.isSuccessful) {
                _state.value = _state.value.copy(successMessage = "حذف شد")
                loadGallery()
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(error = e.message)
        }
    }

    // ──── Notifications ────
    fun setBroadcastTitle(v: String) { _state.value = _state.value.copy(broadcastTitle = v) }
    fun setBroadcastMessage(v: String) { _state.value = _state.value.copy(broadcastMessage = v) }

    fun broadcastNotification() = viewModelScope.launch {
        val title = _state.value.broadcastTitle.trim()
        val message = _state.value.broadcastMessage.trim()
        if (title.isEmpty() || message.isEmpty()) {
            _state.value = _state.value.copy(error = "عنوان و متن اعلان را وارد کنید")
            return@launch
        }
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.broadcastNotification(BroadcastNotificationRequest(title, message))
            if (res.isSuccessful) {
                val result = res.body()
                _state.value = _state.value.copy(
                    isLoading = false,
                    successMessage = "اعلان برای ${result?.count ?: 0} کاربر ارسال شد ✅",
                    broadcastTitle = "",
                    broadcastMessage = "",
                )
            } else {
                _state.value = _state.value.copy(isLoading = false, error = "خطا در ارسال اعلان")
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    // ──── Settings ────
    fun loadSettings() = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.getSettings()
            _state.value = _state.value.copy(isLoading = false, settings = res.body() ?: emptyMap())
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    fun saveSettings(updates: Map<String, String>) = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.updateSettings(updates)
            if (res.isSuccessful) {
                _state.value = _state.value.copy(isLoading = false, successMessage = "تنظیمات ذخیره شد ✅", settings = res.body() ?: emptyMap())
            } else {
                _state.value = _state.value.copy(isLoading = false, error = "خطا در ذخیره تنظیمات")
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    // ──── Chat ────
    fun loadChatRooms() = viewModelScope.launch {
        _state.value = _state.value.copy(isLoading = true, error = null)
        try {
            val res = api.getAdminChatRooms()
            _state.value = _state.value.copy(isLoading = false, chatRooms = res.body() ?: emptyList())
        } catch (e: Exception) {
            _state.value = _state.value.copy(isLoading = false, error = e.message)
        }
    }

    fun assignStaffToRoom(roomId: String, staffId: String) = viewModelScope.launch {
        try {
            val res = api.assignStaffToRoom(roomId, AssignStaffRequest(staffId))
            if (res.isSuccessful) {
                _state.value = _state.value.copy(successMessage = "متخصص به اتاق اختصاص یافت ✅")
                loadChatRooms()
            }
        } catch (e: Exception) {
            _state.value = _state.value.copy(error = e.message)
        }
    }

    // ──── Load staff profiles ────
    fun loadStaffProfiles() = viewModelScope.launch {
        try {
            val res = api.getStaff()
            _state.value = _state.value.copy(staffProfiles = res.body() ?: emptyList())
        } catch (e: Exception) { /* ignore */ }
    }

    fun clearMessages() {
        _state.value = _state.value.copy(error = null, successMessage = null)
    }
}
