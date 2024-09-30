import 'package:flutter/material.dart';

class AppTheme {
  static const primaryColor = Color(0xFF4A90E2);
  static const secondaryColor = Color(0xFFF5A623);
  static const backgroundColor = Color(0xFFF0F4F8);
  static const textColor = Color(0xFF333333);

  static final ThemeData lightTheme = ThemeData(
    colorScheme: ColorScheme.light(
      primary: primaryColor,
      secondary: secondaryColor,
      surface: backgroundColor,
    ),
    scaffoldBackgroundColor: backgroundColor,
    textTheme: TextTheme(
      displayLarge: TextStyle(color: textColor, fontSize: 24, fontWeight: FontWeight.bold),
      bodyLarge: TextStyle(color: textColor, fontSize: 16),
    ).apply(
      bodyColor: textColor,
      displayColor: textColor,
    ),
    appBarTheme: AppBarTheme(
      color: primaryColor,
      foregroundColor: Colors.white,
    ),
  );
}