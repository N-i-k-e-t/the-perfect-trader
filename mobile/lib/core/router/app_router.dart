import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:perfect_trader_mobile/features/auth/presentation/auth_controller.dart';
import 'package:perfect_trader_mobile/features/auth/presentation/forgot_password_screen.dart';
import 'package:perfect_trader_mobile/features/auth/presentation/login_screen.dart';
import 'package:perfect_trader_mobile/features/auth/presentation/signup_screen.dart';
import 'package:perfect_trader_mobile/features/journal/presentation/add_trade_screen.dart';
import 'package:perfect_trader_mobile/features/journal/presentation/journal_screen.dart';
import 'package:perfect_trader_mobile/features/rules/presentation/rules_screen.dart';
import 'package:perfect_trader_mobile/features/settings/presentation/settings_screen.dart';
import 'package:perfect_trader_mobile/features/stats/presentation/stats_screen.dart';
import 'package:perfect_trader_mobile/features/shell/app_shell.dart';
import 'package:perfect_trader_mobile/features/shell/presentation/trial_expired_screen.dart';
import 'package:perfect_trader_mobile/features/today/presentation/pre_session_screen.dart';
import 'package:perfect_trader_mobile/features/today/presentation/today_screen.dart';
import 'package:perfect_trader_mobile/shared/providers/trial_gate.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);
  final trial = ref.watch(trialGateProvider);

  return GoRouter(
    initialLocation: '/today',
    refreshListenable: _RouterRefresh(ref),
    redirect: (context, state) {
      final isAuth = auth.isAuthenticated;
      final isLoading = auth.isLoading;
      final loc = state.matchedLocation;
      final onAuthRoute =
          loc == '/login' || loc == '/signup' || loc == '/forgot-password';

      if (isLoading) return null;
      if (!isAuth && !onAuthRoute) return '/login';
      if (isAuth && onAuthRoute) return '/today';
      if (isAuth && trial.expired && loc != '/trial-expired') {
        return '/trial-expired';
      }
      if (isAuth && !trial.expired && loc == '/trial-expired') {
        return '/today';
      }
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/signup', builder: (_, __) => const SignupScreen()),
      GoRoute(
        path: '/forgot-password',
        builder: (_, __) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/trial-expired',
        builder: (_, __) => const TrialExpiredScreen(),
      ),
      GoRoute(path: '/pre-session', builder: (_, __) => const PreSessionScreen()),
      GoRoute(path: '/journal/add', builder: (_, __) => const AddTradeScreen()),
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(path: '/today', builder: (_, __) => const TodayScreen()),
          GoRoute(path: '/journal', builder: (_, __) => const JournalScreen()),
          GoRoute(path: '/stats', builder: (_, __) => const StatsScreen()),
          GoRoute(path: '/rules', builder: (_, __) => const RulesScreen()),
          GoRoute(
            path: '/settings',
            builder: (_, __) => const SettingsScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text(state.error.toString())),
    ),
  );
});

class _RouterRefresh extends ChangeNotifier {
  _RouterRefresh(this._ref) {
    _ref.listen(authControllerProvider, (_, __) => notifyListeners());
    _ref.listen(trialGateProvider, (_, __) => notifyListeners());
  }

  final Ref _ref;
}
