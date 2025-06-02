class FarmResponse {
  final bool success;
  final String message;
  final List<Farm> data;
  final int total; // Assuming total field exists; adjust if necessary

  FarmResponse({
    required this.success,
    required this.message,
    required this.data,
    required this.total,
  });

  factory FarmResponse.fromJson(Map<String, dynamic> json) {
    return FarmResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data:
          (json['data'] as List<dynamic>?)
              ?.map((item) => Farm.fromJson(item))
              .toList() ??
          [],
      total: json['total'] ?? (json['data'] as List<dynamic>?)?.length ?? 0,
    );
  }
}

class Farm {
  final String id;
  final String name;
  final String imageUrl;
  final String address;
  final String location;
  final String plot;

  Farm({
    required this.id,
    required this.name,
    required this.imageUrl,
    required this.address,
    required this.location,
    required this.plot,
  });

  factory Farm.fromJson(Map<String, dynamic> json) {
    return Farm(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      imageUrl: json['image_url'] ?? '',
      address: json['address'] ?? '',
      location: json['location'] ?? '',
      plot: json['plot'] ?? '',
    );
  }
}
