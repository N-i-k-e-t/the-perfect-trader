import 'package:flutter_test/flutter_test.dart';
import 'package:perfect_trader_mobile/core/constants/data_version.dart';
import 'package:perfect_trader_mobile/data/mappers/snapshot_mapper.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart';

void main() {
  const mapper = SnapshotMapper();

  test('round-trip snapshot json', () {
    final snapshot = TraderSnapshot(
      version: dataVersion,
      user: const TraderUser(email: 't@example.com', name: 'Trader'),
      session: Session(
        date: '2026-05-20',
        emotionalBaseline: BaselineState.neutral,
        preSessionComplete: true,
      ),
      rules: TraderSnapshot.defaultRules(),
    );

    final json = mapper.toJson(snapshot);
    expect(json['version'], dataVersion);

    final restored = mapper.fromJson(json);
    expect(restored.user?.email, 't@example.com');
    expect(restored.session.preSessionComplete, true);
    expect(restored.rules.length, 5);
  });
}
