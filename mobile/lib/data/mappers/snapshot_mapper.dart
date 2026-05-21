import '../../core/constants/data_version.dart';
import '../../domain/entities/trading.dart';

/// Maps jsonb ↔ domain; tolerates unknown fields and legacy storage key.
class SnapshotMapper {
  const SnapshotMapper();

  Map<String, dynamic> toJson(TraderSnapshot snapshot) {
    return {
      'version': dataVersion,
      if (snapshot.user != null) 'user': snapshot.user!.toJson(),
      'session': snapshot.session.toJson(),
      'rules': snapshot.rules.map((r) => r.toJson()).toList(),
      'trades': snapshot.trades.map((t) => t.toJson()).toList(),
      'dailyLogs': snapshot.dailyLogs.map((d) => d.toJson()).toList(),
      'analytics': snapshot.analytics.toJson(),
      'userModel': snapshot.userModel.toJson(),
    };
  }

  TraderSnapshot fromJson(Map<String, dynamic> json) {
    final migrated = _migrateLegacy(json);

    return TraderSnapshot(
      version: migrated['version'] as String? ?? dataVersion,
      user: migrated['user'] != null
          ? TraderUser.fromJson(
              Map<String, dynamic>.from(migrated['user'] as Map),
            )
          : null,
      session: migrated['session'] != null
          ? Session.fromJson(
              Map<String, dynamic>.from(migrated['session'] as Map),
            )
          : _defaultSession(),
      rules: _listOfMaps(migrated['rules']).map(Rule.fromJson).toList(),
      trades: _listOfMaps(migrated['trades']).map(Trade.fromJson).toList(),
      dailyLogs:
          _listOfMaps(migrated['dailyLogs']).map(DailyLog.fromJson).toList(),
      analytics: migrated['analytics'] != null
          ? Analytics.fromJson(
              Map<String, dynamic>.from(migrated['analytics'] as Map),
            )
          : const Analytics(),
      userModel: migrated['userModel'] != null
          ? UserModel.fromJson(
              Map<String, dynamic>.from(migrated['userModel'] as Map),
            )
          : const UserModel(),
    );
  }

  Map<String, dynamic> _migrateLegacy(Map<String, dynamic> json) => json;

  Session _defaultSession() {
    final today = DateTime.now().toIso8601String().split('T').first;
    return Session(date: today);
  }

  List<Map<String, dynamic>> _listOfMaps(dynamic value) {
    if (value is! List) return const [];
    return value
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }
}
