import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  final _storage = const FlutterSecureStorage();
  static const String baseUrl = 'http://localhost:3000/api/v1';

  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');
    print('[${DateTime.now().toIso8601String()}] Login request: $url');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      print(
        '[${DateTime.now().toIso8601String()}] Login response: ${response.statusCode} ${response.body}',
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (data['success'] == true) {
        await _storage.write(
          key: 'accessToken',
          value: data['data']['accessToken'],
        );
        await _storage.write(
          key: 'refreshToken',
          value: data['data']['refreshToken'],
        );
        await _storage.write(
          key: 'roles',
          value: jsonEncode(data['data']['roles']),
        );

        final roles = data['data']['roles'] as List<dynamic>;
        final isAdmin = roles.contains('admin');

        return {'success': true, 'isAdmin': isAdmin};
      } else {
        return {'success': false, 'message': data['message'] ?? 'Login failed'};
      }
    } catch (e) {
      print('[${DateTime.now().toIso8601String()}] Login error: $e');
      return {'success': false, 'message': 'Error during login: $e'};
    }
  }

  Future<String?> getAccessToken() async {
    final token = await _storage.read(key: 'accessToken');
    print(
      '[${DateTime.now().toIso8601String()}] Retrieved accessToken: $token',
    );
    return token;
  }

  Future<String?> getRefreshToken() async {
    final token = await _storage.read(key: 'refreshToken');
    print(
      '[${DateTime.now().toIso8601String()}] Retrieved refreshToken: $token',
    );
    return token;
  }

  Future<List<String>?> getRoles() async {
    final rolesString = await _storage.read(key: 'roles');
    if (rolesString != null) {
      final roles = List<String>.from(jsonDecode(rolesString));
      print('[${DateTime.now().toIso8601String()}] Retrieved roles: $roles');
      return roles;
    }
    print('[${DateTime.now().toIso8601String()}] No roles found');
    return null;
  }

  Future<Map<String, dynamic>> refreshToken() async {
    final url = Uri.parse('$baseUrl/auth/refresh');
    final accessToken = await getAccessToken();
    final refreshToken = await getRefreshToken();
    print(
      '[${DateTime.now().toIso8601String()}] Refresh request: $url, accessToken: $accessToken, refreshToken: $refreshToken',
    );

    if (accessToken == null) {
      return {'success': false, 'message': 'No access token available'};
    }
    if (refreshToken == null) {
      return {'success': false, 'message': 'No refresh token available'};
    }

    // Check if accessToken is a valid JWT and expired
    bool isAccessTokenExpired = false;
    try {
      final parts = accessToken.split('.');
      if (parts.length == 3) {
        final payload = jsonDecode(
          utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
        );
        print(
          '[${DateTime.now().toIso8601String()}] Access token payload: $payload',
        );
        final expiry = payload['exp'] as int?;
        if (expiry != null) {
          final expiryDate = DateTime.fromMillisecondsSinceEpoch(expiry * 1000);
          isAccessTokenExpired = expiryDate.isBefore(DateTime.now());
          print(
            '[${DateTime.now().toIso8601String()}] Access token expiry: $expiryDate, expired: $isAccessTokenExpired',
          );
        }
      }
    } catch (e) {
      print(
        '[${DateTime.now().toIso8601String()}] Failed to decode access token: $e',
      );
    }

    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $accessToken',
        },
        body: jsonEncode({'refresh_token': refreshToken}),
      );
      print(
        '[${DateTime.now().toIso8601String()}] Refresh response: ${response.statusCode} ${response.body}',
      );

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['success'] == true) {
        final newAccessToken = data['data']['accessToken'];
        await _storage.write(key: 'accessToken', value: newAccessToken);
        print(
          '[${DateTime.now().toIso8601String()}] New accessToken stored: $newAccessToken',
        );
        return {'success': true, 'accessToken': newAccessToken};
      } else {
        return {
          'success': false,
          'message':
              data['message'] ??
              'Failed to refresh token: ${response.statusCode}',
          'error': data['error']?.toString() ?? 'Unknown error',
        };
      }
    } catch (e) {
      print('[${DateTime.now().toIso8601String()}] Refresh error: $e');
      return {
        'success': false,
        'message': 'Error during token refresh: $e',
        'isAccessTokenExpired': isAccessTokenExpired,
      };
    }
  }

  Future<Map<String, dynamic>> logout() async {
    final refreshTokenValue = await getRefreshToken();
    final accessToken = await getAccessToken();
    print(
      '[${DateTime.now().toIso8601String()}] Logout request: accessToken: $accessToken, refreshToken: $refreshTokenValue',
    );

    // Helper function to clear tokens from storage
    Future<void> clearTokens() async {
      try {
        await _storage.delete(key: 'accessToken');
        await _storage.delete(key: 'refreshToken');
        await _storage.delete(key: 'roles');
        print(
          '[${DateTime.now().toIso8601String()}] Tokens cleared after logout',
        );
      } catch (e) {
        print(
          '[${DateTime.now().toIso8601String()}] Error clearing tokens: $e',
        );
      }
    }

    // Check if tokens are missing
    if (refreshTokenValue == null || accessToken == null) {
      await clearTokens();
      return {
        'success': false,
        'message': 'No valid tokens available, cleared local storage',
      };
    }

    // Check accessToken expiry
    bool isAccessTokenExpired = false;
    try {
      final parts = accessToken.split('.');
      if (parts.length == 3) {
        final payload = jsonDecode(
          utf8.decode(base64Url.decode(base64Url.normalize(parts[1]))),
        );
        print(
          '[${DateTime.now().toIso8601String()}] Access token payload: $payload',
        );
        final expiry = payload['exp'] as int?;
        if (expiry != null) {
          final expiryDate = DateTime.fromMillisecondsSinceEpoch(expiry * 1000);
          isAccessTokenExpired = expiryDate.isBefore(DateTime.now());
          print(
            '[${DateTime.now().toIso8601String()}] Access token expiry: $expiryDate, expired: $isAccessTokenExpired',
          );
        }
      }
    } catch (e) {
      print(
        '[${DateTime.now().toIso8601String()}] Failed to decode access token: $e',
      );
    }

    // Attempt to refresh the access token if it’s expired
    String? validAccessToken = accessToken;
    if (isAccessTokenExpired) {
      final refreshResult = await refreshToken();
      if (refreshResult['success']) {
        validAccessToken = refreshResult['accessToken'];
        print(
          '[${DateTime.now().toIso8601String()}] Using refreshed accessToken: $validAccessToken',
        );
      } else {
        print(
          '[${DateTime.now().toIso8601String()}] Token refresh failed: ${refreshResult['message']} - ${refreshResult['error'] ?? ''}',
        );
        // If refresh fails due to expired accessToken or invalid refreshToken, treat as local logout
        if (refreshResult['isAccessTokenExpired'] == true ||
            refreshResult['message'].contains('No refresh token available') ||
            refreshResult['error']?.toString().contains(
                  'Invalid refresh token',
                ) ==
                true) {
          await clearTokens();
          return {
            'success': true,
            'message':
                'Local logout successful, server logout skipped due to invalid or expired tokens',
          };
        }
      }
    }

    final url = Uri.parse('$baseUrl/auth/logout');
    try {
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $validAccessToken',
        },
        body: jsonEncode({'refresh_token': refreshTokenValue}),
      );
      print(
        '[${DateTime.now().toIso8601String()}] Logout response: ${response.statusCode} ${response.body}',
      );

      // Clear tokens regardless of API response
      await clearTokens();

      final data = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode == 200 && data['success'] == true) {
        return {'success': true, 'message': 'Successfully logged out'};
      } else {
        return {
          'success': false,
          'message':
              'Failed to log out: ${response.statusCode} - ${data['message'] ?? 'Unknown error'} - ${data['error']?.toString() ?? ''}',
        };
      }
    } catch (e) {
      print('[${DateTime.now().toIso8601String()}] Logout error: $e');
      await clearTokens();
      return {
        'success': false,
        'message': 'Error during logout: $e, cleared local storage',
      };
    }
  }
}
