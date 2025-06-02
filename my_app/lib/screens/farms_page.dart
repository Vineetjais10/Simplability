// import 'package:flutter/material.dart';
// import 'package:http/http.dart' as http;
// import 'dart:convert';
// import 'package:file_picker/file_picker.dart';
// import '../constants/app_styles.dart';
// import '../constants/app_colors.dart';
// import '../services/auth_service.dart';

// class FarmsPage extends StatefulWidget {
//   const FarmsPage({Key? key}) : super(key: key);

//   @override
//   State<FarmsPage> createState() => _FarmsPageState();
// }

// class _FarmsPageState extends State<FarmsPage> {
//   List<dynamic> farms = [];
//   bool isLoading = true;
//   String? error;
//   final AuthService _authService = AuthService();

//   @override
//   void initState() {
//     super.initState();
//     _fetchFarms();
//   }

//   Future<void> _fetchFarms() async {
//     try {
//       setState(() {
//         isLoading = true;
//         error = null;
//       });

//       final token = await _authService.getAccessToken();
//       if (token == null) {
//         throw Exception('No access token available');
//       }

//       final response = await http.get(
//         Uri.parse('http://localhost:3000/api/v1/farms?pagination[limit]=100'),
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'Bearer $token',
//         },
//       );

//       if (response.statusCode == 200) {
//         final data = json.decode(response.body);
//         setState(() {
//           farms = data['data'] ?? [];
//           isLoading = false;
//         });
//         print('Farms fetched: $farms');
//       } else if (response.statusCode == 401) {
//         final refreshResult = await _authService.refreshToken();
//         if (!refreshResult['success']) {
//           throw Exception(
//             'Failed to refresh token: ${refreshResult['message']}',
//           );
//         }
//         final newToken = refreshResult['accessToken'];
//         final retryResponse = await http.get(
//           Uri.parse('http://localhost:3000/api/v1/farms?pagination[limit]=100'),
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer $newToken',
//           },
//         );

//         if (retryResponse.statusCode == 200) {
//           final retryData = json.decode(retryResponse.body);
//           setState(() {
//             farms = retryData['data'] ?? [];
//             isLoading = false;
//           });
//           print('Farms fetched after retry: $farms');
//         } else {
//           throw Exception('Retry failed: ${retryResponse.statusCode}');
//         }
//       } else {
//         throw Exception('Failed to load farms: ${response.statusCode}');
//       }
//     } catch (e) {
//       setState(() {
//         error = 'Failed to load farms: ${e.toString()}';
//         isLoading = false;
//       });
//       print('Error: $error');
//     }
//   }

//   Future<void> _refreshFarms() async {
//     await _fetchFarms();
//   }

//   Future<void> _showCreateFarmDialog() async {
//     final _formKey = GlobalKey<FormState>();
//     String? name;
//     String? address;
//     String? location;
//     String? plot;
//     PlatformFile? imageFile;

