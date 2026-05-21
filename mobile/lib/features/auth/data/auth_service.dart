import 'package:perfect_trader_mobile/core/constants/app_constants.dart';
import 'package:perfect_trader_mobile/core/errors/app_exception.dart' as app_errors;
import 'package:perfect_trader_mobile/data/remote/supabase_config.dart';
import 'package:perfect_trader_mobile/domain/entities/trading.dart';
import 'package:supabase_flutter/supabase_flutter.dart' as supa;

class AuthService {
  AuthService(this._client);

  final supa.SupabaseClient? _client;

  bool get isConfigured => SupabaseConfig.isConfigured && _client != null;

  Stream<supa.AuthState> get authStateChanges {
    final client = _client;
    if (client == null) return const Stream.empty();
    return client.auth.onAuthStateChange;
  }

  Future<supa.Session?> getSession() async {
    final client = _client;
    if (client == null) return null;
    return client.auth.currentSession;
  }

  TraderUser userFromSession(supa.User user) {
    final email = user.email ?? '';
    final isPro = AppConstants.allowedProEmails
        .map((e) => e.toLowerCase())
        .contains(email.toLowerCase());
    return TraderUser(
      email: email,
      name: user.userMetadata?['full_name'] as String? ?? 'Trader',
      isPro: isPro,
      isAdmin: isPro && email.toLowerCase() == 'niketpatil1624@gmail.com',
    );
  }

  Future<void> signInWithEmail(String email, String password) async {
    final client = _client;
    if (client == null) {
      throw const app_errors.ConfigException(
        'Supabase is not configured. Add keys to mobile/.env',
      );
    }
    try {
      await client.auth.signInWithPassword(email: email, password: password);
    } on supa.AuthException catch (e) {
      throw app_errors.AuthException(e.message);
    }
  }

  Future<void> signUpWithEmail(String email, String password, {String? name}) async {
    final client = _client;
    if (client == null) {
      throw const app_errors.ConfigException(
        'Supabase is not configured. Add keys to mobile/.env',
      );
    }
    try {
      await client.auth.signUp(
        email: email,
        password: password,
        data: name != null ? {'full_name': name} : null,
      );
    } on supa.AuthException catch (e) {
      throw app_errors.AuthException(e.message);
    }
  }

  Future<void> resetPassword(String email) async {
    final client = _client;
    if (client == null) {
      throw const app_errors.ConfigException('Supabase is not configured');
    }
    await client.auth.resetPasswordForEmail(email);
  }

  Future<void> signOut() async {
    final client = _client;
    if (client == null) return;
    await client.auth.signOut();
  }
}
