import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:perfect_trader_mobile/core/constants/app_constants.dart';
import 'package:perfect_trader_mobile/core/constants/data_version.dart';
import 'package:perfect_trader_mobile/data/local/hive_cache.dart';
import 'package:perfect_trader_mobile/data/mappers/snapshot_mapper.dart';
import 'package:perfect_trader_mobile/data/remote/supabase_config.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart' as trading_models;
import 'package:perfect_trader_mobile/domain/repositories/trader_snapshot_repository.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class TraderSnapshotRepositoryImpl implements TraderSnapshotRepository {
  TraderSnapshotRepositoryImpl({SupabaseClient? client})
      : _client = client,
        _mapper = const SnapshotMapper(),
        _cache = HiveCache(mapper: const SnapshotMapper());

  final SupabaseClient? _client;
  final SnapshotMapper _mapper;
  final HiveCache _cache;
  final Connectivity _connectivity = Connectivity();

  final _snapshotController = StreamController<trading_models.TraderSnapshot>.broadcast();
  final _syncController = StreamController<SyncState>.broadcast();

  trading_models.TraderSnapshot _current = trading_models.TraderSnapshot(
    session: trading_models.Session(
      date: DateTime.now().toIso8601String().split('T').first,
    ),
    rules: trading_models.TraderSnapshot.defaultRules(),
  );

  Timer? _debounceTimer;
  String? _userId;
  bool _skipCloudSave = false;

  @override
  trading_models.TraderSnapshot get current => _current;

  @override
  Stream<TraderSnapshot> watch() async* {
    yield _current;
    yield* _snapshotController.stream;
  }

  @override
  Stream<SyncState> watchSyncState() => _syncController.stream;

  void _emit(trading_models.TraderSnapshot snapshot) {
    _current = snapshot;
    if (!_snapshotController.isClosed) {
      _snapshotController.add(snapshot);
    }
  }

  void _emitSync(SyncState state) {
    if (!_syncController.isClosed) {
      _syncController.add(state);
    }
  }

  @override
  Future<void> init() async {
    await _cache.init();
    final local = await _cache.readLocal();
    if (local != null) {
      _emit(local);
    }
  }

  @override
  Future<void> loadForUser(String userId) async {
    _userId = userId;
    _skipCloudSave = true;

    var snapshot = await _cache.readLocal() ?? _emptySnapshot();

    final client = _client;
    if (client != null && SupabaseConfig.isConfigured) {
      _emitSync(const SyncState(status: SyncStatus.syncing));
      try {
        final row = await client
            .from('trader_snapshots')
            .select('data, version')
            .eq('user_id', userId)
            .maybeSingle();

        if (row != null && row['data'] is Map) {
          final cloud = Map<String, dynamic>.from(row['data'] as Map);
          cloud['version'] = row['version'] ?? dataVersion;
          if (cloud['version'] == dataVersion) {
            snapshot = _mapper.fromJson(cloud);
            await _cache.writeLocal(snapshot);
            _emitSync(SyncState(
              status: SyncStatus.synced,
              lastSyncedAt: DateTime.now(),
            ));
          }
        } else {
          _emitSync(const SyncState(status: SyncStatus.synced));
        }
      } catch (e) {
        _emitSync(SyncState(status: SyncStatus.error, message: e.toString()));
      }
    }

    _emit(snapshot);
    await Future<void>.delayed(Duration.zero, () => _skipCloudSave = false);
  }

  @override
  Future<void> updateSnapshot(TraderSnapshot snapshot) async {
    final withVersion = snapshot.copyWith(version: dataVersion);
    _emit(withVersion);
    await _cache.writeLocal(withVersion);

    final userId = _userId;
    if (userId == null || _skipCloudSave || _client == null) return;
    if (!SupabaseConfig.isConfigured) return;

    _debounceTimer?.cancel();
    _debounceTimer = Timer(AppConstants.cloudSaveDebounce, () {
      unawaited(_upsertCloud(userId, withVersion));
    });
  }

  Future<void> _upsertCloud(String userId, trading_models.TraderSnapshot snapshot) async {
    final client = _client;
    if (client == null) return;

    final connectivity = await _connectivity.checkConnectivity();
    if (connectivity.contains(ConnectivityResult.none)) {
      _emitSync(const SyncState(status: SyncStatus.offline));
      return;
    }

    _emitSync(const SyncState(status: SyncStatus.syncing));
    try {
      final payload = _mapper.toJson(snapshot);
      await client.from('trader_snapshots').upsert(
        {
          'user_id': userId,
          'data': payload,
          'version': dataVersion,
          'updated_at': DateTime.now().toUtc().toIso8601String(),
        },
        onConflict: 'user_id',
      );
      _emitSync(SyncState(
        status: SyncStatus.synced,
        lastSyncedAt: DateTime.now(),
      ));
    } catch (e) {
      _emitSync(SyncState(status: SyncStatus.error, message: e.toString()));
    }
  }

  @override
  Future<void> clear() async {
    _userId = null;
    _debounceTimer?.cancel();
    _current = _emptySnapshot();
    await _cache.clear();
    _emit(_current);
  }

  trading_models.TraderSnapshot _emptySnapshot() {
    final today = DateTime.now().toIso8601String().split('T').first;
    return trading_models.TraderSnapshot(
      session: trading_models.Session(date: today),
      rules: trading_models.TraderSnapshot.defaultRules(),
      version: dataVersion,
    );
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _snapshotController.close();
    _syncController.close();
  }
}
