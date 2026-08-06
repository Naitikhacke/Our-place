import 'package:flutter/material.dart';
import '../models/app_models.dart';

class EveningRitualModal extends StatelessWidget {
  final String currentPartner;
  final List<HeartNote> notes;
  final VoidCallback onResolveNotes;

  const EveningRitualModal({
    Key? key,
    required this.currentPartner,
    required this.notes,
    required this.onResolveNotes,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final otherPartner = currentPartner == 'Naitik' ? 'Raj' : 'Naitik';

    return Container(
      color: const Color(0xFF0F1428),
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.local_fire_department, size: 64, color: Color(0xFFFFB347)),
          const SizedBox(height: 16),
          Text(
            'Evening Ritual with $otherPartner 🔥',
            style: const TextStyle(
              fontFamily: 'Playfair Display',
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Color(0xFFF5E6CC),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Reflect on your shared notes & plant resolved thoughts in your garden.',
            style: const TextStyle(fontSize: 13, color: Color(0xFFA3ADC2)),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 30),
          ElevatedButton(
            onPressed: () {
              onResolveNotes();
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEE7B7B),
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            ),
            child: const Text('We Talked 💕 • Grow Our Sanctuary', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
