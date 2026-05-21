import 'package:perfect_trader_mobile/domain/entities/trading.dart';
import 'package:perfect_trader_mobile/features/stats/domain/stats_metrics.dart';

/// Apache ECharts option maps for [graphify] GraphifyView.
class StatsChartOptions {
  StatsChartOptions._();

  static const _primary = '#1a1a2e';
  static const _accent = '#f59e0b';
  static const _green = '#22c55e';
  static const _red = '#ef4444';

  static Map<String, dynamic> weeklyStabilityBar(Analytics analytics) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final data = analytics.weeklyStability;

    return {
      'color': [_primary, _accent],
      'grid': {'left': '8%', 'right': '4%', 'bottom': '12%', 'top': '14%'},
      'tooltip': {'trigger': 'axis'},
      'xAxis': {
        'type': 'category',
        'data': days,
        'axisLabel': {'color': '#6b7280', 'fontSize': 10},
      },
      'yAxis': {
        'type': 'value',
        'max': 100,
        'axisLabel': {'color': '#6b7280', 'fontSize': 10},
        'splitLine': {'lineStyle': {'color': '#f3f4f6'}},
      },
      'series': [
        {
          'name': 'Stability',
          'type': 'bar',
          'data': data,
          'itemStyle': {
            'borderRadius': [8, 8, 0, 0],
            'color': {
              'type': 'linear',
              'x': 0,
              'y': 0,
              'x2': 0,
              'y2': 1,
              'colorStops': [
                {'offset': 0, 'color': _primary},
                {'offset': 1, 'color': '#2d2d4a'},
              ],
            },
          },
        },
      ],
    };
  }

  static Map<String, dynamic> ruleComplianceBar(
    List<RuleComplianceRow> rows,
  ) {
    if (rows.isEmpty) {
      return weeklyStabilityBar(const Analytics());
    }

    final labels = rows.map((r) => _truncate(r.rule, 28)).toList();
    final values = rows.map((r) => r.value).toList();
    final colors = values
        .map((v) => v > 80 ? _green : (v > 60 ? _accent : _red))
        .toList();

    return {
      'grid': {'left': '4%', 'right': '12%', 'bottom': '8%', 'top': '8%'},
      'tooltip': {'trigger': 'axis', 'axisPointer': {'type': 'shadow'}},
      'xAxis': {
        'type': 'value',
        'max': 100,
        'axisLabel': {'formatter': '{value}%', 'color': '#6b7280'},
      },
      'yAxis': {
        'type': 'category',
        'data': labels.reversed.toList(),
        'axisLabel': {'color': '#374151', 'fontSize': 10},
      },
      'series': [
        {
          'type': 'bar',
          'data': values.reversed
              .toList()
              .asMap()
              .entries
              .map((e) => {
                    'value': e.value,
                    'itemStyle': {'color': colors.reversed.toList()[e.key]},
                  })
              .toList(),
          'label': {
            'show': true,
            'position': 'right',
            'formatter': '{c}%',
            'color': _primary,
            'fontWeight': 'bold',
          },
        },
      ],
    };
  }

  static Map<String, dynamic> moodMemoryLine({
    required List<DailyLog> dailyLogs,
    required Session session,
  }) {
    final sorted = [...dailyLogs]
      ..sort((a, b) => a.date.compareTo(b.date));
    final recent = sorted.length > 14
        ? sorted.sublist(sorted.length - 14)
        : sorted;

    final dates = <String>[];
    final scores = <int>[];

    for (final log in recent) {
      dates.add(log.date.substring(5));
      scores.add(moodToScore(log.mood));
    }

    if (dates.isEmpty) {
      final today = DateTime.now().toIso8601String().split('T').first;
      dates.add(today.substring(5));
      scores.add(baselineToScore(session.emotionalBaseline));
    }

    return {
      'color': [_accent],
      'grid': {'left': '10%', 'right': '6%', 'bottom': '14%', 'top': '16%'},
      'tooltip': {'trigger': 'axis'},
      'xAxis': {
        'type': 'category',
        'data': dates,
        'boundaryGap': false,
        'axisLabel': {'color': '#6b7280', 'fontSize': 9, 'rotate': 35},
      },
      'yAxis': {
        'type': 'value',
        'min': -2,
        'max': 2,
        'interval': 1,
        'axisLabel': {
          'color': '#6b7280',
          'formatter': _moodAxisLabel,
        },
        'splitLine': {'lineStyle': {'color': '#f3f4f6'}},
      },
      'series': [
        {
          'name': 'Mood memory',
          'type': 'line',
          'smooth': true,
          'symbol': 'circle',
          'symbolSize': 8,
          'areaStyle': {'opacity': 0.12, 'color': _accent},
          'lineStyle': {'width': 3, 'color': _accent},
          'data': scores,
        },
      ],
    };
  }

  static String _moodAxisLabel(dynamic value) {
    switch (value) {
      case -2:
        return 'Very low';
      case -1:
        return 'Low';
      case 0:
        return 'Neutral';
      case 1:
        return 'Good';
      case 2:
        return 'Great';
      default:
        return '';
    }
  }

  static String _truncate(String text, int max) {
    if (text.length <= max) return text;
    return '${text.substring(0, max - 1)}…';
  }
}
