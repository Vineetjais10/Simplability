import 'package:flutter/material.dart';
import '../constants/app_styles.dart';

class WelcomeHeader extends StatelessWidget {
  const WelcomeHeader({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Welcome Back!', style: AppStyles.welcomeTitle),
        Text('Log in to your farm account', style: AppStyles.subtitle),
      ],
    );
  }
}
