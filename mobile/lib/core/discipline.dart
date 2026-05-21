/// Discipline scoring — mirrors src/lib/discipline.ts.

typedef DisciplineGrade = String; // A | B | C | D | F | None

int calculateRuleChecklistScore(int activeRuleCount, int rulesCheckedCount) {
  if (activeRuleCount <= 0) return 0;
  return ((rulesCheckedCount / activeRuleCount) * 100).round();
}

int calculateDailyComplianceScore({
  required int activeRuleCount,
  required int rulesCheckedCount,
  bool hasPrePlan = false,
  bool hasPostNote = false,
}) {
  if (activeRuleCount <= 0 && !hasPrePlan && !hasPostNote) return 0;

  final rulesPart =
      activeRuleCount > 0 ? (rulesCheckedCount / activeRuleCount) * 50 : 0.0;
  final prePart = hasPrePlan ? 25.0 : 0.0;
  final postPart = hasPostNote ? 25.0 : 0.0;

  return (rulesPart + prePart + postPart).round().clamp(0, 100);
}

DisciplineGrade scoreToGrade(int score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score > 0) return 'F';
  return 'None';
}

const int streakComplianceThreshold = 75;
