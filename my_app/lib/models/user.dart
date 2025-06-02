// 1. User Model (models/user.dart)
class User {
  final String? id;
  final String name;
  final String username;
  final String email;
  final String phoneNumber;
  final String? profileImage;
  final String address;
  final List<String> roleIds;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  User({
    this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.phoneNumber,
    this.profileImage,
    required this.address,
    required this.roleIds,
    this.createdAt,
    this.updatedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'username': username,
      'email': email,
      'phone_number': phoneNumber,
      'profile_image': profileImage,
      'address': address,
      'role_ids': roleIds,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'] ?? '',
      username: json['username'] ?? '',
      email: json['email'] ?? '',
      phoneNumber: json['phone_number'] ?? '',
      profileImage: json['profile_image'],
      address: json['address'] ?? '',
      roleIds: List<String>.from(json['role_ids'] ?? []),
      createdAt:
          json['created_at'] != null
              ? DateTime.parse(json['created_at'])
              : null,
      updatedAt:
          json['updated_at'] != null
              ? DateTime.parse(json['updated_at'])
              : null,
    );
  }
}
