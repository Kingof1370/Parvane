package ir.parvanesalon.app.presentation.screens.chat

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

data class ChatUiState(
    val isLoading: Boolean = false,
    val rooms: List<ChatRoomDto> = emptyList(),
    val selectedRoom: ChatRoomDto? = null,
    val messages: List<ChatMessageDto> = emptyList(),
    val messagesLoading: Boolean = false,
    val error: String? = null,
    val newRoomCreated: ChatRoomDto? = null,
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val api: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    init { loadRooms() }

    fun loadRooms() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val res = api.getMyChatRooms()
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(isLoading = false, rooms = res.body() ?: emptyList())
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "خطا در بارگذاری گفتگوها")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun createRoom(subject: String?, serviceCategory: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            try {
                val res = api.createChatRoom(CreateChatRoomRequest(subject = subject, serviceCategory = serviceCategory))
                if (res.isSuccessful) {
                    val room = res.body()!!
                    _uiState.value = _uiState.value.copy(isLoading = false, newRoomCreated = room)
                    loadRooms()
                    selectRoom(room)
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "خطا در ایجاد گفتگو")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun selectRoom(room: ChatRoomDto) {
        _uiState.value = _uiState.value.copy(selectedRoom = room, messages = emptyList(), messagesLoading = true)
        loadMessages(room.id)
    }

    private fun loadMessages(roomId: String) {
        viewModelScope.launch {
            try {
                val res = api.getChatMessages(roomId)
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        messagesLoading = false,
                        messages = res.body()?.messages ?: emptyList()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(messagesLoading = false)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(messagesLoading = false)
            }
        }
    }

    fun sendMessage(content: String) {
        val roomId = _uiState.value.selectedRoom?.id ?: return
        viewModelScope.launch {
            try {
                val res = api.sendChatMessage(roomId, SendMessageRequest(content = content))
                if (res.isSuccessful) {
                    loadMessages(roomId)
                }
            } catch (_: Exception) {}
        }
    }

    fun clearNewRoom() {
        _uiState.value = _uiState.value.copy(newRoomCreated = null)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
