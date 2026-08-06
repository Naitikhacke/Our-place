import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'services/supabase_service.dart';
import 'screens/partner_select_screen.dart';
import 'screens/home_screen.dart';
import 'screens/garden_screen.dart';
import 'screens/letters_screen.dart';
import 'screens/memories_screen.dart';
import 'screens/profile_screen.dart';
import 'widgets/new_thought_modal.dart';
import 'widgets/evening_ritual_modal.dart';
import 'models/app_models.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseService.initialize();
  runApp(const BetweenUsApp());
}

class BetweenUsApp extends StatelessWidget {
  const BetweenUsApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Between Us',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainShell(),
    );
  }
}

class MainShell extends StatefulWidget {
  const MainShell({Key? key}) : super(key: key);

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _activeTab = 0;
  String _currentPartner = 'Naitik';
  bool _isPartnerSelectOpen = false;
  int _houseLevel = 1;

  void _onSelectPartner(String partner) {
    setState(() {
      _currentPartner = partner;
      _isPartnerSelectOpen = false;
    });
  }

  void _openNewThought() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => NewThoughtModal(currentPartner: _currentPartner),
    );
  }

  void _openRitual(List<HeartNote> notes) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => EveningRitualModal(
        currentPartner: _currentPartner,
        notes: notes,
        onResolveNotes: () {
          setState(() {
            _houseLevel = (_houseLevel % 5) + 1;
          });
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isPartnerSelectOpen) {
      return Scaffold(
        body: PartnerSelectScreen(
          currentPartner: _currentPartner,
          onSelectPartner: _onSelectPartner,
        ),
      );
    }

    return StreamBuilder<List<HeartNote>>(
      stream: SupabaseService.heartNotesStream,
      builder: (context, snapshot) {
        final notes = snapshot.data ?? [];

        final screens = [
          HomeScreen(
            currentPartner: _currentPartner,
            houseLevel: _houseLevel,
            unreadCount: notes.length,
            onOpenRitual: () => _openRitual(notes),
            onOpenPartnerSelect: () => setState(() => _isPartnerSelectOpen = true),
          ),
          GardenScreen(currentPartner: _currentPartner),
          LettersScreen(currentPartner: _currentPartner),
          MemoriesScreen(currentPartner: _currentPartner),
          ProfileScreen(currentPartner: _currentPartner),
        ];

        return Scaffold(
          body: screens[_activeTab],
          bottomNavigationBar: Container(
            decoration: const BoxDecoration(
              color: Color(0xFF0F1428),
              boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10)],
            ),
            child: BottomNavigationBar(
              currentIndex: _activeTab,
              onTap: (idx) {
                if (idx == 2 && _activeTab == 2) {
                  _openNewThought();
                } else {
                  setState(() => _activeTab = idx);
                }
              },
              backgroundColor: const Color(0xFF0F1428),
              selectedItemColor: const Color(0xFFEE7B7B),
              unselectedItemColor: const Color(0xFFA3ADC2),
              type: BottomNavigationBarType.fixed,
              items: [
                const BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
                const BottomNavigationBarItem(icon: Icon(Icons.local_florist_outlined), label: 'Garden'),
                BottomNavigationBarItem(
                  icon: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: Color(0xFFEE7B7B),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 20),
                  ),
                  label: 'New',
                ),
                const BottomNavigationBarItem(icon: Icon(Icons.mark_email_unread_outlined), label: 'Letters'),
                const BottomNavigationBarItem(icon: Icon(Icons.star_outline), label: 'Memories'),
              ],
            ),
          ),
        );
      },
    );
  }
}
