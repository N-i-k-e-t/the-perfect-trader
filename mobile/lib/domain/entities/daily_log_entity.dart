class DailyLogEntity {
  const DailyLogEntity({
    required this.date,
    this.tradesLogged = 0,
    this.rulesChecked = const [],
    this.mood = 'neutral',
    this.rulesFollowed = 0,
    this.rulesBroken = 0,
    this.pnl,
    this.hasPrePlan,
    this.hasPostNote,
    this.complianceScore,
    this.grade,
    this.events = const [],
  });

  final String date;
  final int tradesLogged;
  final List<String> rulesChecked;
  final String mood;
  final int rulesFollowed;
  final int rulesBroken;
  final double? pnl;
  final bool? hasPrePlan;
  final bool? hasPostNote;
  final int? complianceScore;
  final String? grade;
  final List<String> events;

  DailyLogEntity copyWith({
    String? date,
    int? tradesLogged,
    List<String>? rulesChecked,
    String? mood,
    int? rulesFollowed,
    int? rulesBroken,
    double? pnl,
    bool? hasPrePlan,
    bool? hasPostNote,
    int? complianceScore,
    String? grade,
    List<String>? events,
  }) {
    return DailyLogEntity(
      date: date ?? this.date,
      tradesLogged: tradesLogged ?? this.tradesLogged,
      rulesChecked: rulesChecked ?? this.rulesChecked,
      mood: mood ?? this.mood,
      rulesFollowed: rulesFollowed ?? this.rulesFollowed,
      rulesBroken: rulesBroken ?? this.rulesBroken,
      pnl: pnl ?? this.pnl,
      hasPrePlan: hasPrePlan ?? this.hasPrePlan,
      hasPostNote: hasPostNote ?? this.hasPostNote,
      complianceScore: complianceScore ?? this.complianceScore,
      grade: grade ?? this.grade,
      events: events ?? this.events,
    );
  }

  Map<String, dynamic> toJson() => {
        'date': date,
        'tradesLogged': tradesLogged,
        'rulesChecked': rulesChecked,
        'mood': mood,
        'rulesFollowed': rulesFollowed,
        'rulesBroken': rulesBroken,
        if (pnl != null) 'pnl': pnl,
        if (hasPrePlan != null) 'hasPrePlan': hasPrePlan,
        if (hasPostNote != null) 'hasPostNote': hasPostNote,
        if (complianceScore != null) 'complianceScore': complianceScore,
        if (grade != null) 'grade': grade,
        if (events.isNotEmpty) 'events': events,
      };

  factory DailyLogEntity.fromJson(Map<String, dynamic> json) {
    return DailyLogEntity(
      date: json['date'] as String? ?? '',
      tradesLogged: json['tradesLogged'] as int? ?? 0,
      rulesChecked: (json['rulesChecked'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      mood: json['mood'] as String? ?? 'neutral',
      rulesFollowed: json['rulesFollowed'] as int? ?? 0,
      rulesBroken: json['rulesBroken'] as int? ?? 0,
      pnl: (json['pnl'] as num?)?.toDouble(),
      hasPrePlan: json['hasPrePlan'] as bool?,
      hasPostNote: json['hasPostNote'] as bool?,
      complianceScore: json['complianceScore'] as int?,
      grade: json['grade'] as String?,
      events: (json['events'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }
}