//     await showDialog(
//       context: context,
//       builder:
//           (context) => AlertDialog(
//             title: const Text('Create New Farm'),
//             content: SingleChildScrollView(
//               child: Form(
//                 key: _formKey,
//                 child: Column(
//                   mainAxisSize: MainAxisSize.min,
//                   children: [
//                     TextFormField(
//                       decoration: const InputDecoration(
//                         labelText: 'Farm Name *',
//                         hintText: 'Enter farm name',
//                       ),
//                       validator: (value) {
//                         if (value == null || value.isEmpty) {
//                           return 'Farm name is required';
//                         }
//                         return null;
//                       },
//                       onSaved: (value) => name = value,
//                     ),
//                     TextFormField(
//                       decoration: const InputDecoration(
//                         labelText: 'Address',
//                         hintText: 'Enter farm address',
//                       ),
//                       onSaved: (value) => address = value,
//                     ),
//                     TextFormField(
//                       decoration: const InputDecoration(
//                         labelText: 'Location',
//                         hintText: 'Enter farm location',
//                       ),
//                       onSaved: (value) => location = value,
//                     ),
//                     TextFormField(
//                       decoration: const InputDecoration(
//                         labelText: 'Plot',
//                         hintText: 'Enter plot details',
//                       ),
//                       onSaved: (value) => plot = value,
//                     ),
//                     const SizedBox(height: 16),
//                     ElevatedButton(
//                       onPressed: () async {
//                         final result = await FilePicker.platform.pickFiles(
//                           type: FileType.image,
//                           allowMultiple: false,
//                         );
//                         if (result != null && result.files.isNotEmpty) {
//                           setState(() {
//                             imageFile = result.files.first;
//                           });
//                         }
//                       },
//                       child: Text(
//                         imageFile == null ? 'Select Image' : 'Image Selected',
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//             actions: [
//               TextButton(
//                 onPressed: () => Navigator.pop(context),
//                 child: const Text('Cancel'),
//               ),
//               ElevatedButton(
//                 onPressed: () async {
//                   if (_formKey.currentState!.validate()) {
//                     _formKey.currentState!.save();
//                     final success = await _createFarm(
//                       name: name!,
//                       address: address,
//                       location: location,
//                       plot: plot,
//                       imageFile: imageFile,
//                     );
//                     if (success) {
//                       Navigator.pop(context);
//                       await _refreshFarms();
//                     }
//                   }
//                 },
//                 child: const Text('Create'),
//               ),
//             ],
//           ),
//     );
//   }

//   Future<bool> _createFarm({
//     required String name,
//     String? address,
//     String? location,
//     String? plot,
//     PlatformFile? imageFile,
//   }) async {
//     try {
//       final token = await _authService.getAccessToken();
//       if (token == null) {
//         throw Exception('No access token available');
//       }

//       var request = http.MultipartRequest(
//         'POST',
//         Uri.parse('http://localhost:3000/api/v1/farms'),
//       );
//       request.headers['Authorization'] = 'Bearer $token';
//       request.fields['name'] = name;
//       if (address != null && address.isNotEmpty)
//         request.fields['address'] = address;
//       if (location != null && location.isNotEmpty)
//         request.fields['location'] = location;
//       if (plot != null && plot.isNotEmpty) request.fields['plot'] = plot;
//       if (imageFile != null && imageFile.bytes != null) {
//         request.files.add(
//           http.MultipartFile.fromBytes(
//             'image',
//             imageFile.bytes!,
//             filename: imageFile.name,
//           ),
//         );
//       }

//       final response = await request.send();
//       final responseBody = await http.Response.fromStream(response);
//       print(
//         'Create farm response: ${responseBody.statusCode} ${responseBody.body}',
//       );

