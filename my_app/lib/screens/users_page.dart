import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants/app_styles.dart';
import '../constants/app_colors.dart';
import '../services/auth_service.dart';

class UsersPage extends StatefulWidget {
  const UsersPage({Key? key}) : super(key: key);

  @override
  State<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends State<UsersPage> {
  List<dynamic> users = [];
  List<dynamic> roles = [];
  bool isLoading = true;
  String? error;
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _fetchUsers();
    _fetchRoles();
  }

  Future<void> _fetchUsers() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final token = await _authService.getAccessToken();
      if (token == null) {
        throw Exception('No access token available');
      }

      final response = await http.get(
        Uri.parse('http://localhost:3000/api/v1/users?pagination[limit]=100'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          users = data['data'] ?? [];
          isLoading = false;
        });
        print('Users fetched: $users');
      } else if (response.statusCode == 401) {
        final refreshResult = await _authService.refreshToken();
        if (!refreshResult['success']) {
          throw Exception(
            'Failed to refresh token: ${refreshResult['message']}',
          );
        }
        final newToken = refreshResult['accessToken'];
        final retryResponse = await http.get(
          Uri.parse('http://localhost:3000/api/v1/users?pagination[limit]=100'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $newToken',
          },
        );

        if (retryResponse.statusCode == 200) {
          final retryData = json.decode(retryResponse.body);
          setState(() {
            users = retryData['data'] ?? [];
            isLoading = false;
          });
          print('Users fetched after retry: $users');
        } else {
          throw Exception('Retry failed: ${retryResponse.statusCode}');
        }
      } else {
        throw Exception(
          'Failed to load users: ${response.statusCode} ${response.body}',
        );
      }
    } catch (e) {
      setState(() {
        error = 'Failed to load users: ${e.toString()}';
        isLoading = false;
      });
      print('Error: $error');
    }
  }

  Future<void> _fetchRoles() async {
    try {
      final token = await _authService.getAccessToken();
      if (token == null) {
        throw Exception('No access token available');
      }

      final response = await http.get(
        Uri.parse('http://localhost:3000/api/v1/roles'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          roles = data['data'] ?? [];
        });
        print('Roles fetched: $roles');
      } else {
        throw Exception(
          'Failed to load roles: ${response.statusCode} ${response.body}',
        );
      }
    } catch (e) {
      setState(() {
        error = 'Failed to load roles: ${e.toString()}';
      });
      print('Error fetching roles: $error');
    }
  }

  Future<void> _refreshUsers() async {
    await _fetchUsers();
  }

  Future<void> _showCreateUserDialog() async {
    final _formKey = GlobalKey<FormState>();
    String? username;
    String? email;
    String? phoneNumber;
    String? name;
    String? address;
    String? password;
    List<String> selectedRoleIds = [];

    await showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Create New User'),
            content: ConstrainedBox(
              constraints: const BoxConstraints(minWidth: 400, maxWidth: 500),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Username *',
                          hintText: 'e.g., johndoe123',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Username is required';
                          }
                          if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
                            return 'Username must be alphanumeric';
                          }
                          return null;
                        },
                        onSaved: (value) => username = value,
                      ),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Email *',
                          hintText: 'e.g., john.doe@example.com',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Email is required';
                          }
                          if (!RegExp(
                            r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                          ).hasMatch(value)) {
                            return 'Enter a valid email';
                          }
                          return null;
                        },
                        onSaved: (value) => email = value,
                      ),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Name *',
                          hintText: 'e.g., John Doe',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Name is required';
                          }
                          return null;
                        },
                        onSaved: (value) => name = value,
                      ),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Password *',
                          hintText: 'Enter a strong password',
                        ),
                        obscureText: true,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password is required';
                          }
                          if (value.length < 8) {
                            return 'Password must be at least 8 characters';
                          }
                          if (!RegExp(
                            r'^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).+$',
                          ).hasMatch(value)) {
                            return 'Password must include an uppercase letter, a number, and a special character';
                          }
                          return null;
                        },
                        onSaved: (value) => password = value,
                      ),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Phone Number *',
                          hintText: 'e.g., 9876543210',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Phone number is required';
                          }
                          if (!RegExp(r'^[6-9][0-9]{9}$').hasMatch(value)) {
                            return 'Enter a valid 10-digit number starting with 6, 7, 8, or 9';
                          }
                          return null;
                        },
                        onSaved: (value) => phoneNumber = value,
                      ),
                      TextFormField(
                        decoration: const InputDecoration(
                          labelText: 'Address *',
                          hintText: 'e.g., 123, Main Street, New York',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Address is required';
                          }
                          return null;
                        },
                        onSaved: (value) => address = value,
                      ),
                      DropdownButtonFormField<String>(
                        decoration: const InputDecoration(
                          labelText: 'Role *',
                          hintText: 'Select a role',
                        ),
                        items:
                            roles.map<DropdownMenuItem<String>>((role) {
                              return DropdownMenuItem<String>(
                                value: role['id'],
                                child: Text(role['name']),
                              );
                            }).toList(),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please select a role';
                          }
                          return null;
                        },
                        onChanged: (value) {
                          if (value != null &&
                              !selectedRoleIds.contains(value)) {
                            setState(() {
                              selectedRoleIds = [value];
                            });
                          }
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    _formKey.currentState!.save();
                    final success = await _createUser(
                      username: username!,
                      email: email!,
                      name: name!,
                      password: password!,
                      phoneNumber: phoneNumber!,
                      address: address!,
                      roleIds: selectedRoleIds,
                    );
                    if (success) {
                      Navigator.pop(context);
                      await _refreshUsers();
                    }
                  }
                },
                child: const Text('Create'),
              ),
            ],
          ),
    );
  }

  Future<bool> _createUser({
    required String username,
    required String email,
    required String name,
    required String password,
    required String phoneNumber,
    required String address,
    required List<String> roleIds,
  }) async {
    try {
      final token = await _authService.getAccessToken();
      if (token == null) {
        throw Exception('No access token available');
      }

      final body = {
        'username': username,
        'email': email,
        'name': name,
        'password': password,
        'phone_number': phoneNumber,
        'address': address,
        'role_ids': roleIds,
      };

      print('Create user request body: ${json.encode(body)}');

      final response = await http.post(
        Uri.parse('http://localhost:3000/api/v1/users'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(body),
      );

      print('Create user response: ${response.statusCode} ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('User created successfully')),
          );
          return true;
        } else {
          throw Exception(
            'API response unsuccessful: ${data['message'] ?? 'Unknown error'}',
          );
        }
      } else if (response.statusCode == 401) {
        final refreshResult = await _authService.refreshToken();
        if (!refreshResult['success']) {
          throw Exception(
            'Failed to refresh token: ${refreshResult['message']}',
          );
        }
        final newToken = refreshResult['accessToken'];
        final retryResponse = await http.post(
          Uri.parse('http://localhost:3000/api/v1/users'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $newToken',
          },
          body: json.encode(body),
        );

        if (retryResponse.statusCode == 200 ||
            retryResponse.statusCode == 201) {
          final retryData = json.decode(retryResponse.body);
          if (retryData['success'] == true) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('User created successfully')),
            );
            return true;
          } else {
            throw Exception(
              'Retry unsuccessful: ${retryData['message'] ?? 'Unknown error'}',
            );
          }
        } else {
          throw Exception(
            'Retry failed: ${retryResponse.statusCode} ${retryResponse.body}',
          );
        }
      } else {
        final data = json.decode(response.body);
        String errorMessage = 'Failed to create user: ${response.statusCode}';
        if (data['error'] != null && data['error']['details'] != null) {
          errorMessage +=
              ' - ${data['error']['details'].map((e) => e['message']).join(', ')}';
        } else if (data['message'] != null && data['message'].isNotEmpty) {
          errorMessage += ' - ${data['message']}';
        } else {
          errorMessage += ' - Unknown error';
        }
        throw Exception(errorMessage);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Failed to create user: ${e.toString().replaceFirst('Exception: ', '')}',
          ),
        ),
      );
      print('Error creating user: $e');
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Users'),
        backgroundColor: AppColors.oliveGreen,
      ),
      body: RefreshIndicator(
        onRefresh: _refreshUsers,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ElevatedButton.icon(
                  onPressed: roles.isEmpty ? null : _showCreateUserDialog,
                  icon: const Icon(Icons.add),
                  label: const Text('Create New User'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.oliveGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      vertical: 12,
                      horizontal: 16,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
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
                          onPressed: _refreshUsers,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                if (isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (users.isEmpty)
                  const Center(
                    child: Text(
                      'No users available. Try creating a new user.',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: users.length,
                    itemBuilder: (context, index) {
                      final user = users[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        child: ListTile(
                          leading: Icon(Icons.person, color: Colors.blue),
                          title: Text(
                            user['name'] ?? 'Unknown',
                            style: AppStyles.regularText.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            'Username: ${user['username'] ?? 'N/A'}\nEmail: ${user['email'] ?? 'N/A'}',
                            style: AppStyles.regularText,
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
