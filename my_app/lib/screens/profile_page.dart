import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import '../constants/app_styles.dart';
import '../constants/app_colors.dart';
import '../services/auth_service.dart';

// User profile model to parse API response
class UserProfile {
  final String id;
  final String name;
  final String username;
  final String email;
  final String? phoneNumber;
  final String? profileImage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> roles;

  UserProfile({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    this.phoneNumber,
    this.profileImage,
    required this.createdAt,
    required this.updatedAt,
    required this.roles,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    // Log the raw JSON to debug the response
    print('[${DateTime.now().toIso8601String()}] UserProfile JSON: $json');

    // Handle the case where Roles might be null
    final rolesList =
        json['Roles'] as List<dynamic>?; // Safely cast to List<dynamic> or null
    final roles =
        rolesList != null
            ? rolesList.map((role) => role['name'] as String).toList()
            : <String>[]; // Default to empty list if null

    return UserProfile(
      id: json['id'],
      name: json['name'],
      username: json['username'],
      email: json['email'],
      phoneNumber: json['phone_number'],
      profileImage: json['profile_image'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      roles: roles,
    );
  }
}

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final AuthService _authService = AuthService();
  Future<UserProfile>? _userProfileFuture;

  @override
  void initState() {
    super.initState();
    _userProfileFuture = _fetchUserProfile();
  }

  // Function to fetch user profile from API with token refresh
  Future<UserProfile> _fetchUserProfile() async {
    final accessToken = await _authService.getAccessToken();
    if (accessToken == null) {
      throw Exception('No access token found. Please log in.');
    }

    final url = Uri.parse('${AuthService.baseUrl}/users/me');
    try {
      final response = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print('[${DateTime.now().toIso8601String()}] Profile response: $data');
        if (data['success']) {
          return UserProfile.fromJson(data['data']);
        } else {
          throw Exception(data['message'] ?? 'Failed to fetch user profile');
        }
      } else if (response.statusCode == 401) {
        // Attempt to refresh token
        final refreshResult = await _authService.refreshToken();
        if (refreshResult['success']) {
          final newAccessToken = refreshResult['accessToken'];
          final retryResponse = await http.get(
            url,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $newAccessToken',
            },
          );
          if (retryResponse.statusCode == 200) {
            final retryData = jsonDecode(retryResponse.body);
            print(
              '[${DateTime.now().toIso8601String()}] Retry response: $retryData',
            );
            if (retryData['success']) {
              return UserProfile.fromJson(retryData['data']);
            } else {
              throw Exception(
                retryData['message'] ??
                    'Failed to fetch user profile after token refresh',
              );
            }
          } else {
            throw Exception(
              'Failed to fetch user profile after token refresh: ${retryResponse.statusCode}',
            );
          }
        } else {
          // Navigate to login screen if refresh fails
          Navigator.pushReplacementNamed(context, '/login');
          throw Exception('Session expired. Please log in again.');
        }
      } else {
        throw Exception('Failed to fetch user profile: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching profile: $e');
    }
  }

  // Function to retry fetching profile
  void _retryFetchProfile() {
    setState(() {
      _userProfileFuture = _fetchUserProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          title: Text('My Profile', style: AppStyles.welcomeTitle),
          backgroundColor: AppColors.oliveGreen.withOpacity(0.1),
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: FutureBuilder<UserProfile>(
            future: _userProfileFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        snapshot.error.toString().contains('Session expired')
                            ? 'Session expired. Please log in again.'
                            : 'Error: ${snapshot.error}',
                        style: AppStyles.regularText.copyWith(
                          color: AppColors.oliveGreen,
                          fontSize: 16,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: _retryFetchProfile,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.oliveGreen,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          'Retry',
                          style: AppStyles.regularText.copyWith(
                            color: Colors.white,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              } else if (snapshot.hasData) {
                final user = snapshot.data!;
                return SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Center(
                        child: CircleAvatar(
                          radius: 60,
                          backgroundImage:
                              user.profileImage != null
                                  ? NetworkImage(user.profileImage!)
                                  : null,
                          child:
                              user.profileImage == null
                                  ? Text(
                                    user.name.isNotEmpty
                                        ? user.name[0].toUpperCase()
                                        : 'U',
                                    style: const TextStyle(
                                      fontSize: 40,
                                      color: AppColors.oliveGreen,
                                    ),
                                  )
                                  : null,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        user.name,
                        style: AppStyles.regularText.copyWith(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: AppColors.oliveGreen,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildProfileItem('Username', user.username),
                              const SizedBox(height: 12),
                              _buildProfileItem('Email', user.email),
                              const SizedBox(height: 12),
                              if (user.phoneNumber != null)
                                _buildProfileItem('Phone', user.phoneNumber!),
                              if (user.phoneNumber != null)
                                const SizedBox(height: 12),
                              _buildProfileItem('Roles', user.roles.join(', ')),
                              const SizedBox(height: 12),
                              _buildProfileItem(
                                'Joined',
                                DateFormat(
                                  'MMM dd, yyyy',
                                ).format(user.createdAt.toLocal()),
                              ),
                              const SizedBox(height: 12),
                              _buildProfileItem(
                                'Last Updated',
                                DateFormat(
                                  'MMM dd, yyyy',
                                ).format(user.updatedAt.toLocal()),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              } else {
                return Center(
                  child: Text(
                    'No profile data available',
                    style: AppStyles.regularText.copyWith(
                      color: AppColors.oliveGreen,
                      fontSize: 16,
                    ),
                  ),
                );
              }
            },
          ),
        ),
      ),
    );
  }

  Widget _buildProfileItem(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$label: ',
          style: AppStyles.regularText.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.oliveGreen,
            fontSize: 16,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: AppStyles.regularText.copyWith(
              color: AppColors.oliveGreen,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }
}
