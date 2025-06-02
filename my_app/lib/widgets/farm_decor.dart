import 'package:flutter/material.dart';

class FarmDecorations extends StatelessWidget {
  final bool isSubtle;

  const FarmDecorations({Key? key, this.isSubtle = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: isSubtle ? 50 : 100,
      color: Colors.green[100],
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Icon(Icons.grass, color: Colors.green[700], size: isSubtle ? 24 : 32),
          Icon(
            Icons.agriculture, // Tractor icon
            color: Colors.green[700],
            size: isSubtle ? 24 : 32,
          ),
          Icon(Icons.eco, color: Colors.green[700], size: isSubtle ? 24 : 32),
        ],
      ),
    );
  }
}
