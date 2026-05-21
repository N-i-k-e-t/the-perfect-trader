import 'baseline_state.dart';

class SessionEntity {
  const SessionEntity({
    required this.date,
    this.emotionalBaseline = 'neutral',
    this.rulesLocked = false,
    this.tradesTaken = 0,
    this.tradesAllowed = 3,
    this.stabilityScore = 85,
    this.preSessionComplete = false,
    this.notes = '',
  });

  final String date;
  final BaselineState emotionalBaseline;
  final bool rulesLocked;
  final int tradesTaken;
  final int tradesAllowed;
  final int stabilityScore;
  final bool preSessionComplete;
  final String notes;

  SessionEntity copyWith({
    String? date,
    BaselineState? emotionalBaseline,
    bool? rulesLocked,
    int? tradesTaken,
    int? tradesAllowed,
    int? stabilityScore,
    bool? preSessionComplete,
    String? notes,
  }) {
    return SessionEntity(
      date: date ?? this.date,
      emotionalBaseline: emotionalBaseline ?? this.emotionalBaseline,
      rulesLocked: rulesLocked ?? this.rulesLocked,
      tradesTaken: tradesTaken ?? this.tradesTaken,
      tradesAllowed: tradesAllowed ?? this.tradesAllowed,
      stabilityScore: stabilityScore ?? this.stabilityScore,
      preSessionComplete: preSessionComplete ?? this.preSessionComplete,
      notes: notes ?? this.notes,
    );
  }

  Map<String, dynamic> toJson() => {
        'date': date,
        'emotionalBaseline': emotionalBaseline,
        'rulesLocked': rulesLocked,
        'tradesTaken': tradesTaken,
        'tradesAllowed': tradesAllowed,
        'stabilityScore': stabilityScore,
        'preSessionComplete': preSessionComplete,
        'notes': notes,
      };

  factory SessionEntity.fromJson(Map<String, dynamic> json) {
    return SessionEntity(
      date: json['date'] as String? ?? '',
      emotionalBaseline: json['emotionalBaseline'] as String? ?? 'neutral',
      rulesLocked: json['rulesLocked'] as bool? ?? false,
      tradesTaken: json['tradesTaken'] as int? ?? 0,
      tradesAllowed: json['tradesAllowed'] as int? ?? 3,
      stabilityScore: json['stabilityScore'] as int? ?? 85,
      preSessionComplete: json['preSessionComplete'] as bool? ?? false,
      notes: json['notes'] as String? ?? '',
    );
  }
}
