class CreateUserRequest {
  final String name;
  final String username;
  final String email;
  final String phoneNumber;
  final String password;
  final String? profileImage; // Reverted to nullable to send null
  final String address;
  final List<String> roleIds;

  CreateUserRequest({
    required this.name,
    required this.username,
    required this.email,
    required this.phoneNumber,
    required this.password,
    this.profileImage, // Nullable, no default value
    required this.address,
    required this.roleIds,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'username': username,
      'email': email,
      'phone_number': phoneNumber,
      'password': password,
      'profile_image': profileImage, // Sends null if profileImage is null
      'address': address,
      'role_ids': roleIds,
    };
  }
}
