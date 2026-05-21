class UserEntity {
  const UserEntity({
    required this.email,
    required this.name,
    this.isPro = false,
    this.isAdmin = false,
    this.role,
    this.trialStartDate,
  });

  final String email;
  final String name;
  final bool isPro;
  final bool isAdmin;
  final String? role;
  final String? trialStartDate;

  UserEntity copyWith({
    String? email,
    String? name,
    bool? isPro,
    bool? isAdmin,
    String? role,
    String? trialStartDate,
  }) {
    return UserEntity(
      email: email ?? this.email,
      name: name ?? this.name,
      isPro: isPro ?? this.isPro,
      isAdmin: isAdmin ?? this.isAdmin,
      role: role ?? this.role,
      trialStartDate: trialStartDate ?? this.trialStartDate,
    );
  }

  Map<String, dynamic> toJson() => {
        'email': email,
        'name': name,
        'isPro': isPro,
        if (isAdmin) 'isAdmin': isAdmin,
        if (role != null) 'role': role,
        if (trialStartDate != null) 'trialStartDate': trialStartDate,
      };

  factory UserEntity.fromJson(Map<String, dynamic> json) {
    return UserEntity(
      email: json['email'] as String? ?? '',
      name: json['name'] as String? ?? 'Trader',
      isPro: json['isPro'] as bool? ?? false,
      isAdmin: json['isAdmin'] as bool? ?? false,
      role: json['role'] as String?,
      trialStartDate: json['trialStartDate'] as String?,
    );
  }
}
