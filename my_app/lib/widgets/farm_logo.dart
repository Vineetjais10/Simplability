import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_styles.dart';

class FarmLogo extends StatelessWidget {
  const FarmLogo({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 120,
      decoration: AppStyles.logoContainerDecoration,
      child: Icon(Icons.agriculture, size: 60, color: AppColors.saddleBrown),
    );
  }
}
