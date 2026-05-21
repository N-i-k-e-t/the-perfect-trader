class AnalyticsEntity {
  const AnalyticsEntity({
    this.weeklyStability = const [72, 85, 68, 91, 88, 79, 85],
    this.ruleAdherence = 82,
    this.avgTradesPerDay = 2.3,
    this.behavioralTrend = 'stabilizing',
    this.consistencyDays = 4,
    this.primaryDeviation = 'Impulse entry after win',
    this.indisciplineCost = 14200,
  });

  final List<int> weeklyStability;
  final int ruleAdherence;
  final double avgTradesPerDay;
  final String behavioralTrend;
  final int consistencyDays;
  final String primaryDeviation;
  final double indisciplineCost;

  Map<String, dynamic> toJson() => {
        'weeklyStability': weeklyStability,
        'ruleAdherence': ruleAdherence,
        'avgTradesPerDay': avgTradesPerDay,
        'behavioralTrend': behavioralTrend,
        'consistencyDays': consistencyDays,
        'primaryDeviation': primaryDeviation,
        'indisciplineCost': indisciplineCost,
      };

  factory AnalyticsEntity.fromJson(Map<String, dynamic> json) {
    return AnalyticsEntity(
      weeklyStability: (json['weeklyStability'] as List<dynamic>?)
              ?.map((e) => (e as num).toInt())
              .toList() ??
          const [72, 85, 68, 91, 88, 79, 85],
      ruleAdherence: json['ruleAdherence'] as int? ?? 82,
      avgTradesPerDay: (json['avgTradesPerDay'] as num?)?.toDouble() ?? 2.3,
      behavioralTrend: json['behavioralTrend'] as String? ?? 'stabilizing',
      consistencyDays: json['consistencyDays'] as int? ?? 4,
      primaryDeviation:
          json['primaryDeviation'] as String? ?? 'Impulse entry after win',
      indisciplineCost: (json['indisciplineCost'] as num?)?.toDouble() ?? 0,
    );
  }
}