//       if (responseBody.statusCode == 201) {
//         final data = json.decode(responseBody.body);
//         if (data['success'] == true) {
//           ScaffoldMessenger.of(context).showSnackBar(
//             const SnackBar(content: Text('Farm created successfully')),
//           );
//           return true;
//         } else {
//           throw Exception('API response unsuccessful: ${data['message']}');
//         }
//       } else {
//         throw Exception(
//           'Failed to create farm: ${responseBody.statusCode} ${responseBody.body}',
//         );
//       }
//     } catch (e) {
//       ScaffoldMessenger.of(
//         context,
//       ).showSnackBar(SnackBar(content: Text('Failed to create farm: $e')));
//       print('Error creating farm: $e');
//       return false;
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Farms'),
//         backgroundColor: AppColors.oliveGreen,
//       ),
//       body: RefreshIndicator(
//         onRefresh: _refreshFarms,
//         child: SingleChildScrollView(
//           physics: const AlwaysScrollableScrollPhysics(),
//           child: Padding(
//             padding: const EdgeInsets.all(16.0),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 ElevatedButton.icon(
//                   onPressed: _showCreateFarmDialog,
//                   icon: const Icon(Icons.add),
//                   label: const Text('Create New Farm'),
//                   style: ElevatedButton.styleFrom(
//                     backgroundColor: AppColors.oliveGreen,
//                     foregroundColor: Colors.white,
//                     padding: const EdgeInsets.symmetric(
//                       vertical: 12,
//                       horizontal: 16,
//                     ),
//                   ),
//                 ),
//                 const SizedBox(height: 16),
//                 if (error != null)
//                   Container(
//                     width: double.infinity,
//                     padding: const EdgeInsets.all(16),
//                     margin: const EdgeInsets.only(bottom: 20),
//                     decoration: BoxDecoration(
//                       color: Colors.red.withOpacity(0.1),
//                       borderRadius: BorderRadius.circular(8),
//                       border: Border.all(color: Colors.red.withOpacity(0.3)),
//                     ),
//                     child: Row(
//                       children: [
//                         Icon(Icons.error_outline, color: Colors.red[700]),
//                         const SizedBox(width: 12),
//                         Expanded(
//                           child: Text(
//                             error!,
//                             style: TextStyle(color: Colors.red[700]),
//                           ),
//                         ),
//                         TextButton(
//                           onPressed: _refreshFarms,
//                           child: const Text('Retry'),
//                         ),
//                       ],
//                     ),
//                   ),
//                 if (isLoading)
//                   const Center(child: CircularProgressIndicator())
//                 else if (farms.isEmpty)
//                   const Center(
//                     child: Text(
//                       'No farms available. Try creating a new farm.',
//                       style: TextStyle(fontSize: 16, color: Colors.grey),
//                     ),
//                   )
//                 else
//                   ListView.builder(
//                     shrinkWrap: true,
//                     physics: const NeverScrollableScrollPhysics(),
//                     itemCount: farms.length,
//                     itemBuilder: (context, index) {
//                       final farm = farms[index];
//                       return Card(
//                         margin: const EdgeInsets.symmetric(vertical: 8),
//                         child: ListTile(
//                           leading: Icon(
//                             Icons.agriculture,
//                             color: AppColors.oliveGreen,
//                           ),
//                           title: Text(
//                             farm['name'] ?? 'Unknown',
//                             style: AppStyles.regularText.copyWith(
//                               fontWeight: FontWeight.w600,
//                             ),
//                           ),
//                           subtitle: Text(
//                             'Address: ${farm['address'] ?? 'N/A'}\nLocation: ${farm['location'] ?? 'N/A'}',
//                             style: AppStyles.regularText,
//                           ),
//                         ),
//                       );
//                     },
//                   ),
//               ],
//             ),
//           ),
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import '../constants/app_styles.dart';
import '../constants/app_colors.dart';
import '../services/auth_service.dart';

class FarmsPage extends StatefulWidget {
  const FarmsPage({Key? key}) : super(key: key);

  @override
  State<FarmsPage> createState() => _FarmsPageState();
}

class _FarmsPageState extends State<FarmsPage> {
  List<dynamic> farms = [];
  bool isLoading = true;
  String? error;
  final AuthService _authService = AuthService();

  @override
  void initState() {
    super.initState();
    _fetchFarms();
  }

