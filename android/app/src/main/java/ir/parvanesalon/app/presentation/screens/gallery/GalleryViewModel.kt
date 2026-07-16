package ir.parvanesalon.app.presentation.screens.gallery

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.remote.ApiService
import ir.parvanesalon.app.data.remote.models.CategoryDto
import ir.parvanesalon.app.data.remote.models.StyleGalleryItemDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class GalleryUiState(
    val isLoading: Boolean = false,
    val items: List<StyleGalleryItemDto> = emptyList(),
    val categories: List<CategoryDto> = emptyList(),
    val selectedCategoryId: String? = null,
    val searchQuery: String = "",
    val selectedItem: StyleGalleryItemDto? = null,
    val error: String? = null,
)

@HiltViewModel
class GalleryViewModel @Inject constructor(
    private val api: ApiService
) : ViewModel() {

    private val _uiState = MutableStateFlow(GalleryUiState())
    val uiState: StateFlow<GalleryUiState> = _uiState.asStateFlow()

    init {
        loadGallery()
        loadCategories()
    }

    fun loadGallery(categoryId: String? = null, search: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val res = api.getGallery(categoryId = categoryId, search = search?.ifBlank { null })
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        items = res.body() ?: emptyList()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false, error = "خطا در بارگذاری گالری")
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    private fun loadCategories() {
        viewModelScope.launch {
            try {
                val res = api.getCategories()
                if (res.isSuccessful) {
                    _uiState.value = _uiState.value.copy(categories = res.body() ?: emptyList())
                }
            } catch (_: Exception) {}
        }
    }

    fun selectCategory(categoryId: String?) {
        _uiState.value = _uiState.value.copy(selectedCategoryId = categoryId)
        loadGallery(categoryId = categoryId, search = _uiState.value.searchQuery.ifBlank { null })
    }

    fun search(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        loadGallery(
            categoryId = _uiState.value.selectedCategoryId,
            search = query.ifBlank { null }
        )
    }

    fun selectItem(item: StyleGalleryItemDto?) {
        _uiState.value = _uiState.value.copy(selectedItem = item)
    }

    fun likeItem(itemId: String) {
        viewModelScope.launch {
            try {
                api.likeGalleryItem(itemId)
                val updatedItems = _uiState.value.items.map {
                    if (it.id == itemId) it.copy(likesCount = it.likesCount + 1) else it
                }
                _uiState.value = _uiState.value.copy(items = updatedItems)
            } catch (_: Exception) {}
        }
    }
}
