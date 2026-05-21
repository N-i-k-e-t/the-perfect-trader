import 'package:perfect_trader_mobile/domain/entities/trading.dart';

/// Force-directed graph of psychology "memory" nodes (user model + session + logs).
class MemoryGraphOptions {
  MemoryGraphOptions._();

  static const _primary = '#1a1a2e';
  static const _accent = '#f59e0b';
  static const _red = '#ef4444';
  static const _green = '#22c55e';

  static Map<String, dynamic> build({
    required TraderSnapshot snapshot,
    String centerName = 'You',
  }) {
    final model = snapshot.userModel;
    final session = snapshot.session;
    final nodes = <Map<String, dynamic>>[];
    final links = <Map<String, dynamic>>[];

    void addNode(String name, {double size = 28, String? color}) {
      nodes.add({
        'name': name,
        'symbolSize': size,
        if (color != null)
          'itemStyle': {'color': color},
      });
    }

    void link(String source, String target) {
      links.add({'source': source, 'target': target});
    }

    addNode(centerName, size: 52, color: _primary);
    addNode('Today: ${baselineStateToString(session.emotionalBaseline)}',
        size: 36, color: _accent);
    link(centerName, 'Today: ${baselineStateToString(session.emotionalBaseline)}');

    addNode('Weakness: ${_label(model.dominantWeakness)}', size: 32, color: _red);
    link(centerName, 'Weakness: ${_label(model.dominantWeakness)}');

    addNode('Tilt: ${_label(model.tiltTrigger)}', size: 30, color: _red);
    link(centerName, 'Tilt: ${_label(model.tiltTrigger)}');

    addNode('Goal: ${_label(model.goal)}', size: 30, color: _green);
    link(centerName, 'Goal: ${_label(model.goal)}');

    if (model.revengeTradePattern) {
      addNode('Revenge trades', size: 26, color: _red);
      link('Weakness: ${_label(model.dominantWeakness)}', 'Revenge trades');
    }
    if (model.fomoPattern) {
      addNode('FOMO pattern', size: 26, color: _red);
      link(centerName, 'FOMO pattern');
    }
    if (model.overconfidencePattern) {
      addNode('Overconfidence', size: 26, color: _accent);
      link(centerName, 'Overconfidence');
    }

    addNode('Edge: ${_label(model.edgeSetup)}', size: 28, color: _green);
    link(centerName, 'Edge: ${_label(model.edgeSetup)}');

    addNode('Avoid: ${_label(model.losingSetup)}', size: 28, color: _red);
    link(centerName, 'Avoid: ${_label(model.losingSetup)}');

    final recentMoods = [...snapshot.dailyLogs]
      ..sort((a, b) => b.date.compareTo(a.date));
    if (recentMoods.isNotEmpty) {
      final latest = recentMoods.first;
      final moodLabel = 'Last mood: ${_label(latest.mood)}';
      addNode(moodLabel, size: 28, color: _accent);
      link(centerName, moodLabel);
    }

    if (snapshot.analytics.primaryDeviation.isNotEmpty) {
      final deviation =
          'Pattern: ${_label(snapshot.analytics.primaryDeviation)}';
      addNode(deviation, size: 30, color: _accent);
      link(centerName, deviation);
    }

    return {
      'tooltip': {},
      'series': [
        {
          'type': 'graph',
          'layout': 'force',
          'roam': true,
          'label': {
            'show': true,
            'fontSize': 9,
            'color': _primary,
          },
          'force': {
            'repulsion': 120,
            'edgeLength': [40, 100],
            'gravity': 0.08,
          },
          'lineStyle': {
            'color': '#e5e7eb',
            'width': 1.5,
            'curveness': 0.15,
          },
          'emphasis': {
            'focus': 'adjacency',
            'lineStyle': {'width': 3, 'color': _accent},
          },
          'data': nodes,
          'links': links,
        },
      ],
    };
  }

  static String _label(String raw) {
    return raw.replaceAll('_', ' ').split(' ').map((w) {
      if (w.isEmpty) return w;
      return '${w[0].toUpperCase()}${w.substring(1)}';
    }).join(' ');
  }
}
