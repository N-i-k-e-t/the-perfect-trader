import 'package:perfect_trader_mobile/domain/entities/trading.dart';

class RuleComplianceRow {
  const RuleComplianceRow({
    required this.rule,
    required this.value,
    required this.total,
  });

  final String rule;
  final int value;
  final int total;
}

class StreakMetrics {
  const StreakMetrics({required this.current, required this.best});

  final int current;
  final int best;
}

class StatsMetrics {
  const StatsMetrics({
    required this.streak,
    required this.compliance,
    required this.followedWinRate,
    required this.brokenWinRate,
  });

  final StreakMetrics streak;
  final List<RuleComplianceRow> compliance;
  final int followedWinRate;
  final int brokenWinRate;
}

StatsMetrics computeStatsMetrics({
  required List<Trade> trades,
  required List<Rule> rules,
  required List<DailyLog> dailyLogs,
  String period = 'All',
}) {
  final filtered = _filterTradesByPeriod(trades, period);
  final streak = _computeStreak(dailyLogs);
  final compliance = _computeCompliance(filtered, rules);
  final winRates = _computeWinRates(filtered);

  return StatsMetrics(
    streak: streak,
    compliance: compliance,
    followedWinRate: winRates.$1,
    brokenWinRate: winRates.$2,
  );
}

List<Trade> _filterTradesByPeriod(List<Trade> trades, String period) {
  if (period == 'All') return trades;
  final now = DateTime.now();
  final days = period == 'Week' ? 7 : 30;
  final cutoff = DateTime(now.year, now.month, now.day)
      .subtract(Duration(days: days));
  final cutoffStr = cutoff.toIso8601String().split('T').first;
  return trades.where((t) => t.date.compareTo(cutoffStr) >= 0).toList();
}

StreakMetrics _computeStreak(List<DailyLog> dailyLogs) {
  var current = 0;
  var best = 0;
  final sorted = [...dailyLogs]..sort((a, b) => b.date.compareTo(a.date));
  final d = DateTime.now();

  for (var i = 0; i < 365; i++) {
    final dateStr = d.toIso8601String().split('T').first;
    DailyLog? log;
    for (final entry in sorted) {
      if (entry.date == dateStr) {
        log = entry;
        break;
      }
    }
    if (log != null &&
        (log.rulesChecked.isNotEmpty || log.tradesLogged > 0)) {
      current++;
    } else if (i > 0) {
      break;
    }
    d.subtract(const Duration(days: 1));
  }

  var temp = 0;
  final ascending = [...dailyLogs]..sort((a, b) => a.date.compareTo(b.date));
  for (final log in ascending) {
    if (log.rulesChecked.isNotEmpty || log.tradesLogged > 0) {
      temp++;
      if (temp > best) best = temp;
    } else {
      temp = 0;
    }
  }
  if (current > best) best = current;

  return StreakMetrics(current: current, best: best);
}

List<RuleComplianceRow> _computeCompliance(
  List<Trade> trades,
  List<Rule> rules,
) {
  final active = rules.where((r) => r.isActive).toList();
  return active.map((rule) {
    final relevant = trades.where(
      (t) =>
          t.rulesFollowed.contains(rule.id) ||
          t.rulesBroken.contains(rule.id),
    );
    final followed =
        relevant.where((t) => t.rulesFollowed.contains(rule.id)).length;
    final total = relevant.length;
    final value =
        total > 0 ? ((followed / total) * 100).round() : 0;
    return RuleComplianceRow(rule: rule.text, value: value, total: total);
  }).where((c) => c.total > 0).toList();
}

(int, int) _computeWinRates(List<Trade> trades) {
  if (trades.isEmpty) return (0, 0);
  final clean = trades.where((t) => t.rulesBroken.isEmpty).length;
  final dirty = trades.where((t) => t.rulesBroken.isNotEmpty).length;
  return (
    ((clean / trades.length) * 100).round(),
    ((dirty / trades.length) * 100).round(),
  );
}

int moodToScore(String mood) {
  switch (mood) {
    case 'very_bad':
      return -2;
    case 'bad':
      return -1;
    case 'good':
      return 1;
    case 'great':
      return 2;
    default:
      return 0;
  }
}

int baselineToScore(BaselineState state) {
  switch (state) {
    case BaselineState.veryBad:
      return -2;
    case BaselineState.bad:
      return -1;
    case BaselineState.good:
      return 1;
    case BaselineState.great:
      return 2;
    case BaselineState.neutral:
      return 0;
  }
}
