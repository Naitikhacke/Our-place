import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../services/supabase_service.dart';

class NewThoughtModal extends StatefulWidget {
  final String currentPartner;

  const NewThoughtModal({Key? key, required this.currentPartner}) : super(key: key);

  @override
  State<NewThoughtModal> createState() => _NewThoughtModalState();
}

class _NewThoughtModalState extends State<NewThoughtModal> {
  final TextEditingController _textController = TextEditingController();
  String _selectedMood = 'hurt';
  String _selectedNeed = 'Reassurance';
  DateTime? _unlockDateTime;

  @override
  Widget build(BuildContext context) {
    final recipientName = widget.currentPartner == 'Naitik' ? 'Raj' : 'Naitik';

    return Container(
      padding: EdgeInsets.only(
        left: 20, right: 20, top: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFFFDF8F2),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Note for $recipientName 🌸',
                style: const TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF3D2C2E),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _textController,
            maxLines: 4,
            decoration: InputDecoration(
              hintText: 'Write whatever you\'re feeling for $recipientName...',
              filled: true,
              fillColor: const Color(0xFFFBF4EB),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              if (_textController.text.isEmpty) return;
              final note = HeartNote(
                id: DateTime.now().millisecondsSinceEpoch.toString(),
                author: widget.currentPartner,
                recipient: recipientName,
                text: _textController.text,
                mood: _selectedMood,
                need: _selectedNeed,
                timestamp: 'Just now',
                unlockTimestamp: _unlockDateTime,
              );
              SupabaseService.sendHeartNote(note);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEE7B7B),
              minimumSize: const Size.fromHeight(50),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
            ),
            child: Text(
              'Send to $recipientName 🕊️',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
