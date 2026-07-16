package ir.parvanesalon.app.presentation.screens.gallery

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import ir.parvanesalon.app.data.remote.models.StyleGalleryItemDto

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GalleryScreen(
    onSelectStyle: ((StyleGalleryItemDto) -> Unit)? = null,
    viewModel: GalleryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var searchText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFFAF7FF))
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.horizontalGradient(listOf(Color(0xFFE91E8C), Color(0xFF9C27B0)))
                )
                .padding(20.dp)
        ) {
            Column {
                Text(
                    "گالری استایل‌ها",
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "مدل مورد نظر خود را انتخاب کنید",
                    color = Color.White.copy(alpha = 0.8f),
                    fontSize = 14.sp
                )
            }
        }

        // Search bar
        OutlinedTextField(
            value = searchText,
            onValueChange = {
                searchText = it
                viewModel.search(it)
            },
            placeholder = { Text("جستجو در استایل‌ها...", fontSize = 14.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Color(0xFFE91E8C)) },
            trailingIcon = {
                if (searchText.isNotEmpty()) {
                    IconButton(onClick = { searchText = ""; viewModel.search("") }) {
                        Icon(Icons.Default.Close, contentDescription = null)
                    }
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            shape = RoundedCornerShape(16.dp),
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFFE91E8C),
                focusedLabelColor = Color(0xFFE91E8C)
            )
        )

        // Category filter chips
        if (uiState.categories.isNotEmpty()) {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                item {
                    FilterChip(
                        selected = uiState.selectedCategoryId == null,
                        onClick = { viewModel.selectCategory(null) },
                        label = { Text("همه") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFFE91E8C),
                            selectedLabelColor = Color.White,
                        )
                    )
                }
                items(uiState.categories) { cat ->
                    FilterChip(
                        selected = uiState.selectedCategoryId == cat.id,
                        onClick = { viewModel.selectCategory(cat.id) },
                        label = { Text(cat.name) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFFE91E8C),
                            selectedLabelColor = Color.White,
                        )
                    )
                }
            }
        }

        if (uiState.isLoading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFFE91E8C))
            }
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                contentPadding = PaddingValues(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(uiState.items) { item ->
                    GalleryItemCard(
                        item = item,
                        onLike = { viewModel.likeItem(item.id) },
                        onClick = {
                            if (onSelectStyle != null) {
                                onSelectStyle(item)
                            } else {
                                viewModel.selectItem(item)
                            }
                        }
                    )
                }
            }
        }
    }

    // Detail dialog
    uiState.selectedItem?.let { item ->
        Dialog(
            onDismissRequest = { viewModel.selectItem(null) },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Box(
                Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.9f))
                    .clickable { viewModel.selectItem(null) }
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.Center)
                        .background(Color.White, RoundedCornerShape(24.dp))
                        .padding(20.dp)
                        .padding(horizontal = 16.dp)
                ) {
                    AsyncImage(
                        model = item.imageUrl,
                        contentDescription = item.title,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(320.dp)
                            .clip(RoundedCornerShape(16.dp)),
                        contentScale = ContentScale.Crop
                    )
                    Spacer(Modifier.height(16.dp))
                    Text(item.title, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    item.description?.let { Text(it, fontSize = 14.sp, color = Color.Gray, modifier = Modifier.padding(top = 4.dp)) }
                    item.staffName?.let {
                        Text("متخصص: $it", fontSize = 13.sp, color = Color(0xFFE91E8C), modifier = Modifier.padding(top = 4.dp))
                    }
                    item.duration?.let {
                        Text("مدت: $it", fontSize = 13.sp, color = Color.Gray, modifier = Modifier.padding(top = 2.dp))
                    }
                    Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Favorite, null, tint = Color(0xFFE91E8C), modifier = Modifier.size(16.dp))
                        Text(" ${item.likesCount}", fontSize = 14.sp, color = Color.Gray)
                    }
                    Spacer(Modifier.height(16.dp))
                    Button(
                        onClick = { viewModel.selectItem(null) },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE91E8C)),
                        shape = RoundedCornerShape(14.dp)
                    ) { Text("بستن", color = Color.White) }
                }
            }
        }
    }
}

@Composable
private fun GalleryItemCard(
    item: StyleGalleryItemDto,
    onLike: () -> Unit,
    onClick: () -> Unit
) {
    var liked by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            Box {
                AsyncImage(
                    model = item.imageUrl,
                    contentDescription = item.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    contentScale = ContentScale.Crop
                )
                IconButton(
                    onClick = { liked = !liked; onLike() },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(4.dp)
                        .size(32.dp)
                        .background(Color.White.copy(alpha = 0.8f), CircleShape)
                ) {
                    Icon(
                        if (liked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        null,
                        tint = Color(0xFFE91E8C),
                        modifier = Modifier.size(18.dp)
                    )
                }
                item.category?.let { cat ->
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(8.dp)
                            .background(Color.Black.copy(alpha = 0.6f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(cat.name, color = Color.White, fontSize = 11.sp)
                    }
                }
            }
            Column(Modifier.padding(12.dp)) {
                Text(item.title, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1)
                item.staffName?.let {
                    Text(it, fontSize = 12.sp, color = Color(0xFFE91E8C))
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Favorite, null, tint = Color(0xFFE91E8C), modifier = Modifier.size(13.dp))
                    Text(" ${item.likesCount}", fontSize = 12.sp, color = Color.Gray)
                }
            }
        }
    }
}
