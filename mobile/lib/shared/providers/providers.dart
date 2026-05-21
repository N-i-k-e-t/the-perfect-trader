import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:perfect_trader_mobile/data/local/hive_cache.dart';
import 'package:perfect_trader_mobile/data/repositories/trader_snapshot_repository_impl.dart';
import 'package:perfect_trader_mobile/domain/repositories/trader_snapshot_repository.dart';
import 'package:perfect_trader_mobile/features/auth/data/auth_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final supabaseClientProvider = Provider<SupabaseClient?>((ref) {
  try {
    return Supabase.instance.client;
  } catch (_) {
    return null;
  }
});

final hiveCacheProvider = Provider<HiveCache>((ref) => HiveCache());

final traderRepositoryProvider = Provider<TraderSnapshotRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  final repo = TraderSnapshotRepositoryImpl(client: client);
  ref.onDispose(repo.dispose);
  return repo;
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(supabaseClientProvider));
});

final traderSnapshotProvider =
    StateNotifierProvider<TraderSnapshotNotifier, TraderSnapshot>((ref) {
  return TraderSnapshotNotifier(ref.watch(traderRepositoryProvider));
});

final syncStateProvider = StreamProvider<SyncState>((ref) {
  final repo = ref.watch(traderRepositoryProvider);
  return repo.watchSyncState();
});

class TraderSnapshotNotifier extends StateNotifier<TraderSnapshot> {
  TraderSnapshotNotifier(this._repository) : super(_repository.current) {
    _subscription = _repository.watch().listen((snapshot) {
      state = snapshot;
    });
  }

  final TraderSnapshotRepository _repository;
  late final StreamSubscription<TraderSnapshot> _subscription;

  Future<void> init() => _repository.init();

  Future<void> loadForUser(String userId) => _repository.loadForUser(userId);

  Future<void> replace(TraderSnapshot snapshot) =>
      _repository.updateSnapshot(snapshot);

  Future<void> update(TraderSnapshot Function(TraderSnapshot) fn) async {
    await _repository.updateSnapshot(fn(state));
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
