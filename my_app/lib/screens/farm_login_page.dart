import 'package:flutter/material.dart';
import '../constants/app_styles.dart';
import '../widgets/farm_logo.dart';
import '../widgets/welcome_header.dart';
import '../widgets/login_form.dart';
import '../widgets/farm_decorations.dart';
import '../services/auth_service.dart';

class FarmLoginPage extends StatefulWidget {
  const FarmLoginPage({Key? key}) : super(key: key);

  @override
  State<FarmLoginPage> createState() => _FarmLoginPageState();
}

class _FarmLoginPageState extends State<FarmLoginPage> {
  final AuthService _authService = AuthService();
  bool _isLoading = false;

  Future<void> _handleLogin(String email, String password) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final result = await _authService.login(email.trim(), password.trim());

      setState(() {
        _isLoading = false;
      });

      if (result['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Welcome to the farm!'),
              backgroundColor: Colors.green[700],
              duration: Duration(seconds: 3),
            ),
          );

          // Navigate based on role
          Navigator.pushReplacementNamed(
            context,
            result['isAdmin'] ? '/admin' : '/user',
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Invalid email or password. Please try again.',
                style: AppStyles.regularText.copyWith(color: Colors.white),
              ),
              backgroundColor: const Color.fromARGB(255, 211, 106, 106),
              duration: Duration(seconds: 3),
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        String errorMessage =
            'Failed to connect to the server. Please check your internet connection.';
        if (e.toString().contains('SocketException')) {
          errorMessage = 'No internet connection. Please try again later.';
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              errorMessage,
              style: AppStyles.regularText.copyWith(color: Colors.white),
            ),
            backgroundColor: Colors.red[700],
            duration: Duration(seconds: 3),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: AppStyles.backgroundGradientDecoration,
        child: SafeArea(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              children: [
                SizedBox(height: 40),
                FarmLogo(),
                SizedBox(height: 20),
                WelcomeHeader(),
                SizedBox(height: 40),
                LoginForm(onLogin: _handleLogin, isLoading: _isLoading),
                SizedBox(height: 30),
                Text(
                  'By logging in, you agree to our Terms of Service and Privacy Policy.',
                  style: AppStyles.regularText.copyWith(
                    fontSize: 16,
                    color: Colors.white70,
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 20),
                FarmDecorations(),
                SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
