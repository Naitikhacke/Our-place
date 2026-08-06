class HeartNote {
  final String id;
  final String author;
  final String recipient;
  final String text;
  final String mood;
  final String need;
  final String timestamp;
  final String status;
  final DateTime? unlockTimestamp;

  HeartNote({
    required this.id,
    required this.author,
    required this.recipient,
    required this.text,
    required this.mood,
    required this.need,
    required this.timestamp,
    this.status = 'unread',
    this.unlockTimestamp,
  });

  factory HeartNote.fromJson(Map<String, dynamic> json) {
    return HeartNote(
      id: json['id']?.toString() ?? '',
      author: json['author'] ?? 'Partner',
      recipient: json['recipient'] ?? 'Partner',
      text: json['text'] ?? '',
      mood: json['mood'] ?? 'happy',
      need: json['need'] ?? 'Hug',
      timestamp: json['created_at'] != null
          ? json['created_at'].toString()
          : 'Just now',
      status: json['status'] ?? 'unread',
      unlockTimestamp: json['unlock_timestamp'] != null
          ? DateTime.tryParse(json['unlock_timestamp'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'author': author,
      'recipient': recipient,
      'text': text,
      'mood': mood,
      'need': need,
      'status': status,
      'unlock_timestamp': unlockTimestamp?.toIso8601String(),
    };
  }
}

class GardenItem {
  final String id;
  final String author;
  final String type;
  final String category;
  final String emoji;
  final String title;
  final String text;
  final String date;

  GardenItem({
    required this.id,
    required this.author,
    required this.type,
    required this.category,
    required this.emoji,
    required this.title,
    required this.text,
    required this.date,
  });

  factory GardenItem.fromJson(Map<String, dynamic> json) {
    return GardenItem(
      id: json['id']?.toString() ?? '',
      author: json['author'] ?? 'Partner',
      type: json['type'] ?? 'flower',
      category: json['category'] ?? 'Resolved',
      emoji: json['emoji'] ?? '🌸',
      title: json['title'] ?? '',
      text: json['text'] ?? '',
      date: json['date'] ?? 'Recently',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'author': author,
      'type': type,
      'category': category,
      'emoji': emoji,
      'title': title,
      'text': text,
      'date': date,
    };
  }
}

class LetterItem {
  final String id;
  final String author;
  final String recipient;
  final String title;
  final String body;
  final DateTime? unlockTimestamp;

  LetterItem({
    required this.id,
    required this.author,
    required this.recipient,
    required this.title,
    required this.body,
    this.unlockTimestamp,
  });
}

class MemoryItem {
  final String id;
  final String author;
  final String title;
  final String category;
  final String date;
  final String emoji;
  final String desc;
  final bool hasVoice;

  MemoryItem({
    required this.id,
    required this.author,
    required this.title,
    required this.category,
    required this.date,
    required this.emoji,
    required this.desc,
    this.hasVoice = false,
  });
}
