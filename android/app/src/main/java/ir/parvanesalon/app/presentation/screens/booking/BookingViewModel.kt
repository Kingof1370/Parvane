package ir.parvanesalon.app.presentation.screens.booking

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.CreateAppointmentRequest
import ir.parvanesalon.app.data.remote.models.ServiceDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject

data class DateInfo(val isoDate: String, val dayName: String, val dayNum: String, val monthName: String)

data class BookingUiState(
    val isLoading: Boolean = false,
    val services: List<ServiceDto> = emptyList(),
    val availableDates: List<DateInfo> = emptyList(),
    val slots: List<String> = emptyList(),
    val slotsLoading: Boolean = false,
    val selectedServiceId: String? = null,
    val selectedDate: String? = null,
    val selectedTime: String? = null,
    val timeRangePreference: String = "any",
    val notes: String = "",
    val requirePrePayment: Boolean = false,
    val selectedStyleGalleryId: String? = null,
    val selectedStyleImageUrl: String? = null,
    val error: String? = null,
    val success: Boolean = false,
)

@HiltViewModel
class BookingViewModel @Inject constructor(private val api: ApiService) : ViewModel() {

    private val _uiState = MutableStateFlow(BookingUiState())
    val uiState: StateFlow<BookingUiState> = _uiState.asStateFlow()

    private var currentStaffId: String = ""

    fun init(staffId: String, preselectedServiceId: String?) {
        currentStaffId = staffId
        buildDates()
        viewModelScope.launch {
            try {
                val res = api.getServices()
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        services = res.body() ?: emptyList(),
                        selectedServiceId = preselectedServiceId
                    )
                }
            } catch (_: Exception) {}
        }
    }

    private fun buildDates() {
        val today = LocalDate.now()
        val persianDays = listOf("یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه")
        val persianMonths = listOf("فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند")
        val dates = (0 until 14).map { offset ->
            val date = today.plusDays(offset.toLong())
            val dayIdx = (date.dayOfWeek.value % 7)
            DateInfo(
                isoDate = date.format(DateTimeFormatter.ISO_LOCAL_DATE),
                dayName = persianDays[dayIdx],
                dayNum = toPersianDigits(date.dayOfMonth.toString()),
                monthName = persianMonths[date.monthValue - 1]
            )
        }
        _uiState.value = _uiState.value.copy(availableDates = dates)
    }

    private fun toPersianDigits(s: String): String {
        val map = mapOf('0' to '۰','1' to '۱','2' to '۲','3' to '۳','4' to '۴','5' to '۵','6' to '۶','7' to '۷','8' to '۸','9' to '۹')
        return s.map { map[it] ?: it }.joinToString("")
    }

    fun selectService(serviceId: String) {
        _uiState.value = _uiState.value.copy(selectedServiceId = serviceId, slots = emptyList(), selectedTime = null)
        val date = _uiState.value.selectedDate
        if (date != null) loadSlots(serviceId, date)
    }

    fun selectDate(date: String) {
        _uiState.value = _uiState.value.copy(selectedDate = date, slots = emptyList(), selectedTime = null)
        val serviceId = _uiState.value.selectedServiceId
        if (serviceId != null) loadSlots(serviceId, date)
    }

    fun selectCustomDate(date: LocalDate) {
        val iso = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
        val persianDays = listOf("یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه")
        val persianMonths = listOf("فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند")
        val dayIdx = (date.dayOfWeek.value % 7)
        val customDateInfo = DateInfo(
            isoDate = iso,
            dayName = persianDays[dayIdx],
            dayNum = toPersianDigits(date.dayOfMonth.toString()),
            monthName = persianMonths[date.monthValue - 1]
        )

        val currentDates = _uiState.value.availableDates.toMutableList()
        if (currentDates.none { it.isoDate == iso }) {
            currentDates.add(0, customDateInfo)
        }
        _uiState.value = _uiState.value.copy(
            availableDates = currentDates,
            selectedDate = iso,
            slots = emptyList(),
            selectedTime = null
        )
        val serviceId = _uiState.value.selectedServiceId
        if (serviceId != null) loadSlots(serviceId, iso)
    }

    private fun loadSlots(serviceId: String, date: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(slotsLoading = true)
            try {
                val res = api.getAvailableSlots(staffId = currentStaffId, serviceId = serviceId, date = date)
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        slotsLoading = false,
                        slots = res.body()?.slots ?: emptyList()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(slotsLoading = false)
                }
            } catch (_: Exception) {
                _uiState.value = _uiState.value.copy(slotsLoading = false)
            }
        }
    }

    fun selectTime(time: String) { _uiState.value = _uiState.value.copy(selectedTime = time) }
    fun setTimeRange(range: String) { _uiState.value = _uiState.value.copy(timeRangePreference = range) }
    fun setNotes(notes: String) { _uiState.value = _uiState.value.copy(notes = notes) }
    fun togglePrePayment(v: Boolean) { _uiState.value = _uiState.value.copy(requirePrePayment = v) }
    fun setSelectedStyle(galleryId: String?, imageUrl: String?) {
        _uiState.value = _uiState.value.copy(selectedStyleGalleryId = galleryId, selectedStyleImageUrl = imageUrl)
    }

    fun submit() {
        val state = _uiState.value
        if (state.selectedServiceId == null || state.selectedDate == null || state.selectedTime == null) {
            _uiState.value = state.copy(error = "لطفاً سرویس، تاریخ و ساعت را انتخاب کنید")
            return
        }
        viewModelScope.launch {
            _uiState.value = state.copy(isLoading = true, error = null)
            try {
                val req = CreateAppointmentRequest(
                    serviceId = state.selectedServiceId,
                    staffId = currentStaffId,
                    date = state.selectedDate,
                    startTime = state.selectedTime,
                    notes = state.notes.ifBlank { null },
                    timeRangePreference = if (state.timeRangePreference == "any") null else state.timeRangePreference,
                    selectedStyleGalleryId = state.selectedStyleGalleryId,
                    selectedStyleImageUrl = state.selectedStyleImageUrl,
                    requirePrePayment = state.requirePrePayment,
                )
                val res = api.createAppointment(req)
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, success = true)
                } else {
                    val errBody = res.errorBody()?.string() ?: "خطایی رخ داد"
                    _uiState.value = _uiState.value.copy(isLoading = false, error = errBody)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message ?: "خطای اتصال")
            }
        }
    }
}
