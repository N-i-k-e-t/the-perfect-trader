import 'dart:convert';

import 'package:hive_flutter/hive_flutter.dart';
import 'package:perfect_trader_mobile/core/constants/brand_constants.dart';
import 'package:perfect_trader_mobile/data/mappers/snapshot_mapper.dart';
import 'package:perfect_trader_mobile/domain/entities/trader_snapshot.dart';

class HiveCache {
  HiveCache({SnapshotMapper? mapper}) : _mapper = mapper ?? const SnapshotMapper();

  static const String boxName = 'perfect_trader_cache';

  final SnapshotMapper _mapper;
  Box<String>? _box;

  Future<void> init() async {
    await Hive.initFlutter();
    _box = await Hive.openBox<String>(boxName);
  }

  Future<TraderSnapshot?> readLocal() async {
    final box = _box;
    if (box == null) return null;

    var raw = box.get(BrandConstants.storageKey);
    raw ??= box.get(BrandConstants.storageKeyLegacy);
    if (raw == null) return null;

    try {
      final decoded = jsonDecode(raw) as Map<String, dynamic>;
      return _mapper.fromJson(decoded);
    } catch (_) {
      return null;
    }
  }

  Future<void> writeLocal(TraderSnapshot snapshot) async {
    final box = _box;
    if (box == null) return;
    final json = jsonEncode(_mapper.toJson(snapshot));
    await box.put(BrandConstants.storageKey, json);
  }

  Future<void> clear() async {
    await _box?.delete(BrandConstants.storageKey);
    await _box?.delete(BrandConstants.storageKeyLegacy);
  }
}
