import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/app_models.dart';
import 'package:http/http.dart' as http;

class SupabaseService {
  static const String supabaseUrl = 'https://pundnwezscwdmzwevzhh.supabase.co';
  static const String supabaseAnonKey = 'sb_publishable_Dw8Tv6Ht-Z_0yByF_FmwkQ_Uc8rFudY';
  static const String geminiApiKey = '';

  static SupabaseClient get client => Supabase.instance.client;

  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      publishableKey: supabaseAnonKey,
    );
  }

  // Real-Time Heart Notes Stream
  static Stream<List<HeartNote>> get heartNotesStream {
    return client
        .from('heart_notes')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .map((data) => data.map((json) => HeartNote.fromJson(json)).toList());
  }

  static Future<void> sendHeartNote(HeartNote note) async {
    try {
      await client.from('heart_notes').insert(note.toJson());
    } catch (e) {
      debugPrint('Supabase insert note info: $e');
    }
  }

  // Real-Time Garden Items Stream
  static Stream<List<GardenItem>> get gardenStream {
    return client
        .from('garden_items')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .map((data) => data.map((json) => GardenItem.fromJson(json)).toList());
  }

  static Future<void> addGardenItem(GardenItem item) async {
    try {
      await client.from('garden_items').insert(item.toJson());
    } catch (e) {
      debugPrint('Supabase insert garden info: $e');
    }
  }

  // Gemini AI Auto-Classification Service for Flutter
  static Future<Map<String, String>> classifyWithGemini(String title, String text) async {
    try {
      final response = await http.post(
        Uri.parse('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$geminiApiKey'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'contents': [
            {
              'parts': [
                {
                  'text': 'Analyze couple memory title: "$title" and text: "$text". Return ONLY JSON with keys "category" and "emoji".'
                }
              ]
            }
          ]
        }),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final resText = data['candidates']?[0]?['content']?['parts']?[0]?['text'] ?? '';
        final reg = RegExp(r'\{[\s\S]*\}');
        final match = reg.firstMatch(resText);
        if (match != null) {
          final parsed = jsonDecode(match.group(0)!);
          return {
            'category': parsed['category'] ?? 'Photos',
            'emoji': parsed['emoji'] ?? '🌟',
          };
        }
      }
    } catch (e) {
      debugPrint('Gemini classification fallback: $e');
    }

    // Fallback Classifier
    return {
      'category': title.toLowerCase().contains('beach') ? 'Trips' : 'Photos',
      'emoji': title.toLowerCase().contains('beach') ? '🌅' : '🌟',
    };
  }
}
