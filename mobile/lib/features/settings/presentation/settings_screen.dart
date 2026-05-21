import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';
import 'package:perfect_trader_mobile/domain/repositories/trader_snapshot_repository.dart';
import 'package:perfect_trader_mobile/features/auth/presentation/auth_controller.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';
import 'package:perfect_trader_mobile/shared/providers/trial_gate.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  String _syncLabel(SyncState? sync) {
    if (sync == null) return 'Idle';
    switch (sync.status) {
      case SyncStatus.syncing:
        return 'Syncing…';
      case SyncStatus.synced:
        return sync.lastSyncedAt != null
            ? 'Synced ${_formatTime(sync.lastSyncedAt!)}'
            : 'Synced';
      case SyncStatus.offline:
        return 'Offline — saved locally';
      case SyncStatus.error:
        return 'Error: ${sync.message ?? 'unknown'}';
      case SyncStatus.idle:
        return 'Idle';
    }
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final snapshot = ref.watch(traderSnapshotProvider);
    final user = snapshot.user;
    final trial = ref.watch(trialGateProvider);
    final syncAsync = ref.watch(syncStateProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    user?.name ?? 'Trader',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: const TextStyle(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: user?.isPro == true
                          ? AppColors.accent.withValues(alpha: 0.2)
                          : AppColors.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      user?.isPro == true
                          ? 'Pro Member'
                          : trial.expired
                              ? 'Trial expired'
                              : 'Trial · ${trial.daysLeft}d left',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.cloud_sync_outlined),
              title: const Text('Sync status'),
              subtitle: Text(_syncLabel(syncAsync.valueOrNull)),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () =>
                ref.read(authControllerProvider.notifier).signOut(),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade700,
            ),
            child: const Text('Sign out'),
          ),
        ],
      ),
    );
  }
}
