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
    val isActive: Boolean = true,
    val loyaltyPoints: Int = 0,
    val totalLoyaltyEarned: Int = 0,
    val totalLoyaltyRedeemed: Int = 0,
)

@Serializable
data class LoginRequest(
    val identifier: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val fullName: String,
    val phone: String,
    val email: String? = null,
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
    val specialties: List<ServiceDto> = emptyList(),
    val portfolio: List<PortfolioItemDto> = emptyList(),
    val experienceYears: Int = 0,
    val instagramUrl: String? = null,
    val certificationsText: String? = null,
    val section: String? = null,
)

@Serializable
data class PortfolioItemDto(
    val id: String,
    val title: String,
    val description: String? = null,
    val imageUrl: String,
    val beforeImageUrl: String? = null,
    val type: String = "work_sample",
    val serviceCategory: String? = null,
    val likesCount: Int = 0,
    val createdAt: String? = null,
)

@Serializable
data class StyleGalleryItemDto(
    val id: String,
    val title: String,
    val description: String? = null,
    val imageUrl: String,
    val thumbnailUrl: String? = null,
    val category: CategoryDto? = null,
    val tags: List<String> = emptyList(),
    val staffName: String? = null,
    val duration: String? = null,
    val viewsCount: Int = 0,
    val likesCount: Int = 0,
    val isActive: Boolean = true,
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
    val reviewRating: Int? = null,
    val reviewText: String? = null,
    val prePaymentStatus: String = "not_required",
    val prePaymentAmount: Double? = null,
    val addedToCalendar: Boolean = false,
    val loyaltyPointsEarned: Int = 0,
    val selectedStyleImageUrl: String? = null,
)

@Serializable
data class CreateAppointmentRequest(
    val serviceId: String,
    val staffId: String,
    val date: String,
    val startTime: String,
    val notes: String? = null,
    val timeRangePreference: String? = null,
    val selectedStyleGalleryId: String? = null,
    val selectedStyleImageUrl: String? = null,
    val requirePrePayment: Boolean = false,
    val prePaymentAmount: Double? = null,
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
    val data: kotlinx.serialization.json.JsonElement? = null,
    val createdAt: String
)

@Serializable
data class UnreadCountResponse(val count: Int)

@Serializable
data class DashboardSummary(
    val todayAppointments: Int,
    val pendingAppointments: Int,
    val totalClients: Int,
    val totalRevenue: Double
)

@Serializable
data class LoyaltyPointsResponse(
    val balance: Int,
    val totalEarned: Int,
    val totalRedeemed: Int,
    val transactions: List<LoyaltyTransactionDto>
)

@Serializable
data class LoyaltyTransactionDto(
    val id: String,
    val type: String,
    val points: Int,
    val description: String? = null,
    val createdAt: String
)

@Serializable
data class ChatRoomDto(
    val id: String,
    val client: UserDto? = null,
    val staff: StaffDto? = null,
    val status: String,
    val subject: String? = null,
    val serviceCategory: String? = null,
    val unreadClientCount: Int = 0,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)

@Serializable
data class ChatMessageDto(
    val id: String,
    val senderType: String,
    val senderId: String? = null,
    val content: String,
    val imageUrl: String? = null,
    val isRead: Boolean = false,
    val createdAt: String
)

@Serializable
data class ChatRoomMessagesResponse(
    val room: ChatRoomDto,
    val messages: List<ChatMessageDto>
)

@Serializable
data class CreateChatRoomRequest(
    val subject: String? = null,
    val serviceCategory: String? = null,
    val staffId: String? = null,
)

@Serializable
data class SendMessageRequest(
    val content: String,
    val imageUrl: String? = null,
)

@Serializable
data class PrePaymentRequest(
    val transactionId: String
)

@Serializable
data class CalendarAddedRequest(
    val calendarEventId: String
)
