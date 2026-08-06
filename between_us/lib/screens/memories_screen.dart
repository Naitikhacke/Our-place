import 'package:flutter/material.dart';
import '../models/app_models.dart';

class MemoriesScreen extends StatefulWidget {
  const MemoriesScreen({super.key, required this.currentPartner});

  final String currentPartner;

  @override
  State<MemoriesScreen> createState() => _MemoriesScreenState();
}

class _MemoriesScreenState extends State<MemoriesScreen> {
  final List<MemoryItem> _memories = [
    MemoryItem(
      id: '1',
      author: 'Raj',
      title: 'Sunset Beach Walk',
      category: 'Photos',
      date: 'Aug 14, 2025 at 7:30 PM',
      emoji: '🌅',
      desc: 'Walking along the shore as the sky turned warm pink and orange.',
      hasVoice: true,
    ),
    MemoryItem(
      id: '2',
      author: 'Naitik',
      title: 'Stargazing Night',
      category: 'Dates',
      date: 'Oct 02, 2025',
      emoji: '✨',
      desc: 'Counted shooting stars from the hood of the car.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1428),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.star, color: Color(0xFFFFB347), size: 22),
            SizedBox(width: 8),
            Text(
              'Memories',
              style: TextStyle(fontFamily: 'Playfair Display', color: Color(0xFFF5E6CC), fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 14,
          mainAxisSpacing: 14,
          childAspectRatio: 0.9,
        ),
        itemCount: _memories.length,
        itemBuilder: (ctx, idx) {
          final mem = _memories[idx];
          return Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [BoxShadow(color: Colors.black45, blurRadius: 10)],
            ),
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFB347),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(mem.emoji, style: const TextStyle(fontSize: 36)),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  mem.title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF3D2C2E)),
                ),
                Text(
                  'Added by ${mem.author}',
                  style: const TextStyle(fontSize: 10, color: Color(0xFFEE7B7B), fontWeight: FontWeight.bold),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
