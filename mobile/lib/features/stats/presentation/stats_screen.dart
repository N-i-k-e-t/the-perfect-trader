import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';
import 'package:perfect_trader_mobile/features/stats/domain/stats_metrics.dart';
import 'package:perfect_trader_mobile/features/stats/presentation/charts/memory_graph_options.dart';
import 'package:perfect_trader_mobile/features/stats/presentation/charts/stats_chart_options.dart';
import 'package:perfect_trader_mobile/features/stats/presentation/widgets/graphify_chart_card.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';

class StatsScreen extends ConsumerStatefulWidget {
  const StatsScreen({super.key});

  @override
  ConsumerState<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends ConsumerState<StatsScreen> {
  String _period = 'All';

  @override
  Widget build(BuildContext context) {
    final snapshot = ref.watch(traderSnapshotProvider);
    final metrics = computeStatsMetrics(
      trades: snapshot.trades,
      rules: snapshot.rules,
      dailyLogs: snapshot.dailyLogs,
      period: _period,
    );
    final displayName = snapshot.user?.name ?? 'Trader';

    return Scaffold(
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            const Text(
              'My Stats',
              style: TextStyle(
                fontSize: 34,
                fontWeight: FontWeight.w900,
                color: AppColors.primary,
                height: 1.05,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Charts & psychology memory',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.textMuted,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(
                  child: _MetricTile(
                    label: 'Streak',
                    value: '${metrics.streak.current}',
                    suffix: 'days',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _MetricTile(
                    label: 'Adherence',
                    value: '${snapshot.analytics.ruleAdherence.round()}',
                    suffix: '%',
                    accent: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _MetricTile(
                    label: 'Rules followed',
                    value: '${metrics.followedWinRate}',
                    suffix: '%',
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _MetricTile(
                    label: 'Rules broken',
                    value: '${metrics.brokenWinRate}',
                    suffix: '%',
                    danger: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            GraphifyChartCard(
              title: 'WEEKLY STABILITY',
              subtitle: 'Discipline score by day (from your snapshot)',
              options: StatsChartOptions.weeklyStabilityBar(snapshot.analytics),
            ),
            const SizedBox(height: 16),
            GraphifyChartCard(
              title: 'MOOD MEMORY',
              subtitle: 'Emotional state over recent journal days',
              options: StatsChartOptions.moodMemoryLine(
                dailyLogs: snapshot.dailyLogs,
                session: snapshot.session,
              ),
              height: 220,
            ),
            const SizedBox(height: 16),
            GraphifyChartCard(
              title: 'PSYCHOLOGY MEMORY GRAPH',
              subtitle:
                  'How weaknesses, goals, and patterns connect in your model',
              options: MemoryGraphOptions.build(
                snapshot: snapshot,
                centerName: displayName,
              ),
              height: 320,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'RULE COMPLIANCE',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1.2,
                    color: AppColors.primary,
                  ),
                ),
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'Week', label: Text('Week')),
                    ButtonSegment(value: 'Month', label: Text('Mo')),
                    ButtonSegment(value: 'All', label: Text('All')),
                  ],
                  selected: {_period},
                  onSelectionChanged: (s) => setState(() => _period = s.first),
                  style: const ButtonStyle(
                    visualDensity: VisualDensity.compact,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            if (metrics.compliance.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(
                    'Log trades with rule tags to see compliance charts.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
              )
            else
              GraphifyChartCard(
                title: 'BY RULE',
                subtitle: '$_period window · % followed when rule applied',
                options:
                    StatsChartOptions.ruleComplianceBar(metrics.compliance),
                height: (metrics.compliance.length * 44.0).clamp(180, 360),
              ),
          ],
        ),
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  const _MetricTile({
    required this.label,
    required this.value,
    required this.suffix,
    this.accent = false,
    this.danger = false,
  });

  final String label;
  final String value;
  final String suffix;
  final bool accent;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final valueColor = danger
        ? Colors.red.shade600
        : (accent ? AppColors.accent : AppColors.primary);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label.toUpperCase(),
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: AppColors.textMuted,
                letterSpacing: 1,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    color: valueColor,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  suffix,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
