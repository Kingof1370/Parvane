package ir.parvanesalon.app.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import ir.parvanesalon.app.presentation.screens.auth.LoginScreen
import ir.parvanesalon.app.presentation.screens.home.HomeScreen
import ir.parvanesalon.app.presentation.screens.booking.BookingScreen
import ir.parvanesalon.app.presentation.screens.appointments.AppointmentsScreen
import ir.parvanesalon.app.presentation.screens.profile.ProfileScreen
import ir.parvanesalon.app.presentation.screens.services.ServicesScreen
import ir.parvanesalon.app.presentation.screens.splash.SplashScreen
import ir.parvanesalon.app.presentation.screens.staff.StaffDetailScreen

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Login : Screen("login")
    object Home : Screen("home")
    object Services : Screen("services")
    object Booking : Screen("booking/{serviceId}/{staffId}") {
        fun createRoute(serviceId: String, staffId: String) = "booking/$serviceId/$staffId"
    }
    object Appointments : Screen("appointments")
    object Profile : Screen("profile")
    object StaffDetail : Screen("staff/{staffId}") {
        fun createRoute(staffId: String) = "staff/$staffId"
    }
}

@Composable
fun ParvaneNavHost(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                },
                onNavigateToHome = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Login.route) {
            LoginScreen(
                onSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToServices = { navController.navigate(Screen.Services.route) },
                onNavigateToAppointments = { navController.navigate(Screen.Appointments.route) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) },
                onNavigateToStaff = { staffId -> navController.navigate(Screen.StaffDetail.createRoute(staffId)) }
            )
        }

        composable(Screen.Services.route) {
            ServicesScreen(
                onNavigateToBooking = { serviceId, staffId ->
                    navController.navigate(Screen.Booking.createRoute(serviceId, staffId))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Booking.route) { backStack ->
            val serviceId = backStack.arguments?.getString("serviceId") ?: ""
            val staffId = backStack.arguments?.getString("staffId") ?: ""
            BookingScreen(
                serviceId = serviceId,
                staffId = staffId,
                onSuccess = { navController.navigate(Screen.Appointments.route) },
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Appointments.route) {
            AppointmentsScreen(
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(Screen.StaffDetail.route) { backStack ->
            val staffId = backStack.arguments?.getString("staffId") ?: ""
            StaffDetailScreen(
                staffId = staffId,
                onBook = { serviceId -> navController.navigate(Screen.Booking.createRoute(serviceId, staffId)) },
                onBack = { navController.popBackStack() }
            )
        }
    }
}
