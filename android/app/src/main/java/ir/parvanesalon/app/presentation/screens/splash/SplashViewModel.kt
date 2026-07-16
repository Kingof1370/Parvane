package ir.parvanesalon.app.presentation.screens.splash

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import ir.parvanesalon.app.data.local.TokenManager
import javax.inject.Inject

@HiltViewModel
class SplashViewModel @Inject constructor(
    tokenManager: TokenManager
) : ViewModel() {
    val isLoggedIn = tokenManager.isLoggedIn
}
