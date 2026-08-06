import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  final String currentPartner;

  const ProfileScreen({Key? key, required this.currentPartner}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1428),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Sanctuary Settings',
          style: TextStyle(fontFamily: 'Playfair Display', color: Color(0xFFF5E6CC), fontWeight: FontWeight.bold),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xD9171D3B),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withOpacity(0.12)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Active Partner: $currentPartner',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFF5E6CC)),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Naitik & Raj • Shared Emotional Space',
                  style: TextStyle(fontSize: 12, color: Color(0xFFA3ADC2)),
                ),
                const Divider(color: Colors.white24, height: 24),
                const ListTile(
                  leading: Icon(Icons.favorite, color: Color(0xFFEE7B7B)),
                  title: Text('Anniversary Date', style: TextStyle(color: Color(0xFFF5E6CC))),
                  subtitle: Text('12 December 2023', style: TextStyle(color: Color(0xFFA3ADC2))),
                ),
                const ListTile(
                  leading: Icon(Icons.music_note, color: Color(0xFFFFB347)),
                  title: Text('Our Song', style: TextStyle(color: Color(0xFFF5E6CC))),
                  subtitle: Text('Yellow - Coldplay', style: TextStyle(color: Color(0xFFA3ADC2))),
                ),
                const ListTile(
                  leading: Icon(Icons.security, color: Color(0xFF8AA982)),
                  title: Text('Biometric Lock', style: TextStyle(color: Color(0xFFF5E6CC))),
                  trailing: Icon(Icons.check_circle, color: Color(0xFF8AA982)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
