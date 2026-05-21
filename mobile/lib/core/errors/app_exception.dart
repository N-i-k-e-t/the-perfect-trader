sealed class AppException implements Exception {
  const AppException(this.message);
  final String message;

  @override
  String toString() => message;
}

final class AuthException extends AppException {
  const AuthException(super.message);
}

final class SyncException extends AppException {
  const SyncException(super.message);
}

final class ConfigException extends AppException {
  const ConfigException(super.message);
}
