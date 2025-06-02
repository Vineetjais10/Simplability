import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants/app_styles.dart';
import '../constants/app_colors.dart';
import '../services/auth_service.dart';
import 'users_page.dart';
import 'farms_page.dart';

class DashboardOverview extends StatefulWidget {
  const DashboardOverview({Key? key}) : super(key: key);

  @override
  State<DashboardOverview> createState() => _DashboardOverviewState();
}

class _DashboardOverviewState extends State<DashboardOverview> {
  int totalUsers = 0;
  int totalFarms = 0;
  bool isLoading = true;
  String? error;
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final token = await _authService.getAccessToken();
      if (token == null) {
        throw Exception('No access token available');
      }
      print('Access Token: $token'); // Debug: Log the token

      // Fetch users
      final usersResponse = await http.get(
        Uri.parse('http://localhost:3000/api/v1/users?pagination[limit]=1'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      // Fetch farms
      final farmsResponse = await http.get(
        Uri.parse('http://localhost:3000/api/v1/farms?pagination[limit]=100'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      print('Users Response Status: ${usersResponse.statusCode}'); // Debug
      print('Users Response Body: ${usersResponse.body}'); // Debug
      print('Farms Response Status: ${farmsResponse.statusCode}'); // Debug
      print('Farms Response Body: ${farmsResponse.body}'); // Debug

      if (usersResponse.statusCode == 200 && farmsResponse.statusCode == 200) {
        final usersData = json.decode(usersResponse.body);
        final farmsData = json.decode(farmsResponse.body);

        // Check for explicit error fields (optional, if API might include them)
        if (usersData['error'] != null) {
          print('Users API error: ${usersData['error']}'); // Debug
          setState(() {
            totalUsers = 0;
            error = 'Users: ${usersData['error']}';
          });
        } else {
          setState(() {
            totalUsers = usersData['total'] ?? 0;
          });
        }

        if (farmsData['error'] != null) {
          print('Farms API error: ${farmsData['error']}'); // Debug
          setState(() {
            totalFarms = 0;
            error =
                error != null
                    ? '$error, Farms: ${farmsData['error']}'
                    : 'Farms: ${farmsData['error']}';
          });
        } else {
          setState(() {
            totalFarms =
                farmsData['total'] ?? (farmsData['data'] as List?)?.length ?? 0;
          });
        }

        setState(() {
          isLoading = false;
        });
      } else if (usersResponse.statusCode == 401 ||
          farmsResponse.statusCode == 401) {
        final refreshResult = await _authService.refreshToken();
        if (!refreshResult['success']) {
          throw Exception(
            'Failed to refresh token: ${refreshResult['message']}',
          );
        }
        final newToken = refreshResult['accessToken'];
        print('New Access Token: $newToken'); // Debug

        // Retry users
        final retryUsersResponse = await http.get(
          Uri.parse('http://localhost:3000/api/v1/users?pagination[limit]=1'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $newToken',
          },
        );
        // Retry farms
        final retryFarmsResponse = await http.get(
          Uri.parse('http://localhost:3000/api/v1/farms?pagination[limit]=100'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $newToken',
          },
        );

        print(
          'Retry Users Response Status: ${retryUsersResponse.statusCode}',
        ); // Debug
        print('Retry Users Response Body: ${retryUsersResponse.body}'); // Debug
        print(
          'Retry Farms Response Status: ${retryFarmsResponse.statusCode}',
        ); // Debug
        print('Retry Farms Response Body: ${retryFarmsResponse.body}'); // Debug

        if (retryUsersResponse.statusCode == 200 &&
            retryFarmsResponse.statusCode == 200) {
          final retryUsersData = json.decode(retryUsersResponse.body);
          final retryFarmsData = json.decode(retryFarmsResponse.body);

          if (retryUsersData['error'] != null) {
            print('Retry Users API error: ${retryUsersData['error']}'); // Debug
            setState(() {
              totalUsers = 0;
              error = 'Users (Retry): ${retryUsersData['error']}';
            });
          } else {
            setState(() {
              totalUsers = retryUsersData['total'] ?? 0;
            });
          }

          if (retryFarmsData['error'] != null) {
            print('Retry Farms API error: ${retryFarmsData['error']}'); // Debug
            setState(() {
              totalFarms = 0;
              error =
                  error != null
                      ? '$error, Farms (Retry): ${retryFarmsData['error']}'
                      : 'Farms (Retry): ${retryFarmsData['error']}';
            });
          } else {
            setState(() {
              totalFarms =
                  retryFarmsData['total'] ??
                  (retryFarmsData['data'] as List?)?.length ??
                  0;
            });
          }

          setState(() {
            isLoading = false;
          });
        } else {
          throw Exception(
            'Retry failed: Users(${retryUsersResponse.statusCode}), Farms(${retryFarmsResponse.statusCode})',
          );
        }
      } else {
        throw Exception(
          'Failed to load data: Users(${usersResponse.statusCode}), Farms(${farmsResponse.statusCode})',
        );
      }
    } catch (e) {
      setState(() {
        error = 'Failed to load data: ${e.toString()}';
        isLoading = false;
      });
      print('Error: $e'); // Debug
    }
  }

  Future<void> _refreshData() async {
    await _fetchDashboardData();
  }

  Widget _buildStatsCard({
    required String title,
    required String count,
    required IconData icon,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, size: 32, color: iconColor),
                Text(
                  count,
                  style: AppStyles.welcomeTitle.copyWith(
                    fontSize: 28,
                    color: AppColors.oliveGreen,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: AppStyles.regularText.copyWith(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.grey[700],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: const Center(child: CircularProgressIndicator()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Admin Dashboard', style: AppStyles.welcomeTitle),
                const SizedBox(height: 24),

                if (error != null)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red[700]),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            error!,
                            style: TextStyle(color: Colors.red[700]),
                          ),
                        ),
                        TextButton(
                          onPressed: _refreshData,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),

                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.2,
                  children: [
                    isLoading
                        ? _buildLoadingCard()
                        : _buildStatsCard(
                          title: 'Total Users',
                          count: totalUsers.toString(),
                          icon: Icons.people,
                          iconColor: Colors.blue,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const UsersPage(),
                              ),
                            );
                          },
                        ),
                    isLoading
                        ? _buildLoadingCard()
                        : _buildStatsCard(
                          title: 'Total Farms',
                          count: totalFarms.toString(),
                          icon: Icons.agriculture,
                          iconColor: AppColors.oliveGreen,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const FarmsPage(),
                              ),
                            );
                          },
                        ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
