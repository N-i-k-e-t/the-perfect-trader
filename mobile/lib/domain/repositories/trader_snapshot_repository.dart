import '../entities/trading.dart';

export '../entities/trading.dart' show TraderSnapshot;

enum SyncStatus { idle, syncing, synced, offline, error }

class SyncState {
  const SyncState({
    this.status = SyncStatus.idle,
    this.lastSyncedAt,
    this.message,
  });

  final SyncStatus status;
  final DateTime? lastSyncedAt;
  final String? message;
}

abstract class TraderSnapshotRepository {
  TraderSnapshot get current;
  Stream<TraderSnapshot> watch();
  Stream<SyncState> watchSyncState();

  Future<void> init();
  Future<void> loadForUser(String userId);
  Future<void> updateSnapshot(TraderSnapshot snapshot);
  Future<void> clear();
  void dispose();
}
