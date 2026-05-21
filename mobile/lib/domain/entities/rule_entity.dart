class RuleEntity {
  const RuleEntity({
    required this.id,
    required this.text,
    this.emoji,
    this.category,
    this.isActive = true,
    this.violated,
  });

  final String id;
  final String text;
  final String? emoji;
  final String? category;
  final bool isActive;
  final bool? violated;

  RuleEntity copyWith({
    String? id,
    String? text,
    String? emoji,
    String? category,
    bool? isActive,
    bool? violated,
  }) {
    return RuleEntity(
      id: id ?? this.id,
      text: text ?? this.text,
      emoji: emoji ?? this.emoji,
      category: category ?? this.category,
      isActive: isActive ?? this.isActive,
      violated: violated ?? this.violated,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'text': text,
        if (emoji != null) 'emoji': emoji,
        if (category != null) 'category': category,
        'isActive': isActive,
        if (violated != null) 'violated': violated,
      };

  factory RuleEntity.fromJson(Map<String, dynamic> json) {
    return RuleEntity(
      id: json['id'] as String? ?? '',
      text: json['text'] as String? ?? '',
      emoji: json['emoji'] as String?,
      category: json['category'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      violated: json['violated'] as bool?,
    );
  }
}
