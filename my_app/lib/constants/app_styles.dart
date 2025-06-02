import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppStyles {
  // Text styles
  static const TextStyle welcomeTitle = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.darkGreen,
    shadows: [
      Shadow(color: Colors.white70, offset: Offset(1, 1), blurRadius: 2),
    ],
  );

  static const TextStyle subtitle = TextStyle(
    fontSize: 16,
    color: AppColors.oliveGreen,
    fontWeight: FontWeight.w500,
  );

  static const TextStyle linkText = TextStyle(
    color: AppColors.primaryGreen,
    fontWeight: FontWeight.w600,
  );

  static const TextStyle signUpText = TextStyle(
    color: AppColors.darkGreen,
    fontSize: 16,
    fontWeight: FontWeight.bold,
  );

  static const TextStyle regularText = TextStyle(
    color: AppColors.oliveGreen,
    fontSize: 16,
  );

  // Input decoration
  static InputDecoration getInputDecoration({
    required String labelText,
    required String hintText,
    required IconData prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      labelText: labelText,
      hintText: hintText,
      prefixIcon: Icon(prefixIcon, color: AppColors.primaryGreen),
      suffixIcon: suffixIcon,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.lightGreen),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: AppColors.primaryGreen, width: 2),
      ),
      filled: true,
      fillColor: AppColors.paleGreen,
    );
  }

  // Button style
  static ButtonStyle get primaryButtonStyle {
    return ElevatedButton.styleFrom(
      backgroundColor: AppColors.primaryGreen,
      foregroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 3,
    );
  }

  // Container decorations
  static BoxDecoration get logoContainerDecoration {
    return BoxDecoration(
      color: Colors.white,
      shape: BoxShape.circle,
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.1),
          blurRadius: 10,
          offset: Offset(0, 5),
        ),
      ],
    );
  }

  static BoxDecoration get formContainerDecoration {
    return BoxDecoration(
      color: Colors.white.withOpacity(0.9),
      borderRadius: BorderRadius.circular(20),
      border: Border.all(
        color: AppColors.lightGreen.withOpacity(0.3),
        width: 2,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.1),
          blurRadius: 15,
          offset: Offset(0, 8),
        ),
      ],
    );
  }

  static BoxDecoration get backgroundGradientDecoration {
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: AppColors.backgroundGradient,
      ),
    );
  }
}
