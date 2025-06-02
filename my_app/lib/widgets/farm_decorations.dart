import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class FarmDecorations extends StatelessWidget {
  const FarmDecorations({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Icon(Icons.eco, color: AppColors.primaryGreen, size: 30),
        Icon(Icons.grass, color: AppColors.lightGreen, size: 30),
        Icon(Icons.wb_sunny, color: AppColors.sunYellow, size: 30),
        Icon(Icons.water_drop, color: AppColors.lightBlue, size: 30),
      ],
    );
  }
}
