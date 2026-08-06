import 'package:flutter/material.dart';
import '../widgets/house_painter.dart';

class HomeScreen extends StatefulWidget {
  final String currentPartner;
  final int houseLevel;
  final int unreadCount;
  final VoidCallback onOpenRitual;
  final VoidCallback onOpenPartnerSelect;

  const HomeScreen({
    Key? key,
    required this.currentPartner,
    required this.houseLevel,
    required this.unreadCount,
    required this.onOpenRitual,
    required this.onOpenPartnerSelect,
  }) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _quoteIndex = 0;
  final List<String> _skyQuotes = [
    "Every little thing we share, builds us.",
    "In your arms, I found my quiet home.",
    "Distance means so little when someone means so much.",
    "You are my favorite notification.",
    "Naitik & Raj • Made just for us two."
  ];

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 17) return 'Good afternoon 🌅';
    return 'Good evening 🌙';
  }

  @override
  Widget build(BuildContext context) {
    final otherPartner = widget.currentPartner == 'Naitik' ? 'Raj' : 'Naitik';
    final partnerEmoji = widget.currentPartner == 'Naitik' ? '🐰' : '🐱';

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1A2244), Color(0xFF0F1428)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Our Place',
                        style: TextStyle(
                          fontFamily: 'Playfair Display',
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFFF5E6CC),
                        ),
                      ),
                      Text(
                        'Naitik & Raj • Shared Space',
                        style: TextStyle(fontSize: 11, color: Color(0xFFA3ADC2)),
                      ),
                    ],
                  ),
                  GestureDetector(
                    onTap: widget.onOpenPartnerSelect,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.15)),
                      ),
                      child: Row(
                        children: [
                          Text(partnerEmoji, style: const TextStyle(fontSize: 14)),
                          const SizedBox(width: 6),
                          Text(
                            widget.currentPartner,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFF5E6CC)),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.refresh, size: 12, color: Color(0xFFA3ADC2)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Sky Quote
            GestureDetector(
              onTap: () => setState(() => _quoteIndex = (_quoteIndex + 1) % _skyQuotes.length),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                child: Text(
                  '“${_skyQuotes[_quoteIndex]}”',
                  style: const TextStyle(
                    fontFamily: 'Playfair Display',
                    fontStyle: FontStyle.italic,
                    fontSize: 15,
                    color: Color(0xFFE6D3B4),
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),

            // House CustomPainter Canvas
            Expanded(
              child: Center(
                child: SizedBox(
                  width: 300,
                  height: 220,
                  child: CustomPaint(
                    painter: HousePainter(level: widget.houseLevel, isNight: true),
                  ),
                ),
              ),
            ),

            // House Level Caption
            Text(
              "Naitik & Raj's House • Level ${widget.houseLevel} Sanctuary",
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFFA3ADC2),
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 16),

            // Bottom Action Card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xD9171D3B),
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(color: Colors.white.withOpacity(0.12)),
                  boxShadow: const [
                    BoxShadow(color: Colors.black45, blurRadius: 20, offset: Offset(0, 8))
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${_getGreeting()}, ${widget.currentPartner}',
                              style: const TextStyle(
                                fontFamily: 'Playfair Display',
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFF5E6CC),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'It\'s time for your daily ritual with $otherPartner.',
                              style: const TextStyle(fontSize: 12, color: Color(0xFFA3ADC2)),
                            ),
                          ],
                        ),
                        if (widget.unreadCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEE7B7B),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '${widget.unreadCount} new',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton(
                      onPressed: widget.onOpenRitual,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEE7B7B),
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                        elevation: 4,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Let\'s talk with $otherPartner',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.favorite, size: 16, color: Colors.white),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
