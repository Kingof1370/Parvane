package ir.parvanesalon.app.data.local

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "parvane_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        private const val ACCESS_TOKEN = "access_token"
        private const val REFRESH_TOKEN = "refresh_token"
        private const val USER_ID = "user_id"
        private const val USER_ROLE = "user_role"
    }

    private fun getPrefFlow(key: String): Flow<String?> = callbackFlow {
        trySend(sharedPrefs.getString(key, null))
        val listener = SharedPreferences.OnSharedPreferenceChangeListener { _, changedKey ->
            if (changedKey == key) {
                trySend(sharedPrefs.getString(key, null))
            }
        }
        sharedPrefs.registerOnSharedPreferenceChangeListener(listener)
        awaitClose {
            sharedPrefs.unregisterOnSharedPreferenceChangeListener(listener)
        }
    }

    val accessToken: Flow<String?> = getPrefFlow(ACCESS_TOKEN)
    val refreshToken: Flow<String?> = getPrefFlow(REFRESH_TOKEN)
    val userId: Flow<String?> = getPrefFlow(USER_ID)
    val userRole: Flow<String?> = getPrefFlow(USER_ROLE)
    val isLoggedIn: Flow<Boolean> = accessToken.map { it != null }

    suspend fun saveTokens(accessToken: String, refreshToken: String, userId: String, role: String) {
        sharedPrefs.edit().apply {
            putString(ACCESS_TOKEN, accessToken)
            putString(REFRESH_TOKEN, refreshToken)
            putString(USER_ID, userId)
            putString(USER_ROLE, role)
            apply()
        }
    }

    suspend fun clearAll() {
        sharedPrefs.edit().clear().apply()
    }
}