  Future<void> _fetchFarms() async {
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
        Uri.parse('http://localhost:3000/api/v1/farms?pagination[limit]=100'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          farms = data['data'] ?? [];
          isLoading = false;
        });
        print('Farms fetched: $farms');
      } else if (response.statusCode == 401) {
        final refreshResult = await _authService.refreshToken();
        if (!refreshResult['success']) {
          throw Exception(
            'Failed to refresh token: ${refreshResult['message']}',
          );
        }
        final newToken = refreshResult['accessToken'];
        final retryResponse = await http.get(
          Uri.parse('http://localhost:3000/api/v1/farms?pagination[limit]=100'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $newToken',
          },
        );

        if (retryResponse.statusCode == 200) {
          final retryData = json.decode(retryResponse.body);
          setState(() {
            farms = retryData['data'] ?? [];
            isLoading = false;
          });
          print('Farms fetched after retry: $farms');
        } else {
          throw Exception('Retry failed: ${retryResponse.statusCode}');
        }
      } else {
        throw Exception('Failed to load farms: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        error = 'Failed to load farms: ${e.toString()}';
        isLoading = false;
      });
      print('Error: $error');
    }
  }

  Future<void> _refreshFarms() async {
    await _fetchFarms();
  }

  Future<void> _showCreateFarmDialog() async {
    final _formKey = GlobalKey<FormState>();
    String? name;
    String? address;
    String? location;
    String? plot;
    PlatformFile? imageFile;

    await showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text('Create New Farm'),
            content: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Farm Name *',
                        hintText: 'Enter farm name',
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Farm name is required';
                        }
                        return null;
                      },
                      onSaved: (value) => name = value,
                    ),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Address',
                        hintText: 'Enter farm address',
                      ),
                      onSaved: (value) => address = value,
                    ),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Location',
                        hintText: 'Enter farm location',
                      ),
                      onSaved: (value) => location = value,
                    ),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Plot',
                        hintText: 'Enter plot details',
                      ),
                      onSaved: (value) => plot = value,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () async {
                        final result = await FilePicker.platform.pickFiles(
                          type: FileType.image,
                          allowMultiple: false,
                        );
                        if (result != null && result.files.isNotEmpty) {
                          setState(() {
                            imageFile = result.files.first;
                          });
                        }
                      },
                      child: Text(
                        imageFile == null ? 'Select Image' : 'Image Selected',
                      ),
                    ),
                  ],
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
                    final success = await _createFarm(
                      name: name!,
                      address: address,
                      location: location,
                      plot: plot,
                      imageFile: imageFile,
                    );
                    if (success) {
                      Navigator.pop(context); // Close the dialog on success
                      await _refreshFarms(); // Refresh the farm list
                    }
                  }
                },
                child: const Text('Create'),
              ),
            ],
          ),
    );
  }

  Future<bool> _createFarm({
    required String name,
    String? address,
    String? location,
    String? plot,
    PlatformFile? imageFile,
  }) async {
    try {
      final token = await _authService.getAccessToken();
      if (token == null) {
        throw Exception('No access token available');
      }

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('http://localhost:3000/api/v1/farms'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.fields['name'] = name;
      if (address != null && address.isNotEmpty)
        request.fields['address'] = address;
      if (location != null && location.isNotEmpty)
        request.fields['location'] = location;
      if (plot != null && plot.isNotEmpty) request.fields['plot'] = plot;
      if (imageFile != null && imageFile.bytes != null) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'image',
            imageFile.bytes!,
            filename: imageFile.name,
          ),
        );
      }

      final response = await request.send();
      final responseBody = await http.Response.fromStream(response);
      print(
        'Create farm response: ${responseBody.statusCode} ${responseBody.body}',
      );

      if (responseBody.statusCode == 200 || responseBody.statusCode == 201) {
        final data = json.decode(responseBody.body);
        if (data['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Farm created successfully')),
          );
          return true;
        } else {
          throw Exception(
            'API response unsuccessful: ${data['message'] ?? 'Unknown error'}',
          );
        }
      } else {
        throw Exception(
          'Failed to create farm: ${responseBody.statusCode} ${responseBody.body}',
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to create farm: $e')));
      print('Error creating farm: $e');
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Farms'),
        backgroundColor: AppColors.oliveGreen,
      ),
      body: RefreshIndicator(
        onRefresh: _refreshFarms,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ElevatedButton.icon(
                  onPressed: _showCreateFarmDialog,
                  icon: const Icon(Icons.add),
                  label: const Text('Create New Farm'),
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
                          onPressed: _refreshFarms,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                if (isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (farms.isEmpty)
                  const Center(
                    child: Text(
                      'No farms available. Try creating a new farm.',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: farms.length,
                    itemBuilder: (context, index) {
                      final farm = farms[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        child: ListTile(
                          leading: Icon(
                            Icons.agriculture,
                            color: AppColors.oliveGreen,
                          ),
                          title: Text(
                            farm['name'] ?? 'Unknown',
                            style: AppStyles.regularText.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          subtitle: Text(
                            'Address: ${farm['address'] ?? 'N/A'}\nLocation: ${farm['location'] ?? 'N/A'}',
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
