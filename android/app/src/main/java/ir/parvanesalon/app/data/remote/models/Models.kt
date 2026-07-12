package ir.parvanesalon.app.data.remote.models

import kotlinx.serialization.Serializable

@Serializable
data class MessageResponse(val message: String)

@Serializable
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserDto
)

@Serializable
data class UserDto(
    val id: String,
    val fullName: String,
    val phone: String,
    val email: String? = null,
    val role: String = "client",
    val avatar: String? = null,
    val isActive: Boolean = true
)

@Serializable
data class LoginRequest(
    val identifier: String,
    val password: String
)

@Serializable
data class ServiceDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val price: Double,
    val discountedPrice: Double? = null,
    val durationMinutes: Int,
    val image: String? = null,
    val isActive: Boolean = true,
    val category: CategoryDto? = null
)

@Serializable
data class CategoryDto(
    val id: String,
    val name: String,
    val icon: String? = null
)

@Serializable
data class StaffDto(
    val id: String,
    val fullName: String,
    val phone: String,
    val avatar: String? = null,
    val bio: String? = null,
    val rating: Double = 0.0,
    val totalReviews: Int = 0,
    val specialties: List<ServiceDto> = emptyList()
)

@Serializable
data class AppointmentDto(
    val id: String,
    val service: ServiceDto,
    val staff: StaffDto,
    val date: String,
    val startTime: String,
    val endTime: String,
    val status: String,
    val notes: String? = null,
    val paidAmount: Double? = null,
    val reviewRating: Int? = null
)

@Serializable
data class CreateAppointmentRequest(
    val serviceId: String,
    val staffId: String,
    val date: String,
    val startTime: String,
    val notes: String? = null
)

@Serializable
data class SlotsResponse(
    val slots: List<String>,
    val duration: Int = 60
)

@Serializable
data class AvailabilityResponse(
    val available: Boolean,
    val slots: List<String>
)

@Serializable
data class ReviewRequest(
    val rating: Int,
    val text: String? = null
)

@Serializable
data class NotificationDto(
    val id: String,
    val title: String,
    val body: String,
    val type: String,
    val isRead: Boolean,
    val createdAt: String
)

@Serializable
data class DashboardSummary(
    val todayAppointments: Int,
    val pendingAppointments: Int,
    val totalClients: Int,
    val totalRevenue: Double
)
