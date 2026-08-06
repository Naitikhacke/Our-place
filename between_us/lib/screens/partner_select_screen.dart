import 'package:flutter/material.dart';

class PartnerSelectScreen extends StatelessWidget {
  final String currentPartner;
  final Function(String) onSelectPartner;

  const PartnerSelectScreen({
    Key? key,
    required this.currentPartner,
    required this.onSelectPartner,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0F1428),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              color: Color(0x33EE7B7B),
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Icon(Icons.favorite, color: Color(0xFFEE7B7B), size: 28),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Between Us',
            style: TextStyle(
              fontFamily: 'Playfair Display',
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Color(0xFFF5E6CC),
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Our private sanctuary for Naitik & Raj 💕',
            style: TextStyle(fontSize: 13, color: Color(0xFFA3ADC2)),
          ),
          const SizedBox(height: 36),
          const Text(
            'Who is entering our sanctuary tonight?',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFFF5E6CC)),
          ),
          const SizedBox(height: 20),
          _buildPartnerCard(
            context,
            name: 'Naitik',
            emoji: '🐰',
            bgColor: const Color(0xFFFFD9C0),
            tagline: 'Always here to listen & care',
            isSelected: currentPartner == 'Naitik',
          ),
          const SizedBox(height: 14),
          _buildPartnerCard(
            context,
            name: 'Raj',
            emoji: '🐱',
            bgColor: const Color(0xFFC6E2FF),
            tagline: 'Bringing warmth & laughter',
            isSelected: currentPartner == 'Raj',
          ),
        ],
      ),
    );
  }

  Widget _buildPartnerCard(
    BuildContext context, {
    required String name,
    required String emoji,
    required Color bgColor,
    required String tagline,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () => onSelectPartner(name),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xD9171D3B),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? const Color(0xFFEE7B7B) : Colors.white.withOpacity(0.15),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: bgColor,
              child: Text(emoji, style: const TextStyle(fontSize: 24)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Color(0xFFF5E6CC)),
                  ),
                  Text(
                    tagline,
                    style: const TextStyle(fontSize: 11, color: Color(0xFFA3ADC2)),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const CircleAvatar(
                radius: 12,
                backgroundColor: Color(0xFFEE7B7B),
                child: Icon(Icons.check, size: 14, color: Colors.white),
              ),
          ],
        ),
      ),
    );
  }
}
