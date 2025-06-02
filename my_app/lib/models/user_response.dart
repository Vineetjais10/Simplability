class UserResponse {
  final bool success;
  final String message;
  final List<User> data;
  final int total;
  final int currentPage;
  final int totalPages;

  UserResponse({
    required this.success,
    required this.message,
    required this.data,
    required this.total,
    required this.currentPage,
    required this.totalPages,
  });

  factory UserResponse.fromJson(Map<String, dynamic> json) {
    return UserResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data:
          (json['data'] as List<dynamic>?)
              ?.map((item) => User.fromJson(item))
              .toList() ??
          [],
      total: json['total'] ?? 0,
      currentPage: json['current_page'] ?? 1,
      totalPages: json['total_pages'] ?? 1,
    );
  }
}

class User {
  final String id;
  final String name;
  final String username;
  final String? email;
  final String? phoneNumber;
  final String? profileImage;
  final String createdAt;
  final String updatedAt;
  final List<Role> roles;

  User({
    required this.id,
    required this.name,
    required this.username,
    this.email,
    this.phoneNumber,
    this.profileImage,
    required this.createdAt,
    required this.updatedAt,
    required this.roles,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      username: json['username'] ?? '',
      email: json['email'],
      phoneNumber: json['phone_number'],
      profileImage: json['profile_image'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      roles:
          (json['Roles'] as List<dynamic>?)
              ?.map((item) => Role.fromJson(item))
              .toList() ??
          [],
    );
  }
}

class Role {
  final String name;

  Role({required this.name});

  factory Role.fromJson(Map<String, dynamic> json) {
    return Role(name: json['name'] ?? '');
  }
}
