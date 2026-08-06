import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Color Tokens
  static const Color bgBaseMorning = Color(0xFFFDF8F2);
  static const Color bgCardMorning = Color(0xFFFFF9F4);
  static const Color bgPaper = Color(0xFFFBF4EB);
  static const Color brandPrimary = Color(0xFFEE7B7B);
  static const Color amberGlow = Color(0xFFFFB347);
  static const Color textPrimary = Color(0xFF3D2C2E);
  static const Color textSubtle = Color(0xFF8C7A7C);

  // Dark Night Theme Tokens
  static const Color nightBg = Color(0xFF0F1428);
  static const Color nightCard = Color(0xD9171D3B);
  static const Color nightText = Color(0xFFF5E6CC);
  static const Color nightSubtle = Color(0xFFA3ADC2);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: bgBaseMorning,
      colorScheme: ColorScheme.fromSeed(
        seedColor: brandPrimary,
        background: bgBaseMorning,
        primary: brandPrimary,
      ),
      textTheme: GoogleFonts.outfitTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(
          fontSize: 28,
          fontWeight: FontWeight.bold,
          color: textPrimary,
        ),
        titleLarge: GoogleFonts.playfairDisplay(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        bodyLarge: GoogleFonts.outfit(
          fontSize: 16,
          color: textPrimary,
        ),
        bodyMedium: GoogleFonts.outfit(
          fontSize: 14,
          color: textSubtle,
        ),
      ),
    );
  }

  static BoxDecoration glassDecoration({bool isNight = false}) {
    return BoxDecoration(
      color: isNight ? nightCard : bgCardMorning.withOpacity(0.85),
      borderRadius: BorderRadius.circular(24),
      border: Border.all(
        color: isNight ? Colors.white.withOpacity(0.12) : Colors.white.withOpacity(0.6),
        width: 1,
      ),
      boxShadow: [
        BoxShadow(
          color: isNight ? Colors.black.withOpacity(0.3) : textPrimary.withOpacity(0.06),
          blurRadius: 20,
          offset: const Offset(0, 8),
        )
      ],
    );
  }

  static BoxDecoration parchmentDecoration = BoxDecoration(
    color: bgPaper,
    borderRadius: BorderRadius.circular(20),
    border: Border.all(color: const Color(0xFFE0D4C5)),
    boxShadow: const [
      BoxShadow(
        color: Color(0x103D2C2E),
        blurRadius: 15,
        offset: Offset(0, 6),
      )
    ],
  );
}
