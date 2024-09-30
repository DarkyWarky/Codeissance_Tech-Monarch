import 'package:flutter/material.dart';
import 'package:mobile/screens/home_screen.dart';
import 'package:mobile/theme/app_theme.dart';

void main() {
  runApp(CareMateApp());
}

class CareMateApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CareMate',
      theme: AppTheme.lightTheme,
      home: HomeScreen(),
    );
  }
}