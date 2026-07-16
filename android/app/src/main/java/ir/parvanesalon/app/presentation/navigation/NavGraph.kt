package ir.parvanesalon.app.presentation.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import ir.parvanesalon.app.presentation.screens.admin.AdminPanelScreen
import ir.parvanesalon.app.presentation.screens.appointments.AppointmentsScreen
import ir.parvanesalon.app.presentation.screens.booking.BookingScreen
import ir.parvanesalon.app.presentation.screens.chat.ChatScreen
import ir.parvanesalon.app.presentation.screens.gallery.GalleryScreen
import ir.parvanesalon.app.presentation.screens.home.HomeScreen
import ir.parvanesalon.app.presentation.screens.loyalty.LoyaltyScreen
import ir.parvanesalon.app.presentation.screens.notifications.NotificationsScreen
import ir.parvanesalon.app.presentation.screens.profile.ProfileScreen
import ir.parvanesalon.app.presentation.screens.services.ServicesScreen
import ir.parvanesalon.app.presentation.screens.splash.SplashScreen
import ir.parvanesalon.app.presentation.screens.auth.LoginScreen
import ir.parvanesalon.app.presentation.screens.staff.StaffDetailScreen

sealed class Screen(val route: String, val label: String? = null, val icon: ImageVector? = null) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Home : Screen("home", "خانه", Icons.Default.Home)
    object Services : Screen("services", "سرویس‌ها", Icons.Default.ContentCut)
    object Appointments : Screen("appointments", "رزروها", Icons.Default.CalendarMonth)
    object Profile : Screen("profile", "پروفایل", Icons.Default.Person)
    object Chat : Screen("chat", "مشاوره", Icons.Default.Chat)
    object Gallery : Screen("gallery")
    object Loyalty : Screen("loyalty")
    object Notifications : Screen("notifications")
    object AdminPanel : Screen("admin")
    object StaffDetail : Screen("staff/{staffId}") {
        fun createRoute(staffId: String) = "staff/$staffId"
    }
    object Booking : Screen("booking/{staffId}?serviceId={serviceId}&styleUrl={styleUrl}&styleId={styleId}") {
        fun createRoute(
            staffId: String,
            serviceId: String? = null,
            styleUrl: String? = null,
            styleId: String? = null
        ): String = "booking/$staffId?serviceId=${serviceId ?: ""}&styleUrl=${styleUrl ?: ""}&styleId=${styleId ?: ""}"
    }
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Services,
    Screen.Appointments,
    Screen.Chat,
    Screen.Profile,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavGraph(
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Splash.route
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val showBottomBar = bottomNavItems.any { currentRoute == it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(containerColor = Color.White) {
                    bottomNavItems.forEach { screen ->
                        NavigationBarItem(
                            selected = currentRoute == screen.route,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(Screen.Home.route) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(screen.icon ?: Icons.Default.Home, screen.label) },
                            label = { Text(screen.label ?: "") },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color(0xFFE91E8C),
                                selectedTextColor = Color(0xFFE91E8C),
                                indicatorColor = Color(0xFFFCE4EC),
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Splash.route) {
                SplashScreen(
                    onNavigateToLogin = {
                        navController.navigate(Screen.Login.route) { popUpTo(0) { inclusive = true } }
                    },
                    onNavigateToHome = {
                        navController.navigate(Screen.Home.route) { popUpTo(0) { inclusive = true } }
                    }
                )
            }

            composable(Screen.Login.route) {
                LoginScreen(
                    onSuccess = {
                        navController.navigate(Screen.Home.route) { popUpTo(0) { inclusive = true } }
                    }
                )
            }

            composable(Screen.Home.route) {
                HomeScreen(
                    onNavigate = { route -> navController.navigate(route) },
                    onStaffClick = { staffId -> navController.navigate(Screen.StaffDetail.createRoute(staffId)) }
                )
            }

            composable(Screen.Services.route) {
                ServicesScreen(
                    onNavigateToBooking = { serviceId, staffId ->
                        navController.navigate(Screen.Booking.createRoute(staffId, serviceId))
                    },
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Appointments.route) {
                AppointmentsScreen(onBack = { navController.popBackStack() })
            }

            composable(Screen.Chat.route) { ChatScreen() }

            composable(Screen.Gallery.route) {
                GalleryScreen(
                    onSelectStyle = { style ->
                        // گالری — style انتخاب شده به صفحه booking می‌رود
                        // staffId از اولین متخصص پیش‌فرض (یا navigator)
                        navController.navigate(
                            Screen.Booking.createRoute(
                                staffId = "default",
                                styleUrl = style.imageUrl,
                                styleId = style.id
                            )
                        )
                    }
                )
            }

            composable(Screen.Loyalty.route) { LoyaltyScreen() }

            composable(Screen.Notifications.route) { NotificationsScreen() }

            composable(Screen.AdminPanel.route) {
                AdminPanelScreen(onBack = { navController.popBackStack() })
            }

            composable(Screen.StaffDetail.route) { backStackEntry ->
                val staffId = backStackEntry.arguments?.getString("staffId") ?: return@composable
                StaffDetailScreen(
                    staffId = staffId,
                    onBack = { navController.popBackStack() },
                    onBooking = { sid -> navController.navigate(Screen.Booking.createRoute(sid)) }
                )
            }

            composable(Screen.Booking.route) { backStackEntry ->
                val staffId = backStackEntry.arguments?.getString("staffId") ?: return@composable
                val serviceId = backStackEntry.arguments?.getString("serviceId")?.ifBlank { null }
                val styleUrl = backStackEntry.arguments?.getString("styleUrl")?.ifBlank { null }
                val styleId = backStackEntry.arguments?.getString("styleId")?.ifBlank { null }
                BookingScreen(
                    staffId = staffId,
                    serviceId = serviceId,
                    selectedStyleImageUrl = styleUrl,
                    selectedStyleGalleryId = styleId,
                    onBack = { navController.popBackStack() },
                    onSuccess = {
                        navController.navigate(Screen.Appointments.route) {
                            popUpTo(Screen.Home.route)
                        }
                    }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    onLogout = {
                        navController.navigate(Screen.Login.route) { popUpTo(0) { inclusive = true } }
                    },
                    onNavigateToLoyalty = { navController.navigate(Screen.Loyalty.route) },
                    onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateToAdmin = { navController.navigate(Screen.AdminPanel.route) }
                )
            }
        }
    }
}

@Composable
fun ParvaneNavHost() = AppNavGraph()
