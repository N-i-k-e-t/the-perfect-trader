import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:perfect_trader_mobile/core/discipline.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';
import 'package:perfect_trader_mobile/shared/providers/trial_gate.dart';

class TodayScreen extends ConsumerWidget {
  const TodayScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final snapshot = ref.watch(traderSnapshotProvider);
    final trial = ref.watch(trialGateProvider);
    final today = DateTime.now().toIso8601String().split('T').first;
    final activeRules = snapshot.rules.where((r) => r.isActive).toList();
    final log = snapshot.dailyLogs.firstWhere(
      (d) => d.date == today,
      orElse: () => DailyLog(date: today),
    );
    final score = calculateRuleChecklistScore(
      activeRules.length,
      log.rulesChecked.length,
    );
    final grade = scoreToGrade(score);
    final session = snapshot.session;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Today'),
        actions: [
          if (!trial.isPro && !trial.expired)
            Center(
              child: Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Text(
                  'Trial ${trial.daysLeft}d',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.accent,
                  ),
                ),
              ),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          if (!session.preSessionComplete)
            Card(
              child: ListTile(
                leading: const Icon(Icons.bolt, color: AppColors.accent),
                title: const Text('Pre-session baseline'),
                subtitle: const Text('Log sleep, energy, and mood before trading'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => context.push('/pre-session'),
              ),
            )
          else
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Pre-session complete — ${baselineStateToString(session.emotionalBaseline)}',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 20),
          Center(
            child: Column(
              children: [
                SizedBox(
                  width: 140,
                  height: 140,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      CircularProgressIndicator(
                        value: score / 100,
                        strokeWidth: 10,
                        backgroundColor: AppColors.border,
                        color: AppColors.accent,
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '$score%',
                            style: Theme.of(context)
                                .textTheme
                                .headlineMedium
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                          Text(
                            'Grade $grade',
                            style: const TextStyle(
                              color: AppColors.textMuted,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${log.rulesChecked.length}/${activeRules.length} rules checked',
                  style: const TextStyle(color: AppColors.textMuted),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Daily checklist',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: 8),
          ...activeRules.map((rule) {
            final checked = log.rulesChecked.contains(rule.id);
            return Card(
              child: CheckboxListTile(
                value: checked,
                onChanged: session.rulesLocked
                    ? null
                    : (_) => _toggleRule(ref, today, log, rule.id, activeRules),
                title: Text('${rule.emoji ?? ''} ${rule.text}'.trim()),
                subtitle: rule.category != null ? Text(rule.category!) : null,
              ),
            );
          }),
        ],
      ),
    );
  }

  Future<void> _toggleRule(
    WidgetRef ref,
    String today,
    DailyLog log,
    String ruleId,
    List<Rule> activeRules,
  ) async {
    final checked = List<String>.from(log.rulesChecked);
    if (checked.contains(ruleId)) {
      checked.remove(ruleId);
    } else {
      checked.add(ruleId);
    }
    final score = calculateRuleChecklistScore(activeRules.length, checked.length);
    final updated = log.copyWith(
      rulesChecked: checked,
      complianceScore: score.toDouble(),
      grade: scoreToGrade(score),
      rulesFollowed: checked.length,
    );
    await ref.read(traderSnapshotProvider.notifier).update((s) {
      final logs = [...s.dailyLogs];
      final idx = logs.indexWhere((d) => d.date == today);
      if (idx >= 0) {
        logs[idx] = updated;
      } else {
        logs.add(updated);
      }
      return s.copyWith(dailyLogs: logs);
    });
  }
}
