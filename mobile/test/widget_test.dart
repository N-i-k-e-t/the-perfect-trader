import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';

void main() {
  testWidgets('theme builds MaterialApp', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: buildAppTheme(),
        home: const Scaffold(body: Text('The Perfect Trader')),
      ),
    );
    expect(find.text('The Perfect Trader'), findsOneWidget);
  });
}
