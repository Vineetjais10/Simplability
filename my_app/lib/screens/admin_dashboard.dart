// import 'package:flutter/material.dart';
// import '../constants/app_styles.dart';
// import '../constants/app_colors.dart';
// import '../widgets/farm_decorations.dart';
// import 'dashboard_overview.dart';
// import 'profile_page.dart';
// import '../services/auth_service.dart';

// class AdminDashboard extends StatefulWidget {
//   const AdminDashboard({Key? key}) : super(key: key);

//   @override
//   State<AdminDashboard> createState() => _AdminDashboardState();
// }

// class _AdminDashboardState extends State<AdminDashboard> {
//   int _selectedIndex = 0;
//   final AuthService _authService = AuthService();

//   final List<Widget> _pages = [const DashboardOverview(), const ProfilePage()];

//   void _onItemTapped(int index) {
//     if (index == 2) {
//       // Logout tapped
//       _showLogoutDialog();
//     } else {
//       setState(() {
//         _selectedIndex = index;
//       });
//     }
//   }

//   Future<void> _showLogoutDialog() async {
//     showDialog(
//       context: context,
//       builder: (BuildContext context) {
//         return AlertDialog(
//           backgroundColor: AppColors.paleGreen,
//           shape: RoundedRectangleBorder(
//             borderRadius: BorderRadius.circular(12),
//           ),
//           title: Text(
//             'Confirm Logout',
//             style: AppStyles.welcomeTitle.copyWith(
//               fontSize: 24,
//               color: AppColors.darkGreen,
//             ),
//           ),
//           content: Text(
//             'Are you sure you want to log out?',
//             style: AppStyles.regularText,
//           ),
//           actions: [
//             TextButton(
//               onPressed: () => Navigator.of(context).pop(),
//               child: Text('No', style: AppStyles.linkText),
//             ),
//             ElevatedButton(
//               style: AppStyles.primaryButtonStyle,
//               onPressed: () async {
//                 Navigator.of(context).pop(); // Close dialog
//                 final result = await _authService.logout();
//                 if (result['success']) {
//                   ScaffoldMessenger.of(context).showSnackBar(
//                     SnackBar(
//                       content: Text(
//                         'Logged out successfully',
//                         style: AppStyles.regularText,
//                       ),
//                       backgroundColor: const Color.fromARGB(255, 244, 244, 244),
//                       duration: Duration(seconds: 2),
//                     ),
//                   );
//                   Navigator.pushNamedAndRemoveUntil(
//                     context,
//                     '/login',
//                     (route) => false,
//                   );
//                 } else {
//                   ScaffoldMessenger.of(context).showSnackBar(
//                     SnackBar(
//                       content: Text(
//                         result['message'] ?? 'Failed to log out',
//                         style: AppStyles.regularText,
//                       ),
//                       backgroundColor: Colors.red,
//                       duration: Duration(seconds: 3),
//                     ),
//                   );
//                 }
//               },
//               child: Text(
//                 'Yes',
//                 style: AppStyles.regularText.copyWith(color: Colors.white),
//               ),
//             ),
//           ],
//         );
//       },
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       body: Container(
//         decoration: AppStyles.backgroundGradientDecoration,
//         child: Row(
//           children: [
//             // Sidebar
//             NavigationRail(
//               backgroundColor: AppColors.primaryGreen.withOpacity(0.9),
//               selectedIndex: _selectedIndex,
//               onDestinationSelected: _onItemTapped,
//               labelType: NavigationRailLabelType.all,
//               destinations: [
//                 NavigationRailDestination(
//                   icon: Icon(Icons.dashboard, color: AppColors.lightGreen),
//                   selectedIcon: Icon(
//                     Icons.dashboard,
//                     color: AppColors.paleGreen,
//                   ),
//                   label: Text(
//                     'Overview',
//                     style: AppStyles.regularText.copyWith(
//                       color: AppColors.paleGreen,
//                     ),
//                   ),
//                 ),
//                 NavigationRailDestination(
//                   icon: Icon(Icons.person, color: AppColors.lightGreen),
//                   selectedIcon: Icon(Icons.person, color: AppColors.paleGreen),
//                   label: Text(
//                     'Profile',
//                     style: AppStyles.regularText.copyWith(
//                       color: AppColors.paleGreen,
//                     ),
//                   ),
//                 ),
//                 NavigationRailDestination(
//                   icon: Icon(Icons.logout, color: AppColors.lightGreen),
//                   selectedIcon: Icon(Icons.logout, color: AppColors.paleGreen),
//                   label: Text(
//                     'Logout',
//                     style: AppStyles.regularText.copyWith(
//                       color: AppColors.paleGreen,
//                     ),
//                   ),
//                 ),
//               ],
//             ),
//             // Main content
//             Expanded(
//               child: Column(
//                 children: [
//                   Expanded(child: _pages[_selectedIndex]),
//                   const FarmDecorations(),
//                 ],
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import '../constants/app_styles.dart';
import '../constants/app_colors.dart';
import '../widgets/farm_decorations.dart';
import 'dashboard_overview.dart';
import 'profile_page.dart';
import '../services/auth_service.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({Key? key}) : super(key: key);

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _selectedIndex = 0;
  final AuthService _authService = AuthService();
  final GlobalKey<ScaffoldMessengerState> _scaffoldMessengerKey =
      GlobalKey<ScaffoldMessengerState>();

  final List<Widget> _pages = [const DashboardOverview(), const ProfilePage()];

  void _onItemTapped(int index) {
    if (index == 2) {
      // Logout tapped
      _showLogoutDialog();
    } else {
      setState(() {
        _selectedIndex = index;
      });
    }
  }

  Future<void> _showLogoutDialog() async {
    // Capture the parent context (AdminDashboard's context) before opening the dialog
    final parentContext = context;

    await showDialog(
      context: parentContext,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          backgroundColor: AppColors.paleGreen,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          title: Text(
            'Confirm Logout',
            style: AppStyles.welcomeTitle.copyWith(
              fontSize: 24,
              color: AppColors.darkGreen,
            ),
          ),
          content: Text(
            'Are you sure you want to log out?',
            style: AppStyles.regularText,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: Text('No', style: AppStyles.linkText),
            ),
            ElevatedButton(
              style: AppStyles.primaryButtonStyle,
              onPressed: () async {
                Navigator.of(dialogContext).pop(); // Close dialog
                final result = await _authService.logout();
                // Defer UI updates to ensure widget tree is stable
                Future.microtask(() {
                  if (result['success']) {
                    _scaffoldMessengerKey.currentState?.showSnackBar(
                      SnackBar(
                        content: Text(
                          'Logged out successfully',
                          style: AppStyles.regularText,
                        ),
                        backgroundColor: const Color.fromARGB(
                          255,
                          244,
                          244,
                          244,
                        ),
                        duration: const Duration(seconds: 2),
                      ),
                    );
                    // Navigate to login screen and clear navigation stack
                    Navigator.of(
                      parentContext,
                    ).pushNamedAndRemoveUntil('/login', (route) => false);
                  } else {
                    _scaffoldMessengerKey.currentState?.showSnackBar(
                      SnackBar(
                        content: Text(
                          result['message'] ?? 'Failed to log out',
                          style: AppStyles.regularText,
                        ),
                        backgroundColor: Colors.red,
                        duration: const Duration(seconds: 3),
                      ),
                    );
                  }
                });
              },
              child: Text(
                'Yes',
                style: AppStyles.regularText.copyWith(color: Colors.white),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Assign the GlobalKey to ScaffoldMessenger
      key: _scaffoldMessengerKey,
      body: Container(
        decoration: AppStyles.backgroundGradientDecoration,
        child: Row(
          children: [
            // Sidebar
            NavigationRail(
              backgroundColor: AppColors.primaryGreen.withOpacity(0.9),
              selectedIndex: _selectedIndex,
              onDestinationSelected: _onItemTapped,
              labelType: NavigationRailLabelType.all,
              destinations: [
                NavigationRailDestination(
                  icon: Icon(Icons.dashboard, color: AppColors.lightGreen),
                  selectedIcon: Icon(
                    Icons.dashboard,
                    color: AppColors.paleGreen,
                  ),
                  label: Text(
                    'Overview',
                    style: AppStyles.regularText.copyWith(
                      color: AppColors.paleGreen,
                    ),
                  ),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.person, color: AppColors.lightGreen),
                  selectedIcon: Icon(Icons.person, color: AppColors.paleGreen),
                  label: Text(
                    'Profile',
                    style: AppStyles.regularText.copyWith(
                      color: AppColors.paleGreen,
                    ),
                  ),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.logout, color: AppColors.lightGreen),
                  selectedIcon: Icon(Icons.logout, color: AppColors.paleGreen),
                  label: Text(
                    'Logout',
                    style: AppStyles.regularText.copyWith(
                      color: AppColors.paleGreen,
                    ),
                  ),
                ),
              ],
            ),
            // Main content
            Expanded(
              child: Column(
                children: [
                  Expanded(child: _pages[_selectedIndex]),
                  const FarmDecorations(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
