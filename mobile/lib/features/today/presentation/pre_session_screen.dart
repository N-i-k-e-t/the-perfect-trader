import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:perfect_trader_mobile/core/theme/app_theme.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';

class PreSessionScreen extends ConsumerStatefulWidget {
  const PreSessionScreen({super.key});

  @override
  ConsumerState<PreSessionScreen> createState() => _PreSessionScreenState();
}

class _PreSessionScreenState extends ConsumerState<PreSessionScreen> {
  int _step = 1;
  int _sleepScore = 3;
  int _energyLevel = 3;
  BaselineState _mood = BaselineState.neutral;

  Future<void> _complete() async {
    final today = DateTime.now().toIso8601String().split('T').first;
    await ref.read(traderSnapshotProvider.notifier).update((s) {
      return s.copyWith(
        session: s.session.copyWith(
          preSessionComplete: true,
          emotionalBaseline: _mood,
          date: today,
          notes: 'Sleep: $_sleepScore/5, Energy: $_energyLevel/5',
        ),
      );
    });
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: _step / 2,
                      backgroundColor: AppColors.border,
                      color: AppColors.primary,
                      minHeight: 6,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
              Container(
                width: 56,
                height: 56,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.shield, color: Colors.white),
              ),
              const SizedBox(height: 16),
              const Text(
                'Daily Readiness',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: AppColors.primary,
                  height: 1.1,
                ),
              ),
              const Text(
                'MORNING CHECK-IN',
                style: TextStyle(
                  color: AppColors.textMuted,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 2,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 32),
              Expanded(
                child: _step == 1
                    ? _buildStepOne()
                    : _buildStepTwo(),
              ),
              FilledButton(
                onPressed: () {
                  if (_step == 1) {
                    setState(() => _step = 2);
                  } else {
                    _complete();
                  }
                },
                child: Text(_step == 1 ? 'Continue' : 'Start session'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepOne() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Sleep quality', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        const SizedBox(height: 12),
        _ratingRow(_sleepScore, (v) => setState(() => _sleepScore = v)),
        const SizedBox(height: 32),
        const Text('Energy level', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        const SizedBox(height: 12),
        _ratingRow(_energyLevel, (v) => setState(() => _energyLevel = v)),
      ],
    );
  }

  Widget _buildStepTwo() {
    const moods = [
      (BaselineState.veryBad, '😫', 'Very low'),
      (BaselineState.bad, '😕', 'Low'),
      (BaselineState.neutral, '😐', 'Neutral'),
      (BaselineState.good, '🙂', 'Good'),
      (BaselineState.great, '🔥', 'Elite'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Emotional baseline', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
        const SizedBox(height: 16),
        ...moods.map((m) {
          final selected = _mood == m.$1;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: selected ? AppColors.primary : AppColors.border,
                  width: selected ? 2 : 1,
                ),
              ),
              leading: Text(m.$2, style: const TextStyle(fontSize: 24)),
              title: Text(m.$3, style: const TextStyle(fontWeight: FontWeight.w700)),
              selected: selected,
              onTap: () => setState(() => _mood = m.$1),
            ),
          );
        }),
      ],
    );
  }

  Widget _ratingRow(int value, ValueChanged<int> onChanged) {
    return Row(
      children: List.generate(5, (i) {
        final v = i + 1;
        final selected = value == v;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Material(
              color: selected ? AppColors.primary : const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(999),
              child: InkWell(
                onTap: () => onChanged(v),
                borderRadius: BorderRadius.circular(999),
                child: SizedBox(
                  height: 52,
                  child: Center(
                    child: Text(
                      '$v',
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                        color: selected ? Colors.white : AppColors.textMuted,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}
