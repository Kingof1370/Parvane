package ir.parvanesalon.app.data.remote

import ir.parvanesalon.app.data.remote.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // Auth
    @POST("auth/send-otp")
    suspend fun sendOtp(@Body body: Map<String, String>): Response<MessageResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body body: Map<String, String>): Response<AuthResponse>

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

    // Notifications
    @GET("notifications")
    suspend fun getNotifications(): Response<List<NotificationDto>>

    @PATCH("notifications/{id}/read")
    suspend fun markNotificationRead(@Path("id") id: String): Response<MessageResponse>

    @PATCH("notifications/read-all")
    suspend fun markAllRead(): Response<MessageResponse>

    // Dashboard (staff/admin)
    @GET("dashboard/summary")
    suspend fun getDashboardSummary(): Response<DashboardSummary>
}
