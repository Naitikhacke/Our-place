import 'package:flutter/material.dart';

class HousePainter extends CustomPainter {
  final int level;
  final bool isNight;

  HousePainter({required this.level, required this.isNight});

  @override
  void paint(Canvas canvas, Size size) {
    final double cx = size.width / 2;
    final double cy = size.height / 2;

    // Rolling Hill
    final hillPaint = Paint()
      ..shader = LinearGradient(
        colors: isNight
            ? [const Color(0xFF1C2B36), const Color(0xFF0F1428)]
            : [const Color(0xFFA8C3A0), const Color(0xFF8AA982)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, cy + 20, size.width, 80));

    canvas.drawOval(
      Rect.fromLTWH(cx - 150, cy + 30, 300, 90),
      hillPaint,
    );

    // House Base Structure
    final housePaint = Paint()
      ..color = isNight ? const Color(0xFF2C201C) : const Color(0xFF7C5C43);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(cx - 50, cy - 20, 100, 70),
        const Radius.circular(4),
      ),
      housePaint,
    );

    // Roof
    final roofPaint = Paint()..color = const Color(0xFF8C4A4A);
    final roofPath = Path()
      ..moveTo(cx - 60, cy - 15)
      ..lineTo(cx, cy - 65)
      ..lineTo(cx + 60, cy - 15)
      ..close();
    canvas.drawPath(roofPath, roofPaint);

    // Door
    final doorPaint = Paint()..color = const Color(0xFF4A3222);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(cx - 12, cy + 15, 24, 35),
        const Radius.circular(10),
      ),
      doorPaint,
    );

    // Glowing Windows
    final windowPaint = Paint()..color = const Color(0xFFFFD56B);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(cx - 40, cy - 5, 20, 20),
        const Radius.circular(4),
      ),
      windowPaint,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(cx + 20, cy - 5, 20, 20),
        const Radius.circular(4),
      ),
      windowPaint,
    );

    // Chimney & Smoke
    final chimneyPaint = Paint()..color = const Color(0xFF5E2E2E);
    canvas.drawRect(Rect.fromLTWH(cx + 25, cy - 55, 14, 25), chimneyPaint);

    if (isNight) {
      final smokePaint = Paint()..color = Colors.white.withOpacity(0.5);
      canvas.drawCircle(Offset(cx + 32, cy - 65), 4, smokePaint);
      canvas.drawCircle(Offset(cx + 36, cy - 75), 6, smokePaint);
    }
  }

  @override
  bool shouldRepaint(covariant HousePainter oldDelegate) {
    return oldDelegate.level != level || oldDelegate.isNight != isNight;
  }
}
