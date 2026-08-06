import 'package:flutter_test/flutter_test.dart';
import 'package:between_us/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const BetweenUsApp());
    expect(find.byType(BetweenUsApp), findsOneWidget);
  });
}
