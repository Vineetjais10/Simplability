// import 'package:flutter/material.dart';
// import '../constants/app_colors.dart';
// import '../constants/app_styles.dart';
// import '../utils/validators.dart';

// class LoginForm extends StatefulWidget {
//   final VoidCallback onLogin;
//   final bool isLoading;

//   const LoginForm({Key? key, required this.onLogin, required this.isLoading})
//     : super(key: key);

//   @override
//   State<LoginForm> createState() => _LoginFormState();
// }

// class _LoginFormState extends State<LoginForm> {
//   final _formKey = GlobalKey<FormState>();
//   final _emailController = TextEditingController();
//   final _passwordController = TextEditingController();
//   bool _obscurePassword = true;

//   @override
//   void dispose() {
//     _emailController.dispose();
//     _passwordController.dispose();
//     super.dispose();
//   }

//   void _handleSubmit() {
//     if (_formKey.currentState!.validate()) {
//       widget.onLogin();
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Container(
//       padding: EdgeInsets.all(24),
//       decoration: AppStyles.formContainerDecoration,
//       child: Form(
//         key: _formKey,
//         child: Column(
//           children: [
//             // Email Field
//             TextFormField(
//               controller: _emailController,
//               keyboardType: TextInputType.emailAddress,
//               decoration: AppStyles.getInputDecoration(
//                 labelText: 'Email',
//                 hintText: 'farmer@example.com',
//                 prefixIcon: Icons.email_outlined,
//               ),
//               validator: Validators.validateEmail,
//             ),

//             SizedBox(height: 20),

//             // Password Field
//             TextFormField(
//               controller: _passwordController,
//               obscureText: _obscurePassword,
//               decoration: AppStyles.getInputDecoration(
//                 labelText: 'Password',
//                 hintText: 'Enter your password',
//                 prefixIcon: Icons.lock_outline,
//                 suffixIcon: IconButton(
//                   icon: Icon(
//                     _obscurePassword ? Icons.visibility_off : Icons.visibility,
//                     color: AppColors.primaryGreen,
//                   ),
//                   onPressed: () {
//                     setState(() {
//                       _obscurePassword = !_obscurePassword;
//                     });
//                   },
//                 ),
//               ),
//               validator: Validators.validatePassword,
//             ),

//             SizedBox(height: 10),

//             // Forgot Password
//             Align(
//               alignment: Alignment.centerRight,
//               child: TextButton(
//                 onPressed: () {
//                   ScaffoldMessenger.of(context).showSnackBar(
//                     SnackBar(
//                       content: Text('Password recovery not implemented yet'),
//                       backgroundColor: Colors.orange[700],
//                     ),
//                   );
//                 },
//                 child: Text('Forgot Password?', style: AppStyles.linkText),
//               ),
//             ),

//             SizedBox(height: 20),

//             // Login Button
//             SizedBox(
//               width: double.infinity,
//               height: 50,
//               child: ElevatedButton(
//                 onPressed: widget.isLoading ? null : _handleSubmit,
//                 style: AppStyles.primaryButtonStyle,
//                 child:
//                     widget.isLoading
//                         ? Row(
//                           mainAxisAlignment: MainAxisAlignment.center,
//                           children: [
//                             SizedBox(
//                               width: 20,
//                               height: 20,
//                               child: CircularProgressIndicator(
//                                 strokeWidth: 2,
//                                 valueColor: AlwaysStoppedAnimation<Color>(
//                                   Colors.white,
//                                 ),
//                               ),
//                             ),
//                             SizedBox(width: 10),
//                             Text('Signing In...'),
//                           ],
//                         )
//                         : Row(
//                           mainAxisAlignment: MainAxisAlignment.center,
//                           children: [
//                             Icon(Icons.login, size: 20),
//                             SizedBox(width: 8),
//                             Text(
//                               'Sign In',
//                               style: TextStyle(
//                                 fontSize: 16,
//                                 fontWeight: FontWeight.bold,
//                               ),
//                             ),
//                           ],
//                         ),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_styles.dart';
import '../utils/validators.dart';

class LoginForm extends StatefulWidget {
  final Function(String, String)
  onLogin; // Updated to accept email and password
  final bool isLoading;

  const LoginForm({Key? key, required this.onLogin, required this.isLoading})
    : super(key: key);

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSubmit() {
    if (_formKey.currentState!.validate()) {
      widget.onLogin(_emailController.text, _passwordController.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(24),
      decoration: AppStyles.formContainerDecoration,
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: AppStyles.getInputDecoration(
                labelText: 'Email',
                hintText: 'farmer@example.com',
                prefixIcon: Icons.email_outlined,
              ),
              validator: Validators.validateEmail,
            ),
            SizedBox(height: 20),
            TextFormField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              decoration: AppStyles.getInputDecoration(
                labelText: 'Password',
                hintText: 'Enter your password',
                prefixIcon: Icons.lock_outline,
                suffixIcon: IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    color: AppColors.primaryGreen,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                ),
              ),
              validator: Validators.validatePassword,
            ),
            SizedBox(height: 10),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Password recovery not implemented yet'),
                      backgroundColor: Colors.orange[700],
                    ),
                  );
                },
                child: Text('Forgot Password?', style: AppStyles.linkText),
              ),
            ),
            SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: widget.isLoading ? null : _handleSubmit,
                style: AppStyles.primaryButtonStyle,
                child:
                    widget.isLoading
                        ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                            ),
                            SizedBox(width: 10),
                            Text('Signing In...'),
                          ],
                        )
                        : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.login, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Log In',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
