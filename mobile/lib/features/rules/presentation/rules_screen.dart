import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';

class RulesScreen extends ConsumerWidget {
  const RulesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final rules = ref.watch(traderSnapshotProvider).rules;

    return Scaffold(
      appBar: AppBar(title: const Text('Rules')),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: rules.length,
        itemBuilder: (context, index) {
          final rule = rules[index];
          return Card(
            child: SwitchListTile(
              title: Text('${rule.emoji ?? ''} ${rule.text}'.trim()),
              subtitle: rule.category != null
                  ? Text(
                      rule.category!,
                      style: const TextStyle(color: AppColors.textMuted),
                    )
                  : null,
              value: rule.isActive,
              onChanged: (_) async {
                await ref.read(traderSnapshotProvider.notifier).update((s) {
                  final updated = s.rules
                      .map(
                        (r) => r.id == rule.id
                            ? r.copyWith(isActive: !r.isActive)
                            : r,
                      )
                      .toList();
                  return s.copyWith(rules: updated);
                });
              },
            ),
          );
        },
      ),
    );
  }
}
