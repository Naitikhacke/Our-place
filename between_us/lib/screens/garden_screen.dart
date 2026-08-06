import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../services/supabase_service.dart';

class GardenScreen extends StatefulWidget {
  final String currentPartner;

  const GardenScreen({Key? key, required this.currentPartner}) : super(key: key);

  @override
  State<GardenScreen> createState() => _GardenScreenState();
}

class _GardenScreenState extends State<GardenScreen> {
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _textController = TextEditingController();
  String _type = 'flower';
  String _emoji = '🌸';
  bool _isClassifying = false;

  void _classifyWithAI(String title, String text) async {
    if (title.length < 3) return;
    setState(() => _isClassifying = true);
    final result = await SupabaseService.classifyWithGemini(title, text);
    setState(() {
      _type = result['category'] == 'Trips' ? 'tree' : 'flower';
      _emoji = result['emoji'] ?? '🌸';
      _isClassifying = false;
    });
  }

  void _showPlantDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFFFDF8F2),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Planting as ${widget.currentPartner} 🌸',
              style: const TextStyle(
                fontFamily: 'Playfair Display',
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Color(0xFF3D2C2E),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _titleController,
              onChanged: (val) => _classifyWithAI(val, _textController.text),
              decoration: InputDecoration(
                hintText: 'Title (e.g. Conversation resolved...)',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _textController,
              maxLines: 3,
              onChanged: (val) => _classifyWithAI(_titleController.text, val),
              decoration: InputDecoration(
                hintText: 'What made this special?',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF9F4),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE0D4C5)),
              ),
              child: Row(
                children: [
                  Text(_emoji, style: const TextStyle(fontSize: 28)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _isClassifying ? 'AI Analyzing...' : 'AI Category: $_type',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF3D2C2E)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                if (_titleController.text.isEmpty) return;
                final item = GardenItem(
                  id: DateTime.now().millisecondsSinceEpoch.toString(),
                  author: widget.currentPartner,
                  type: _type,
                  category: _type == 'tree' ? 'Memories' : 'Resolved',
                  emoji: _emoji,
                  title: _titleController.text,
                  text: _textController.text,
                  date: 'Just now',
                );
                SupabaseService.addGardenItem(item);
                Navigator.pop(ctx);
                _titleController.clear();
                _textController.clear();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEE7B7B),
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              ),
              child: Text(
                'Plant in Our Garden as ${widget.currentPartner} 🌱',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF8F2),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: const [
            Text('🌸 ', style: TextStyle(fontSize: 20)),
            Text(
              'Our Garden',
              style: TextStyle(fontFamily: 'Playfair Display', color: Color(0xFF3D2C2E), fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: Color(0xFFEE7B7B), size: 28),
            onPressed: _showPlantDialog,
          )
        ],
      ),
      body: StreamBuilder<List<GardenItem>>(
        stream: SupabaseService.gardenStream,
        builder: (context, snapshot) {
          final items = snapshot.data ?? [];
          return Column(
            children: [
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 1.1,
                  ),
                  itemCount: items.length,
                  itemBuilder: (ctx, idx) {
                    final item = items[idx];
                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF9F4),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE0D4C5)),
                        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 8)],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(item.emoji, style: const TextStyle(fontSize: 32)),
                          const SizedBox(height: 6),
                          Text(
                            item.title,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF3D2C2E)),
                            textAlign: TextAlign.center,
                          ),
                          Text(
                            'Planted by ${item.author}',
                            style: const TextStyle(fontSize: 10, color: Color(0xFFEE7B7B), fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
