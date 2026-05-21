import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:perfect_trader_mobile/core/router/app_router.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';

class PerfectTraderApp extends ConsumerWidget {
  const PerfectTraderApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'The Perfect Trader',
      theme: buildAppTheme(),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
