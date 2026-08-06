import 'package:flutter/material.dart';
import '../models/app_models.dart';

class LettersScreen extends StatefulWidget {
  final String currentPartner;

  const LettersScreen({Key? key, required this.currentPartner}) : super(key: key);

  @override
  State<LettersScreen> createState() => _LettersScreenState();
}

class _LettersScreenState extends State<LettersScreen> {
  final List<LetterItem> _letters = [
    LetterItem(
      id: '1',
      author: 'Raj',
      recipient: 'Naitik',
      title: 'Open when you miss me',
      body: 'Whenever you feel lonely or miss me, remember that you are the most precious person in my world.',
    ),
    LetterItem(
      id: '2',
      author: 'Naitik',
      recipient: 'Raj',
      title: 'Open after our big day',
      body: 'You worked so hard and I am beyond proud of you!',
      unlockTimestamp: DateTime.now().add(const Duration(hours: 12)),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF8F2),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: const [
            Text('💌 ', style: TextStyle(fontSize: 20)),
            Text(
              'Letters',
              style: TextStyle(fontFamily: 'Playfair Display', color: Color(0xFF3D2C2E), fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _letters.length,
        itemBuilder: (ctx, idx) {
          final letter = _letters[idx];
          final isLocked = letter.unlockTimestamp != null && DateTime.now().isBefore(letter.unlockTimestamp!);

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFFD9D9),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFFAAAA)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Icon(
                    isLocked ? Icons.lock : Icons.favorite,
                    color: const Color(0xFFEE7B7B),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        letter.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Color(0xFF3D2C2E)),
                      ),
                      Text(
                        isLocked
                            ? 'Sealed by ${letter.author} • Unlocks ${letter.unlockTimestamp}'
                            : 'From ${letter.author} for ${letter.recipient}',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF8C7A7C)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
