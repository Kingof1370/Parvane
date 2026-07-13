package ir.parvanesalon.app.data.remote

import ir.parvanesalon.app.data.remote.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // Auth
    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @GET("auth/profile")
    suspend fun getProfile(): Response<UserDto>

    @POST("auth/logout")
    suspend fun logout(): Response<MessageResponse>

    @PATCH("auth/fcm-token")
    suspend fun updateFcmToken(@Body body: Map<String, String>): Response<MessageResponse>

    // Services
    @GET("services")
    suspend fun getServices(@Query("categoryId") categoryId: String? = null): Response<List<ServiceDto>>

    @GET("services/categories")
    suspend fun getCategories(): Response<List<CategoryDto>>

    @GET("services/{id}")
    suspend fun getService(@Path("id") id: String): Response<ServiceDto>

    // Staff
    @GET("staff")
    suspend fun getStaff(): Response<List<StaffDto>>

    @GET("staff/{id}")
    suspend fun getStaffById(@Path("id") id: String): Response<StaffDto>

    @GET("staff/{id}/availability")
    suspend fun getAvailability(
        @Path("id") staffId: String,
        @Query("date") date: String
    ): Response<AvailabilityResponse>

    @GET("staff/{id}/portfolio")
    suspend fun getStaffPortfolio(@Path("id") staffId: String): Response<List<PortfolioItemDto>>

    // Appointments
    @GET("appointments/available-slots")
    suspend fun getAvailableSlots(
        @Query("staffId") staffId: String,
        @Query("serviceId") serviceId: String,
        @Query("date") date: String
    ): Response<SlotsResponse>

    @POST("appointments")
    suspend fun createAppointment(@Body body: CreateAppointmentRequest): Response<AppointmentDto>

    @GET("appointments/my")
    suspend fun getMyAppointments(@Query("status") status: String? = null): Response<List<AppointmentDto>>

    @GET("appointments/{id}")
    suspend fun getAppointment(@Path("id") id: String): Response<AppointmentDto>

    @PATCH("appointments/{id}/cancel")
    suspend fun cancelAppointment(
        @Path("id") id: String,
        @Body body: Map<String, String>
    ): Response<MessageResponse>

    @POST("appointments/{id}/review")
    suspend fun addReview(
        @Path("id") id: String,
        @Body body: ReviewRequest
    ): Response<MessageResponse>

    @PATCH("appointments/{id}/pre-payment")
    suspend fun confirmPrePayment(
        @Path("id") id: String,
        @Body body: PrePaymentRequest
    ): Response<AppointmentDto>

    @PATCH("appointments/{id}/calendar-added")
    suspend fun markCalendarAdded(
        @Path("id") id: String,
        @Body body: CalendarAddedRequest
    ): Response<MessageResponse>

    // Notifications
    @GET("notifications")
    suspend fun getNotifications(): Response<List<NotificationDto>>

    @GET("notifications/unread-count")
    suspend fun getUnreadCount(): Response<UnreadCountResponse>

    @PATCH("notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: String): Response<MessageResponse>

    @PATCH("notifications/read-all")
    suspend fun markAllRead(): Response<MessageResponse>

    // Gallery
    @GET("gallery")
    suspend fun getGallery(
        @Query("categoryId") categoryId: String? = null,
        @Query("tag") tag: String? = null,
        @Query("search") search: String? = null
    ): Response<List<StyleGalleryItemDto>>

    @GET("gallery/{id}")
    suspend fun getGalleryItem(@Path("id") id: String): Response<StyleGalleryItemDto>

    @POST("gallery/{id}/like")
    suspend fun likeGalleryItem(@Path("id") id: String): Response<MessageResponse>

    // Loyalty
    @GET("loyalty/my")
    suspend fun getMyLoyalty(): Response<LoyaltyPointsResponse>

    @POST("loyalty/redeem")
    suspend fun redeemPoints(@Body body: Map<String, Any>): Response<MessageResponse>

    // Chat
    @GET("chat/rooms/my")
    suspend fun getMyChatRooms(): Response<List<ChatRoomDto>>

    @POST("chat/rooms")
    suspend fun createChatRoom(@Body body: CreateChatRoomRequest): Response<ChatRoomDto>

    @GET("chat/rooms/{roomId}/messages")
    suspend fun getChatMessages(@Path("roomId") roomId: String): Response<ChatRoomMessagesResponse>

    @POST("chat/rooms/{roomId}/messages")
    suspend fun sendChatMessage(
        @Path("roomId") roomId: String,
        @Body body: SendMessageRequest
    ): Response<ChatMessageDto>

    // Dashboard (staff/admin)
    @GET("dashboard/summary")
    suspend fun getDashboardSummary(): Response<DashboardSummary>
}
