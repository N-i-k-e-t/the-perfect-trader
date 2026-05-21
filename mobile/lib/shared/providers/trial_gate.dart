import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:perfect_trader_mobile/core/constants/app_constants.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';

class TrialGate {
  const TrialGate({
    required this.expired,
    required this.daysLeft,
    this.isPro = false,
  });

  final bool expired;
  final int daysLeft;
  final bool isPro;
}

final trialGateProvider = Provider<TrialGate>((ref) {
  final user = ref.watch(traderSnapshotProvider).user;
  if (user == null) {
    return const TrialGate(expired: false, daysLeft: AppConstants.trialDays);
  }
  if (AppConstants.betaMode || user.isPro) {
    return const TrialGate(expired: false, daysLeft: 0, isPro: true);
  }
  final startRaw = user.trialStartDate;
  if (startRaw == null) {
    return const TrialGate(expired: false, daysLeft: AppConstants.trialDays);
  }
  final start = DateTime.tryParse(startRaw) ?? DateTime.now();
  final elapsedHours = DateTime.now().difference(start).inHours;
  if (elapsedHours > AppConstants.trialDays * 24) {
    return const TrialGate(expired: true, daysLeft: 0);
  }
  final daysLeft =
      ((AppConstants.trialDays * 24 - elapsedHours) / 24).ceil().clamp(1, 3);
  return TrialGate(expired: false, daysLeft: daysLeft);
});
