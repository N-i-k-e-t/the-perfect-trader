import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart';
import 'package:perfect_trader_mobile/features/auth/data/auth_service.dart';
import 'package:perfect_trader_mobile/shared/providers/providers.dart';
import 'package:supabase_flutter/supabase_flutter.dart' hide Session;

class AuthStateModel {
  const AuthStateModel({
    this.isLoading = true,
    this.userId,
    this.user,
    this.error,
  });

  final bool isLoading;
  final String? userId;
  final TraderUser? user;
  final String? error;

  bool get isAuthenticated => userId != null;

  AuthStateModel copyWith({
    bool? isLoading,
    String? userId,
    TraderUser? user,
    String? error,
    bool clearError = false,
  }) {
    return AuthStateModel(
      isLoading: isLoading ?? this.isLoading,
      userId: userId ?? this.userId,
      user: user ?? this.user,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthStateModel>((ref) {
  return AuthController(ref);
});

class AuthController extends StateNotifier<AuthStateModel> {
  AuthController(this._ref) : super(const AuthStateModel()) {
    _init();
  }

  final Ref _ref;
  StreamSubscription<AuthState>? _sub;

  AuthService get _auth => _ref.read(authServiceProvider);

  Future<void> _init() async {
    if (!_auth.isConfigured) {
      state = const AuthStateModel(isLoading: false);
      return;
    }

    final session = await _auth.getSession();
    if (session?.user != null) {
      await _applySession(session!.user);
    } else {
      state = const AuthStateModel(isLoading: false);
    }

    _sub = _auth.authStateChanges.listen((event) async {
      final user = event.session?.user;
      if (user != null) {
        await _applySession(user);
      } else {
        await _ref.read(traderRepositoryProvider).clear();
        state = const AuthStateModel(isLoading: false);
      }
    });
  }

  Future<void> _applySession(User user) async {
    final traderUser = _auth.userFromSession(user);
    state = AuthStateModel(
      isLoading: false,
      userId: user.id,
      user: traderUser,
    );

    final notifier = _ref.read(traderSnapshotProvider.notifier);
    await notifier.init();
    await notifier.loadForUser(user.id);

    await _ref.read(traderSnapshotProvider.notifier).update((snapshot) {
      return snapshot.copyWith(
        user: traderUser.copyWith(
          trialStartDate: snapshot.user?.trialStartDate ??
              DateTime.now().toIso8601String(),
        ),
      );
    });
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      await _auth.signInWithEmail(email, password);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> signUp(String email, String password, String name) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      await _auth.signUpWithEmail(email, password, name: name);
      state = state.copyWith(
        isLoading: false,
        error: 'Check your email to confirm signup, then sign in.',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      await _auth.resetPassword(email);
      state = state.copyWith(error: 'Password reset email sent.');
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> signOut() async {
    await _auth.signOut();
    await _ref.read(traderRepositoryProvider).clear();
    state = const AuthStateModel(isLoading: false);
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
