package ir.parvanesalon.app.data.remote.models

import kotlinx.serialization.Serializable

// -------- Admin User Management --------
@Serializable
data class AdminUserDto(
    val id: String,
    val fullName: String,
    val phone: String,
    val email: String? = null,
    val role: String = "client",
    val avatar: String? = null,
    val isActive: Boolean = true,
    val loyaltyPoints: Int = 0,
    val staffSection: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class CreateStaffRequest(
    val fullName: String,
    val phone: String,
    val email: String? = null,
    val password: String,
    val staffSection: String? = null,
)

@Serializable
data class ChangeRoleRequest(
    val role: String,
    val staffSection: String? = null,
)

@Serializable
data class ResetPasswordRequest(
    val newPassword: String,
)

// -------- Admin Appointment --------
@Serializable
data class AdminAppointmentDto(
    val id: String,
    val service: ServiceDto,
    val staff: StaffDto,
    val client: AdminUserDto? = null,
    val date: String,
    val startTime: String,
    val endTime: String,
    val status: String,
    val notes: String? = null,
    val paidAmount: Double? = null,
    val cancellationReason: String? = null,
    val loyaltyPointsEarned: Int = 0,
)

@Serializable
data class UpdateStatusRequest(
    val status: String,
    val reason: String? = null,
)

// -------- Admin Gallery --------
@Serializable
data class AdminGalleryItemDto(
    val id: String,
    val title: String,
    val description: String? = null,
    val imageUrl: String,
    val thumbnailUrl: String? = null,
    val category: CategoryDto? = null,
    val tags: List<String> = emptyList(),
    val staffName: String? = null,
    val staffUserId: String? = null,
    val viewsCount: Int = 0,
    val likesCount: Int = 0,
    val isActive: Boolean = true,
    val status: String = "active",
)

@Serializable
data class CreateGalleryItemRequest(
    val title: String,
    val description: String? = null,
    val imageUrl: String,
    val staffName: String? = null,
    val categoryId: String? = null,
    val tags: List<String> = emptyList(),
)

// -------- Admin Notifications --------
@Serializable
data class BroadcastNotificationRequest(
    val title: String,
    val message: String,
)

@Serializable
data class BroadcastResultDto(
    val message: String,
    val count: Int = 0,
)

// -------- Admin Dashboard --------
@Serializable
data class AdminDashboardSummary(
    val todayAppointments: Int = 0,
    val pendingAppointments: Int = 0,
    val totalClients: Int = 0,
    val totalStaff: Int = 0,
    val totalRevenue: Double = 0.0,
)

@Serializable
data class ClientsStatsDto(
    val total: Int = 0,
    val active: Int = 0,
    val inactive: Int = 0,
    val newThisMonth: Int = 0,
)

// -------- Admin Settings --------
@Serializable
data class SettingsUpdateRequest(
    val salon_name: String? = null,
    val salon_phone: String? = null,
    val salon_address: String? = null,
    val salon_working_hours: String? = null,
    val owner_name: String? = null,
    val instagram_link: String? = null,
    val telegram_link: String? = null,
    val loyalty_points_per_appointment: String? = null,
    val loyalty_points_per_review: String? = null,
    val cancel_before_hours: String? = null,
)

// -------- Admin Chat --------
@Serializable
data class AdminChatRoomDto(
    val id: String,
    val client: AdminUserDto? = null,
    val staff: StaffDto? = null,
    val status: String,
    val subject: String? = null,
    val unreadClientCount: Int = 0,
    val unreadStaffCount: Int = 0,
    val updatedAt: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class AssignStaffRequest(
    val staffId: String,
)
