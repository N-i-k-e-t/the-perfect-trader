import 'package:flutter_test/flutter_test.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart';
import 'package:perfect_trader_mobile/features/stats/domain/stats_metrics.dart';
import 'package:perfect_trader_mobile/features/stats/presentation/charts/memory_graph_options.dart';
import 'package:perfect_trader_mobile/features/stats/presentation/charts/stats_chart_options.dart';

void main() {
  test('weekly stability chart has bar series', () {
    final options = StatsChartOptions.weeklyStabilityBar(const Analytics());
    expect(options['series'], isA<List>());
    expect((options['series'] as List).first['type'], 'bar');
  });

  test('memory graph links trader to psychology nodes', () {
    final snapshot = TraderSnapshot(
      session: Session(date: '2026-05-20', emotionalBaseline: BaselineState.good),
      userModel: const UserModel(goal: 'consistency', dominantWeakness: 'fomo'),
    );
    final options = MemoryGraphOptions.build(snapshot: snapshot, centerName: 'Alex');
    final series = (options['series'] as List).first as Map<String, dynamic>;
    final links = series['links'] as List;
    expect(links, isNotEmpty);
  });

  test('computeStatsMetrics returns compliance rows', () {
    final metrics = computeStatsMetrics(
      trades: [
        const Trade(
          id: 't1',
          date: '2026-05-20',
          pair: 'NIFTY',
          type: 'long',
          entry: '100',
          exit: '105',
          rulesFollowed: ['1'],
          rulesBroken: [],
        ),
      ],
      rules: TraderSnapshot.defaultRules(),
      dailyLogs: const [],
    );
    expect(metrics.compliance, isNotEmpty);
  });
}
