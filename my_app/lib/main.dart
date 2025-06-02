import 'package:flutter/material.dart';
import 'screens/farm_login_page.dart';
import 'screens/admin_dashboard.dart'; // Create this file
import 'screens/user_dashboard.dart'; // Create this file

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Farm App',
      theme: ThemeData(primarySwatch: Colors.green, fontFamily: 'Roboto'),
      debugShowCheckedModeBanner: false,
      home: FarmLoginPage(),
      routes: {
        '/login': (context) => FarmLoginPage(),
        '/admin': (context) => AdminDashboard(),
        '/user': (context) => UserDashboard(),
      },
    );
  }
}
