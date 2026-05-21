import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';

class JournalScreen extends ConsumerWidget {
  const JournalScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trades = ref.watch(traderSnapshotProvider).trades;

    return Scaffold(
      appBar: AppBar(title: const Text('Journal')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/journal/add'),
        icon: const Icon(Icons.add),
        label: const Text('Log trade'),
      ),
      body: trades.isEmpty
          ? const Center(
              child: Text(
                'No trades yet.\nTap + to log your first trade.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.textMuted),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: trades.length,
              itemBuilder: (context, index) {
                final t = trades[index];
                final date = DateTime.tryParse(t.date);
                final label = date != null
                    ? DateFormat.MMMd().format(date)
                    : t.date;
                return Card(
                  child: ListTile(
                    title: Text('${t.pair} · ${t.type}'),
                    subtitle: Text(
                      '$label · Entry ${t.entry} → Exit ${t.exit}'
                      '${t.pnl != null ? ' · PnL ${t.pnl}' : ''}',
                    ),
                    trailing: t.rulesBroken.isNotEmpty
                        ? const Icon(Icons.warning_amber, color: Colors.orange)
                        : const Icon(Icons.check_circle_outline,
                            color: Colors.green),
                  ),
                );
              },
            ),
    );
  }
}
